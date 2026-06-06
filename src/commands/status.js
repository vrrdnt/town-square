import { SlashCommandBuilder } from "discord.js";
import { getEdition, getFabled, publicCharacterName } from "../botcData.js";
import {
  activeTravellers,
  livingParticipantIds,
  livingPlayerIds,
  requireSession,
} from "../commandUtils.js";

function formatPhase(state) {
  if (state.phase === "night") return `Night ${state.currentNight || 1}`;
  if (state.phase === "day") return `Day ${state.currentDay || 1}`;
  if (state.phase === "setup_pending") return "Setup pending";
  return "Setup complete";
}

function storytellerDetails(state) {
  const assignments = state.assignments
    ? state.players
        .map(
          (playerId) =>
            `<@${playerId}>: ${publicCharacterName(state.assignments[playerId])}`
        )
        .join("\n")
    : "No character assignments recorded.";

  const travellers = state.travellers?.length
    ? state.travellers
        .map((traveller) => {
          const status = traveller.exiled
            ? "exiled"
            : (state.deadPlayers || []).includes(traveller.playerId)
              ? "dead"
              : "alive";
          return `<@${traveller.playerId}>: ${traveller.alignment} ${traveller.character.name} (${status})`;
        })
        .join("\n")
    : "No Travellers.";

  const deadPlayers = state.deadPlayers || [];
  const ghostVotes = deadPlayers.length
    ? deadPlayers
        .map(
          (playerId) =>
            `<@${playerId}>: ${
              state.ghostVotes?.[playerId] ? "ghost vote available" : "ghost vote spent"
            }`
        )
        .join("\n")
    : "No dead players.";

  const today = String(state.currentDay || 1);
  const nominations = state.nominations?.[today]?.length
    ? state.nominations[today]
        .map(
          (nomination) =>
            `<@${nomination.nominator}> -> <@${nomination.target}>: ${nomination.votes} vote(s)`
        )
        .join("\n")
    : "No nominations recorded today.";

  return `\n\nStoryteller view:\n${assignments}\n\nTravellers:\n${travellers}\n\nGhost votes:\n${ghostVotes}\n\nNominations:\n${nominations}`;
}

function publicTravellerSummary(state) {
  if (!state.travellers?.length) return "none";
  return state.travellers
    .map((traveller) => {
      const status = traveller.exiled
        ? "exiled"
        : (state.deadPlayers || []).includes(traveller.playerId)
          ? "dead"
          : "alive";
      return `<@${traveller.playerId}> as ${traveller.character.name} (${status})`;
    })
    .join("; ");
}

function publicFabledSummary(state) {
  if (!state.fabled?.length) return "none";
  return state.fabled
    .map((fabledId) => getFabled(fabledId)?.name || fabledId)
    .join(", ");
}

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows the current game state."),

  async execute(interaction, client) {
    const state = await requireSession(interaction, client);
    if (!state) return;

    const living = livingPlayerIds(state);
    const activeTravellerCount = activeTravellers(state).length;
    const livingParticipants = livingParticipantIds(state).length;
    const publicSummary = [
      `Storyteller: <@${state.gm}>`,
      `Edition: ${getEdition(state.editionId).name}`,
      `Phase: ${formatPhase(state)}`,
      `Living non-Travellers: ${living.length}/${state.players.length}`,
      `Living participants: ${livingParticipants} (${activeTravellerCount} active Traveller(s))`,
      `Dead players: ${
        (state.deadPlayers || []).length
          ? (state.deadPlayers || []).map((playerId) => `<@${playerId}>`).join(" ")
          : "none"
      }`,
      `Travellers: ${publicTravellerSummary(state)}`,
      `Fabled: ${publicFabledSummary(state)}`,
    ].join("\n");

    const isStoryteller = interaction.user.id === state.gm;
    await interaction.reply({
      content: `${publicSummary}${isStoryteller ? storytellerDetails(state) : ""}`,
      ephemeral: true,
    });
  },
};
