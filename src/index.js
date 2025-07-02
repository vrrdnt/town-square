import {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
  PermissionsBitField,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

client.commands = new Collection();
client.session = new Map();

// Load commands
const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath)) {
  const command = (await import(path.join(commandsPath, file))).default;
  client.commands.set(command.data.name, command);
}

// Slash command handling
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error("Error running command:", err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "There was an error." });
      } else {
        await interaction.reply({
          content: "There was an error.",
          ephemeral: true,
        });
      }
    }
  }

  if (interaction.isButton()) {
    const state = client.session.get(interaction.guild.id);
    if (!state) return;

    if (interaction.customId === "cancelSetup") {
      await interaction.deferUpdate();
      client.session.delete(interaction.guild.id);
      await interaction.editReply({
        content: "❌ Setup cancelled.",
        components: [],
      });
      return;
    }

    if (interaction.customId === "proceedSetup") {
      await interaction.deferUpdate();

      const storytellerRole = interaction.guild.roles.cache.find(
        (r) => r.name === "Storyteller"
      );

      // Create category with soundboard perms
      const category = await interaction.guild.channels.create({
        name: "Ravenswood Bluff",
        type: 4,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.UseSoundboard],
          },
          {
            id: storytellerRole.id,
            allow: [PermissionsBitField.Flags.UseSoundboard],
          },
        ],
      });

      // Create logging channel with bot access
      const logChannel = await interaction.guild.channels.create({
        name: "town-square-log",
        type: 0,
        parent: category.id,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone.id, deny: ["ViewChannel"] },
          { id: client.user.id, allow: ["ViewChannel", "SendMessages"] },
        ],
      });

      // Create town square VC
      const townSquare = await interaction.guild.channels.create({
        name: "Town Square",
        type: 2,
        parent: category.id,
      });

      state.categoryId = category.id;
      state.townSquareId = townSquare.id;
      state.logChannelId = logChannel.id;

      // If evil knows, create the read-only hell channel
      if (state.evilPlayers.length > 0) {
        const evilChannel = await interaction.guild.channels.create({
          name: "hell",
          type: 0,
          topic: "This channel lists the minions and demons.",
          parent: category.id,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone.id, deny: ["ViewChannel"] },
            ...state.evilPlayers.map((uid) => ({
              id: uid,
              allow: ["ViewChannel", "ReadMessageHistory"],
              deny: ["SendMessages"],
            })),
            { id: state.gm, allow: ["ViewChannel", "SendMessages"] },
            { id: client.user.id, allow: ["ViewChannel", "SendMessages"] },
          ],
        });
        state.evilChannelId = evilChannel.id;

        await evilChannel.send(`😈 **Welcome to Hell.**  
The evil team in this game is:

${state.evilPlayers.map((id) => `<@${id}>`).join("\n")}`);
      }

      client.session.set(interaction.guild.id, state);

      await interaction.editReply({
        content: "✅ Ravenswood Bluff is ready.",
        components: [],
      });
      await logChannel.send("✅ Setup complete. Ravenswood Bluff is open.");
    }
  }
});

// Login
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});
client.login(process.env.BOT_TOKEN);
