import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription(
      "Announces the current day, phase, and number of living players."
    ),
  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state)
      return interaction.reply({
        content: "No active session.",
        ephemeral: true,
      });

    const living = state.players.length - state.deadPlayers.length;
    const message = `🕜 ${state.phase === "day" ? "Day" : "Night"} ${
      state.currentDay
    } — ${living} living players remain.`;

    await interaction.reply({ content: message, ephemeral: false });

    const logChannel = await interaction.guild.channels.fetch(
      state.logChannelId
    );
    await logChannel.send(message);
  },
};
