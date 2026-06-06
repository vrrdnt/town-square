import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import {
  EDITION_CHOICES,
  countByType,
  formatSetupCounts,
  getCharacter,
  getCharacterById,
  getEdition,
  getEvilPlayers,
  getSetupCounts,
  parseCharacterNames,
  parseUserMentions,
  shouldEvilLearnInfo,
  validateAssignments,
} from "../botcData.js";

const SETUP_MODAL_PREFIX = "setupModal";

function formatWarnings(warnings) {
  if (!warnings.length) return "";
  return `\n\nWarnings:\n${warnings.map((warning) => `- ${warning}`).join("\n")}`;
}

function modalField(customId, label, style, required, placeholder, value = "") {
  const input = new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style)
    .setRequired(required)
    .setPlaceholder(placeholder);

  if (value) input.setValue(value.slice(0, 4000));

  return new ActionRowBuilder().addComponents(input);
}

function setupModal(editionId, defaults = {}) {
  const edition = getEdition(editionId);
  return new ModalBuilder()
    .setCustomId(`${SETUP_MODAL_PREFIX}:${edition.id}`)
    .setTitle(`Setup ${edition.name}`)
    .addComponents(
      modalField(
        "players",
        "Players",
        TextInputStyle.Paragraph,
        true,
        "@Will @Anna @Mark @Priya @Sam",
        defaults.playersRaw
      ),
      modalField(
        "demon_bluffs",
        "Demon bluffs",
        TextInputStyle.Short,
        false,
        "Mayor, Soldier, Ravenkeeper",
        defaults.bluffsRaw
      )
    );
}

function validateDemonBluffs(rawBluffs, assignments, editionId, playerCount) {
  const errors = [];
  const warnings = [];
  const bluffNames = parseCharacterNames(rawBluffs);

  if (!bluffNames.length) {
    return { bluffs: [], errors, warnings };
  }

  if (bluffNames.length !== 3) {
    errors.push("Demon bluffs must list exactly 3 out-of-play good characters.");
  }

  const assignedIds = new Set(
    Object.values(assignments || {}).map((characterInfo) => characterInfo.id)
  );
  const bluffs = [];
  const seen = new Set();

  for (const name of bluffNames) {
    const characterInfo = getCharacter(name, editionId);
    if (!characterInfo) {
      errors.push(`Unknown ${getEdition(editionId).name} bluff character: ${name}.`);
      continue;
    }
    if (characterInfo.alignment !== "good") {
      errors.push(`${characterInfo.name} is not a good character.`);
    }
    if (assignedIds.has(characterInfo.id)) {
      errors.push(`${characterInfo.name} is already in play.`);
    }
    if (seen.has(characterInfo.id)) {
      errors.push(`${characterInfo.name} is listed more than once as a bluff.`);
    }
    seen.add(characterInfo.id);
    bluffs.push(characterInfo.name);
  }

  return { bluffs, errors, warnings };
}

function assignmentCount(state) {
  return Object.keys(state.assignments || {}).length;
}

function assignmentsComplete(state) {
  return assignmentCount(state) === state.players.length;
}

function assignmentsPartial(state) {
  const count = assignmentCount(state);
  return count > 0 && count < state.players.length;
}

function setupWarnings(state) {
  const warnings = [...(state.setupWarnings || [])];
  if (assignmentsPartial(state)) {
    warnings.push(
      "Finish assigning every player, or clear assignments before proceeding."
    );
  }
  if ((state.demonBluffs || []).length && !assignmentsComplete(state)) {
    warnings.push(
      "Demon bluffs are saved, but they are only sent automatically after all characters are assigned."
    );
  }
  if (
    assignmentsComplete(state) &&
    shouldEvilLearnInfo(state.players.length) &&
    !(state.demonBluffs || []).length
  ) {
    warnings.push(
      "Standard 7+ player games normally give the Demon 3 out-of-play good character bluffs."
    );
  }

  if (assignmentsComplete(state)) {
    const counts = getSetupCounts(state.players.length);
    const actual = countByType(Object.values(state.assignments));
    const matchesSetup = counts
      ? ["townsfolk", "outsiders", "minions", "demons"].every(
          (type) => actual[type] === counts[type]
        )
      : true;
    if (!matchesSetup) {
      warnings.push(
        `Base setup chart is ${formatSetupCounts(
          counts
        )}; selected characters are ${formatSetupCounts(actual)}.`
      );
    }
  }

  return warnings;
}

function setupSummary(state) {
  const setupCounts = getSetupCounts(state.players.length);
  const assigned = assignmentCount(state);
  const evilInfo =
    assignmentsComplete(state) && shouldEvilLearnInfo(state.players.length)
      ? `${state.evilPlayers.length} evil player(s) will receive standard evil info.`
      : "Evil info is skipped unless all assignments are selected for a 7+ player game.";
  const assignmentText = assignmentsComplete(state)
    ? "Character DMs will be sent when you press Proceed."
    : assigned
      ? `Assignments selected: ${assigned}/${state.players.length}.`
      : "Use Assign Characters for dropdowns, or Proceed without character DMs.";

  return [
    `Storyteller: <@${state.gm}>`,
    `Edition: ${getEdition(state.editionId).name}`,
    `Players: ${state.players.map((playerId) => `<@${playerId}>`).join(" ")}`,
    `Setup chart: ${formatSetupCounts(setupCounts)}`,
    `Assignments: ${assigned}/${state.players.length}`,
    evilInfo,
    assignmentText,
  ].join("\n");
}

function setupReviewComponents(state) {
  const assigned = assignmentCount(state);
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("setupAssignOpen:0")
        .setLabel(assigned ? "Edit Assignments" : "Assign Characters")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("setupAssignClear")
        .setLabel("Clear Assignments")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!assigned),
      new ButtonBuilder()
        .setCustomId("cancelSetup")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("proceedSetup")
        .setLabel(assignmentsComplete(state) ? "Proceed & DM" : "Proceed")
        .setStyle(ButtonStyle.Success)
        .setDisabled(assignmentsPartial(state))
    ),
  ];
}

function renderSetupReview(state) {
  return {
    content: `${setupSummary(state)}${formatWarnings(setupWarnings(state))}`,
    components: setupReviewComponents(state),
  };
}

function assignedCharacterIds(state, exceptPlayerId) {
  return new Set(
    Object.entries(state.assignments || {})
      .filter(([playerId]) => playerId !== exceptPlayerId)
      .map(([, characterInfo]) => characterInfo.id)
  );
}

function characterOptionsFor(state, playerId) {
  const usedIds = assignedCharacterIds(state, playerId);
  const currentId = state.assignments?.[playerId]?.id;
  return getEdition(state.editionId).characters
    .filter((characterInfo) => !usedIds.has(characterInfo.id))
    .map((characterInfo) => ({
      label: characterInfo.name,
      description: characterInfo.type,
      value: characterInfo.id,
      default: characterInfo.id === currentId,
    }));
}

function assignmentPage(state, requestedPage) {
  const totalPages = Math.ceil(state.players.length / 4);
  return Math.max(0, Math.min(requestedPage, totalPages - 1));
}

function renderAssignmentWizard(state, requestedPage = 0) {
  const page = assignmentPage(state, requestedPage);
  const pagePlayers = state.players.slice(page * 4, page * 4 + 4);
  const assigned = assignmentCount(state);
  const content = [
    `Assign characters - ${getEdition(state.editionId).name}`,
    `Selected: ${assigned}/${state.players.length}. Page ${page + 1}/${Math.ceil(
      state.players.length / 4
    )}.`,
    "Pick one character per player. Used characters disappear from the other dropdowns.",
    "",
    ...state.players.map((playerId, index) => {
      const characterInfo = state.assignments?.[playerId];
      return `${index + 1}. <@${playerId}>: ${
        characterInfo ? characterInfo.name : "unassigned"
      }`;
    }),
  ].join("\n");

  const rows = pagePlayers.map((playerId, index) =>
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`setupAssign:${page}:${playerId}`)
        .setPlaceholder(`Player ${page * 4 + index + 1}: choose character`)
        .addOptions(characterOptionsFor(state, playerId))
    )
  );

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`setupAssignOpen:${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId(`setupAssignOpen:${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= Math.ceil(state.players.length / 4) - 1),
      new ButtonBuilder()
        .setCustomId("setupReview")
        .setLabel("Review Setup")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("setupAssignClear")
        .setLabel("Clear")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!assigned)
    )
  );

  return { content, components: rows };
}

function syncAssignmentDerivedState(state) {
  const count = assignmentCount(state);
  if (!count) {
    state.assignments = null;
    state.evilPlayers = [];
    return;
  }

  state.evilPlayers = getEvilPlayers(state.assignments);
}

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Starts a Blood on the Clocktower game setup.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName("players")
        .setDescription("Optional: @mentions of non-Traveller players. Omit for guided setup.")
    )
    .addStringOption((option) =>
      option
        .setName("edition")
        .setDescription("Base game edition")
        .addChoices(...EDITION_CHOICES)
    )
    .addStringOption((option) =>
      option
        .setName("assignments")
        .setDescription("Optional private setup: @Player=Chef, @Player=Imp")
    )
    .addStringOption((option) =>
      option
        .setName("demon_bluffs")
        .setDescription("Optional: 3 comma-separated out-of-play good characters")
    ),

  async showModal(interaction, editionId, defaults) {
    await interaction.showModal(setupModal(editionId, defaults));
  },

  async handleModal(interaction, client) {
    const [, editionId] = interaction.customId.split(":");
    await runSetup(interaction, client, {
      playersRaw: interaction.fields.getTextInputValue("players"),
      editionId,
      assignmentsRaw: "",
      bluffsRaw: interaction.fields.getTextInputValue("demon_bluffs") || "",
    });
  },

  async handleButton(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state) return;

    if (interaction.customId.startsWith("setupAssignOpen:")) {
      const page = Number(interaction.customId.split(":")[1]) || 0;
      await interaction.update(renderAssignmentWizard(state, page));
      return;
    }

    if (interaction.customId === "setupReview") {
      await interaction.update(renderSetupReview(state));
      return;
    }

    if (interaction.customId === "setupAssignClear") {
      state.assignments = null;
      state.evilPlayers = [];
      client.saveSession(interaction.guild.id, state);
      await interaction.update(renderSetupReview(state));
    }
  },

  async handleSelect(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state) return;

    const [, pageRaw, playerId] = interaction.customId.split(":");
    const characterInfo = getCharacterById(interaction.values[0], state.editionId);
    if (!characterInfo) {
      await interaction.reply({
        content: "That character is not on the current edition.",
        ephemeral: true,
      });
      return;
    }

    state.assignments ||= {};
    state.assignments[playerId] = characterInfo;
    syncAssignmentDerivedState(state);
    client.saveSession(interaction.guild.id, state);

    await interaction.update(renderAssignmentWizard(state, Number(pageRaw) || 0));
  },

  async execute(interaction, client) {
    const playersRaw = interaction.options.getString("players") || "";
    const editionId =
      interaction.options.getString("edition") || "trouble_brewing";

    if (!playersRaw.trim()) {
      if (client.session.has(interaction.guild.id)) {
        await interaction.reply({
          content: "A game is already being set up or running. Use /reset first.",
          ephemeral: true,
        });
        return;
      }

      await this.showModal(interaction, editionId);
      return;
    }

    await runSetup(interaction, client, {
      playersRaw,
      editionId,
      assignmentsRaw: interaction.options.getString("assignments") || "",
      bluffsRaw: interaction.options.getString("demon_bluffs") || "",
    });
  },
};

async function runSetup(
  interaction,
  client,
  { playersRaw, editionId, assignmentsRaw, bluffsRaw }
) {
    await interaction.deferReply({ ephemeral: true });

    const players = parseUserMentions(playersRaw);
    const warnings = [];

    if (client.session.has(interaction.guild.id)) {
      return interaction.editReply({
        content: "A game is already being set up or running. Use /reset first.",
      });
    }

    if (players.length < 5 || players.length > 15) {
      return interaction.editReply({
        content: "Base setup supports 5-15 non-Traveller players. Add Travellers after setup with /traveller add.",
      });
    }

    if (players.includes(interaction.user.id)) {
      return interaction.editReply({
        content: "The Storyteller should not be included in the player list.",
      });
    }

    let assignments = null;
    let evilPlayers = [];

    if (assignmentsRaw.trim()) {
      const validated = validateAssignments(assignmentsRaw, players, editionId);
      if (validated.errors.length) {
        return interaction.editReply({
          content: `Character assignment errors:\n${validated.errors
            .map((error) => `- ${error}`)
            .join("\n")}`,
        });
      }
      assignments = validated.assignments;
      evilPlayers = getEvilPlayers(assignments);
      warnings.push(...validated.warnings);
    }

    const bluffValidation = validateDemonBluffs(
      bluffsRaw,
      assignments,
      editionId,
      players.length
    );
    if (bluffValidation.errors.length) {
      return interaction.editReply({
        content: `Demon bluff errors:\n${bluffValidation.errors
          .map((error) => `- ${error}`)
          .join("\n")}`,
      });
    }
    warnings.push(...bluffValidation.warnings);

    const state = {
      gm: interaction.user.id,
      players,
      editionId,
      assignments,
      assignmentsSent: false,
      demonBluffs: bluffValidation.bluffs,
      evilPlayers,
      deadPlayers: [],
      ghostVotes: {},
      travellers: [],
      fabled: [],
      nominations: {},
      currentDay: 0,
      currentNight: 0,
      phase: "setup_pending",
      storytellerRoleId: null,
      playerRoleId: null,
      createdStorytellerRole: false,
      createdPlayerRole: false,
      categoryId: null,
      townSquareId: null,
      evilChannelId: null,
      logChannelId: null,
      privateChannelIds: [],
      nicknames: {},
      setupWarnings: warnings,
    };
    client.saveSession(interaction.guild.id, state);

    await interaction.editReply(renderSetupReview(state));
}
