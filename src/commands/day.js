import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("day")
    .setDescription("Moves all players back to the Town Square."),
  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state || !state.townSquareId)
      return interaction.reply({ content: "No active session.", ephemeral: true });

    const logChannel = await interaction.guild.channels.fetch(state.logChannelId);
    await logChannel.send("🌞 Day breaks. Bringing everyone back to the Town Square.");

    for (const uid of state.players) {
      const member = await interaction.guild.members.fetch(uid);
      await member.voice.setChannel(state.townSquareId);
      await logChannel.send(`Returned <@${member.id}> to Town Square.`);
    }

    await interaction.reply({ content: "🌞 All players returned to Town Square.", ephemeral: true });
  }
};
