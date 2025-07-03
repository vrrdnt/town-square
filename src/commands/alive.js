import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("alive")
    .setDescription(
      "Marks a player as alive again and restores their nickname."
    )
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The player to mark as alive")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const state = client.session.get(interaction.guild.id);
    if (!state) {
      return await interaction.editReply({
        content: "No game is currently running.",
      });
    }

    const target = interaction.options.getUser("player");
    if (!state.players.includes(target.id)) {
      return await interaction.editReply({
        content: "That user is not part of the current game.",
      });
    }

    // Remove from deadPlayers if present
    state.deadPlayers = state.deadPlayers.filter((id) => id !== target.id);

    // Try resetting nickname
    const member = await interaction.guild.members
      .fetch(target.id)
      .catch(() => null);
    if (member) {
      try {
        await member.setNickname(null);
      } catch (err) {
        console.error(`Failed to restore nickname for ${target.tag}:`, err);
      }
    }

    // Log to logging channel
    if (state.logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(
        state.logChannelId
      );
      if (logChannel) {
        await logChannel.send(
          `✨ <@${target.id}> has been restored to life by the Storyteller.`
        );
      }
    }

    await interaction.editReply({
      content: `✅ <@${target.id}> is now marked as alive.`,
    });
  },
};
