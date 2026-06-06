import { SlashCommandBuilder } from "discord.js";
import {
  EDITION_CHOICES,
  EDITIONS,
  FABLED,
  getCharacter,
  getEdition,
  getFabled,
  getTraveller,
  publicCharacterName,
} from "../botcData.js";

function findCharacter(name, editionId) {
  const edition = getEdition(editionId);
  const characterInfo = getCharacter(name, edition.id);
  if (characterInfo) {
    return { characterInfo, edition };
  }

  for (const candidateEdition of Object.values(EDITIONS)) {
    const match = getCharacter(name, candidateEdition.id);
    if (match) return { characterInfo: match, edition: candidateEdition };
  }

  return null;
}

export default {
  data: new SlashCommandBuilder()
    .setName("character")
    .setDescription("Looks up a base character, Traveller, or Fabled ability.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Character name, e.g. Chef, Fang Gu, Scapegoat")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("edition")
        .setDescription("Base edition to search first")
        .addChoices(...EDITION_CHOICES)
    ),

  async autocomplete(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    const editionId =
      interaction.options.getString("edition") ||
      state?.editionId ||
      "trouble_brewing";
    const edition = getEdition(editionId);
    const focused = interaction.options.getFocused().toLowerCase();
    const allEntries = [
      ...edition.characters.map((entry) => ({
        name: `${entry.name} (${edition.name})`,
        value: entry.name,
      })),
      ...edition.travellers.map((entry) => ({
        name: `${entry.name} (Traveller)`,
        value: entry.name,
      })),
      ...FABLED.map((entry) => ({
        name: `${entry.name} (Fabled)`,
        value: entry.name,
      })),
    ];
    const choices = allEntries
      .filter((entry) => entry.name.toLowerCase().includes(focused))
      .slice(0, 25);

    await interaction.respond(choices);
  },

  async execute(interaction, client) {
    const name = interaction.options.getString("name");
    const state = client.session.get(interaction.guild.id);
    const editionId =
      interaction.options.getString("edition") ||
      state?.editionId ||
      "trouble_brewing";

    const foundCharacter = findCharacter(name, editionId);
    if (foundCharacter) {
      const { characterInfo, edition } = foundCharacter;
      return interaction.reply({
        content: `${publicCharacterName(characterInfo)} - ${edition.name}\n${characterInfo.ability}`,
        ephemeral: true,
      });
    }

    const travellerInfo = getTraveller(name, editionId) || getTraveller(name);
    if (travellerInfo) {
      return interaction.reply({
        content: `${travellerInfo.name} (Traveller - ${travellerInfo.editionName})\n${travellerInfo.ability}`,
        ephemeral: true,
      });
    }

    const fabledInfo = getFabled(name);
    if (fabledInfo) {
      return interaction.reply({
        content: `${fabledInfo.name} (Fabled)\n${fabledInfo.ability}`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `Unknown base character, Traveller, or Fabled: ${name}.`,
      ephemeral: true,
    });
  },
};
