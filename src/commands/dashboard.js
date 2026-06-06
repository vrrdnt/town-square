import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import { getEdition } from "../botcData.js";
import {
  activeTravellers,
  livingPlayerIds,
  requireStoryteller,
} from "../commandUtils.js";

function phaseLabel(state) {
  if (state.phase === "night") return `Night ${state.currentNight || 1}`;
  if (state.phase === "day") return `Day ${state.currentDay || 1}`;
  if (state.phase === "setup_pending") return "Setup pending";
  return "Setup complete";
}

function quickButton(customId, label, style = ButtonStyle.Secondary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

function dashboardButtons(state) {
  if (!state.categoryId) return [];

  const buttons =
    state.phase === "night"
      ? [
          quickButton("quick:day", "Start Day", ButtonStyle.Primary),
          quickButton("quick:nightguide", "Night Guide"),
          quickButton("quick:status", "Status"),
        ]
      : [
          quickButton("quick:nightguide", "Night Guide"),
          quickButton("quick:night", "Start Night", ButtonStyle.Primary),
          quickButton("quick:status", "Status"),
        ];

  return [new ActionRowBuilder().addComponents(...buttons)];
}

export default {
  data: new SlashCommandBuilder()
    .setName("dashboard")
    .setDescription("Shows Storyteller controls for the current game."),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const living = livingPlayerIds(state).length;
    const travellers = activeTravellers(state).length;
    const nextStep = !state.categoryId
      ? "Review the setup prompt and press Proceed."
      : state.phase === "night"
        ? "Use Start Day when night actions are resolved."
        : "Use Night Guide, then Start Night when town should sleep.";

    await interaction.reply({
      content: [
        `Storyteller dashboard - ${getEdition(state.editionId).name}`,
        `Phase: ${phaseLabel(state)}`,
        `Living non-Travellers: ${living}/${state.players.length}`,
        `Active Travellers: ${travellers}`,
        `Next: ${nextStep}`,
      ].join("\n"),
      components: dashboardButtons(state),
      ephemeral: true,
    });
  },
};
