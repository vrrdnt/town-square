import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection();
client.session = new Map(); // per guild: { gm, players, evilPlayers, categoryId, townSquareId, evilChannelId, logChannelId, roles }

const commands = [];
const commandsPath = path.resolve("./src/commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
await rest.put(
  Routes.applicationGuildCommands((await client.login(process.env.BOT_TOKEN)) && client.user.id, process.env.DEV_GUILD_ID),
  { body: commands }
);

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error("Error running command:", err);
      await interaction.reply({ content: "There was an error.", ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    const { guildId, user } = interaction;
    const state = client.session.get(guildId);
    if (!state || user.id !== state.gm) {
      return interaction.reply({ content: "Only the Storyteller can confirm or cancel.", ephemeral: true });
    }

    if (interaction.customId === "cancelSetup") {
      client.session.delete(guildId);
      return interaction.update({ content: "❌ Setup cancelled.", components: [] });
    }

    if (interaction.customId === "proceedSetup") {
      const category = await interaction.guild.channels.create({
        name: "Ravenswood Bluff",
        type: 4
      });

      const townSquare = await interaction.guild.channels.create({
        name: "Town Square",
        type: 2,
        parent: category.id
      });

      let evilChannelId = null;
      if (state.evilPlayers.length) {
        const evilChannel = await interaction.guild.channels.create({
          name: "Hell",
          type: 0,
          parent: category.id,
          topic: "This channel is for the minions and demons, if the Storyteller allowed it.",
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone, deny: ["ViewChannel"] },
            ...state.evilPlayers.map(uid => ({ id: uid, allow: ["ViewChannel"] })),
            { id: state.gm, allow: ["ViewChannel"] }
          ]
        });
        evilChannelId = evilChannel.id;
      }

      const logChannel = await interaction.guild.channels.create({
        name: "town-square-log",
        type: 0,
        parent: category.id,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: ["ViewChannel"] },
          { id: state.gm, allow: ["ViewChannel"] }
        ]
      });

      state.categoryId = category.id;
      state.townSquareId = townSquare.id;
      state.evilChannelId = evilChannelId;
      state.logChannelId = logChannel.id;
      client.session.set(guildId, state);

      await logChannel.send(`📝 Setup complete. Players: ${state.players.map(p => `<@${p}>`).join(" ")}
${state.evilPlayers.length ? "Evil Players: " + state.evilPlayers.map(p => `<@${p}>`).join(" ") : ""}`);

      await interaction.update({ content: "✅ Ravenswood Bluff is ready.", components: [] });
    }
  }
});

client.once("ready", () => console.log(`✅ Logged in as ${client.user.tag}`));
