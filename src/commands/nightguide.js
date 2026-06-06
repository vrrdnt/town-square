import { SlashCommandBuilder } from "discord.js";
import { getEdition, getNightGuide } from "../botcData.js";
import { requireStoryteller } from "../commandUtils.js";

function phaseFor(state, requestedPhase) {
  if (requestedPhase === "first" || requestedPhase === "other") {
    return requestedPhase;
  }
  return (state.currentNight || 0) <= 1 ? "first" : "other";
}

function chunksFor(header, lines) {
  const chunks = [];
  let current = header;

  for (const line of lines) {
    if (`${current}\n${line}`.length > 1900) {
      chunks.push(current);
      current = line;
    } else {
      current = `${current}\n${line}`;
    }
  }

  chunks.push(current);
  return chunks;
}

export default {
  data: new SlashCommandBuilder()
    .setName("nightguide")
    .setDescription("Shows a Storyteller wake checklist for the current game.")
    .addStringOption((option) =>
      option
        .setName("phase")
        .setDescription("Night phase")
        .addChoices(
          { name: "Auto", value: "auto" },
          { name: "First night", value: "first" },
          { name: "Other night", value: "other" }
        )
    ),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const phase = phaseFor(
      state,
      interaction.options?.getString("phase") || "auto"
    );
    const rows = getNightGuide(state, phase);
    const edition = getEdition(state.editionId);
    const title = phase === "first" ? "First Night" : "Other Night";
    const assignmentNote = state.assignments
      ? "Filtered to assigned characters and active living Travellers."
      : "No assignments recorded, so this shows every wake role on the edition.";

    if (!rows.length) {
      return interaction.reply({
        content: `${title} checklist - ${edition.name}\nNo characters in the current setup need this night checklist.`,
        ephemeral: true,
      });
    }

    const header = `${title} checklist - ${edition.name}\n${assignmentNote}\nUse official night sheets for unusual jinxes or custom-script order changes.`;
    const lines = rows.map(
      (row, index) =>
        `${index + 1}. ${row.character.name}: ${row.reminder}`
    );
    const chunks = chunksFor(header, lines);

    await interaction.reply({ content: chunks[0], ephemeral: true });
    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk, ephemeral: true });
    }
  },
};
