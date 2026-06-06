import { SlashCommandBuilder } from "discord.js";
import {
  getLogChannel,
  isActiveParticipant,
  requireStoryteller,
  restoreNickname,
  save,
} from "../commandUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("alive")
    .setDescription("Marks a dead player as alive again.")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The player to mark as alive")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const target = interaction.options.getUser("player");
    if (!isActiveParticipant(state, target.id)) {
      return interaction.reply({
        content: "That user is not an active player or Traveller.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    state.deadPlayers = (state.deadPlayers || []).filter((id) => id !== target.id);
    if (state.ghostVotes) delete state.ghostVotes[target.id];

    const member = await interaction.guild.members
      .fetch(target.id)
      .catch(() => null);
    if (member) {
      await restoreNickname(member, state).catch((error) => {
        console.error(`Failed to restore nickname for ${target.tag}:`, error);
      });
    }

    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(`<@${target.id}> has been restored to life.`);
    save(interaction, client, state);

    await interaction.editReply({
      content: `<@${target.id}> is now marked as alive.`,
    });
  },
};
