import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows the current game state."),
  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state)
      return interaction.reply({ content: "There is no active game session.", ephemeral: true });

    const summary = `🎩 **Storyteller:** <@${state.gm}>
👥 **Players:** ${state.players.map(p => `<@${p}>`).join(" ")}
${state.evilPlayers.length ? `😈 **Evil Players:** ${state.evilPlayers.map(p => `<@${p}>`).join(" ")}` : ""}
🏰 **Category:** ${state.categoryId}
📢 **Town Square:** ${state.townSquareId}
🔥 **Hell:** ${state.evilChannelId ?? "N/A"}
📝 **Log:** ${state.logChannelId}`;

    await interaction.reply({ content: summary, ephemeral: true });
  }
};
