import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const creativeNames = [
  "Dark Alley", "Library", "Graveyard", "Chapel", "Butcher Shop",
  "Alchemist's Hut", "Tower Room", "Secret Garden", "Smithy",
  "Caves", "Watchtower", "Tavern", "Crypt", "Bell Tower",
  "Courtyard", "Wine Cellar"
];

export default {
  data: new SlashCommandBuilder()
    .setName("night")
    .setDescription("Moves each player to a private voice channel."),
  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state || !state.categoryId)
      return interaction.reply({ content: "No active session.", ephemeral: true });

    const logChannel = await interaction.guild.channels.fetch(state.logChannelId);
    await logChannel.send("🌙 Night falls on Ravenswood Bluff. Moving players to private VCs...");

    const privateChannels = await Promise.all(state.players.map(async (uid, idx) => {
      return interaction.guild.channels.create({
        name: creativeNames[idx % creativeNames.length],
        type: 2,
        parent: state.categoryId,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: uid, allow: [PermissionFlagsBits.ViewChannel] },
          { id: state.gm, allow: [PermissionFlagsBits.ViewChannel] }
        ]
      });
    }));

    for (let i = 0; i < state.players.length; i++) {
      const member = await interaction.guild.members.fetch(state.players[i]);
      await member.voice.setChannel(privateChannels[i]);
      await logChannel.send(`Moved <@${member.id}> to ${privateChannels[i].name}.`);
    }

    await interaction.reply({ content: "🌙 Players moved to private locations.", ephemeral: true });
  }
};
