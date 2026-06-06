import { SlashCommandBuilder } from "discord.js";
import {
  activeParticipantIds,
  findTraveller,
  getLogChannel,
  livingParticipantIds,
  requireStoryteller,
  save,
} from "../commandUtils.js";

function todayKey(state) {
  return String(state.currentDay || 1);
}

function currentNominations(state) {
  state.nominations ||= {};
  state.nominations[todayKey(state)] ||= [];
  return state.nominations[todayKey(state)];
}

function nominationSummary(nominations, threshold) {
  const eligible = nominations
    .filter((nomination) => nomination.votes >= threshold)
    .sort((left, right) => right.votes - left.votes);

  if (!eligible.length) return "No player is on the block.";

  const leader = eligible[0];
  return `<@${leader.target}> is on the block with ${leader.votes} vote(s).`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("nominate")
    .setDescription("Records a nomination and vote count for the current day.")
    .addUserOption((option) =>
      option
        .setName("nominator")
        .setDescription("The nominating player")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The nominated player")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("votes")
        .setDescription("Votes counted by the Storyteller")
        .setMinValue(0)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    if (state.phase !== "day") {
      return interaction.reply({
        content: "Nominations can only be recorded during the day.",
        ephemeral: true,
      });
    }

    const nominator = interaction.options.getUser("nominator");
    const target = interaction.options.getUser("target");
    const votes = interaction.options.getInteger("votes");
    const participants = activeParticipantIds(state);

    if (!participants.includes(nominator.id)) {
      return interaction.reply({
        content: "The nominator must be an active player or Traveller.",
        ephemeral: true,
      });
    }

    if (findTraveller(state, target.id)) {
      return interaction.reply({
        content: "Travellers are exiled instead of nominated for execution. Use /traveller exile.",
        ephemeral: true,
      });
    }

    if (!state.players.includes(target.id)) {
      return interaction.reply({
        content: "The target must be a registered non-Traveller player.",
        ephemeral: true,
      });
    }

    if (votes > participants.length) {
      return interaction.reply({
        content: `Vote count cannot exceed the ${participants.length} active players and Travellers.`,
        ephemeral: true,
      });
    }

    const living = livingParticipantIds(state);
    if (!living.includes(target.id)) {
      return interaction.reply({
        content: "Only living players can be nominated.",
        ephemeral: true,
      });
    }

    const nominations = currentNominations(state);
    if (nominations.some((nomination) => nomination.nominator === nominator.id)) {
      return interaction.reply({
        content: "That player has already nominated today.",
        ephemeral: true,
      });
    }
    if (nominations.some((nomination) => nomination.target === target.id)) {
      return interaction.reply({
        content: "That player has already been nominated today.",
        ephemeral: true,
      });
    }

    const threshold = Math.ceil(living.length / 2);
    nominations.push({
      nominator: nominator.id,
      target: target.id,
      votes,
      threshold,
      day: state.currentDay,
    });

    const summary = nominationSummary(nominations, threshold);
    const message = `<@${nominator.id}> nominated <@${target.id}>: ${votes} vote(s). Threshold is ${threshold}. ${summary}`;

    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(message);
    save(interaction, client, state);

    await interaction.reply({ content: message, ephemeral: true });
  },
};
