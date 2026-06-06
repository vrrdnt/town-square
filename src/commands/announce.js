import { SlashCommandBuilder } from "discord.js";
import {
  activeTravellerIds,
  getLogChannel,
  livingPlayerIds,
  livingParticipantIds,
  requireStoryteller,
} from "../commandUtils.js";

function phaseLabel(state) {
  if (state.phase === "night") return `Night ${state.currentNight || 1}`;
  if (state.phase === "day") return `Day ${state.currentDay || 1}`;
  return "Setup";
}

export default {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announces the current phase and living player count."),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const livingResidents = livingPlayerIds(state).length;
    const livingParticipants = livingParticipantIds(state).length;
    const activeTravellers = activeTravellerIds(state).length;
    const travellerText = activeTravellers
      ? ` ${activeTravellers} active Traveller(s); ${livingParticipants} total living participant(s).`
      : "";
    const message = `${phaseLabel(state)}: ${livingResidents} living non-Traveller player(s) remain.${travellerText}`;

    await interaction.reply({ content: message, ephemeral: false });

    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(message);
  },
};
