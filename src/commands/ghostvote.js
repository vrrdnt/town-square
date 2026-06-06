import { SlashCommandBuilder } from "discord.js";
import {
  getLogChannel,
  isActiveParticipant,
  requireStoryteller,
  save,
} from "../commandUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ghostvote")
    .setDescription("Updates a dead player's ghost vote.")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The dead player")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("available")
        .setDescription("Whether their ghost vote is still available")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const player = interaction.options.getUser("player");
    const available = interaction.options.getBoolean("available");

    if (!isActiveParticipant(state, player.id)) {
      return interaction.reply({
        content: "That user is not an active player or Traveller.",
        ephemeral: true,
      });
    }

    if (!(state.deadPlayers || []).includes(player.id)) {
      return interaction.reply({
        content: "Only dead players have ghost votes.",
        ephemeral: true,
      });
    }

    state.ghostVotes ||= {};
    state.ghostVotes[player.id] = available;
    save(interaction, client, state);

    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(
      `<@${player.id}> ghost vote marked ${available ? "available" : "spent"}.`
    );

    await interaction.reply({
      content: `<@${player.id}> ghost vote is now ${
        available ? "available" : "spent"
      }.`,
      ephemeral: true,
    });
  },
};
