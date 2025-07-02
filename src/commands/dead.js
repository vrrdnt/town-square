import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dead")
    .setDescription("Marks a player as dead.")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The player to mark as dead")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state)
      return interaction.reply({
        content: "No active session.",
        ephemeral: true,
      });

    if (interaction.user.id !== state.gm)
      return interaction.reply({
        content: "Only the Storyteller can mark players as dead.",
        ephemeral: true,
      });

    const player = interaction.options.getUser("player");
    if (!state.players.includes(player.id))
      return interaction.reply({
        content: "That user is not a registered player.",
        ephemeral: true,
      });

    if (state.deadPlayers.includes(player.id))
      return interaction.reply({
        content: "That player is already marked as dead.",
        ephemeral: true,
      });

    state.deadPlayers.push(player.id);
    client.session.set(interaction.guild.id, state);

    const member = await interaction.guild.members.fetch(player.id);
    await member.setNickname(`(💀) ${member.user.username}`);

    const logChannel = await interaction.guild.channels.fetch(
      state.logChannelId
    );
    await logChannel.send(`💀 Marked <@${player.id}> as dead.`);

    await interaction.reply({
      content: `💀 <@${player.id}> is now dead.`,
      ephemeral: true,
    });
  },
};
