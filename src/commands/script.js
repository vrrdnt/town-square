import { SlashCommandBuilder } from "discord.js";
import {
  CHARACTER_TYPES,
  EDITION_CHOICES,
  getEdition,
  getSetupCounts,
  formatSetupCounts,
} from "../botcData.js";

function typeTitle(type) {
  return type[0].toUpperCase() + type.slice(1);
}

export default {
  data: new SlashCommandBuilder()
    .setName("script")
    .setDescription("Shows a base edition roster and setup chart.")
    .addStringOption((option) =>
      option
        .setName("edition")
        .setDescription("Base game edition")
        .addChoices(...EDITION_CHOICES)
    ),

  async execute(interaction) {
    const editionId =
      interaction.options.getString("edition") || "trouble_brewing";
    const edition = getEdition(editionId);
    const groups = CHARACTER_TYPES.map((type) => {
      const names = edition.characters
        .filter((characterInfo) => characterInfo.type === type)
        .map((characterInfo) => characterInfo.name)
        .join(", ");
      return `${typeTitle(type)}: ${names}`;
    });
    const travellers = edition.travellers
      .map((travellerInfo) => travellerInfo.name)
      .join(", ");

    const counts = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      .map((playerCount) => `${playerCount}: ${formatSetupCounts(getSetupCounts(playerCount))}`)
      .join("\n");

    await interaction.reply({
      content: `Base edition: ${edition.name}\n\n${groups.join(
        "\n"
      )}\nTravellers: ${travellers}\n\nSetup chart:\n${counts}\n\nUse /character to look up abilities and /fabled list for Fabled.`,
      ephemeral: true,
    });
  },
};
