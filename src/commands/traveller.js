import { SlashCommandBuilder } from "discord.js";
import {
  TRAVELLER_CHOICES,
  getDemonPlayers,
  getTraveller,
} from "../botcData.js";
import {
  getLogChannel,
  requireSession,
  requireStoryteller,
  restoreNickname,
  save,
  setStoredNickname,
} from "../commandUtils.js";

const ALIGNMENT_CHOICES = [
  { name: "Good", value: "good" },
  { name: "Evil", value: "evil" },
];

function findTravellerByPlayer(state, playerId) {
  return (state.travellers || []).find(
    (traveller) => traveller.playerId === playerId
  );
}

function formatTravellerList(state, includeAlignment) {
  if (!state.travellers?.length) return "No Travellers.";

  return state.travellers
    .map((traveller) => {
      const status = traveller.exiled
        ? "exiled"
        : (state.deadPlayers || []).includes(traveller.playerId)
          ? "dead"
          : "active";
      const alignment = includeAlignment ? `${traveller.alignment} ` : "";
      return `<@${traveller.playerId}>: ${alignment}${traveller.character.name} (${status})`;
    })
    .join("\n");
}

async function removeTravellerRole(interaction, state, playerId) {
  const member = await interaction.guild.members.fetch(playerId).catch(() => null);
  if (!member) return null;

  if (state.playerRoleId) {
    await member.roles.remove(state.playerRoleId).catch((error) => {
      console.error(`Failed to remove player role from ${member.user.tag}:`, error);
    });
  }
  await restoreNickname(member, state).catch((error) => {
    console.error(`Failed to restore nickname for ${member.user.tag}:`, error);
  });
  return member;
}

async function dmTraveller(member, state, travellerInfo, alignment, logChannel) {
  const demonPlayers = getDemonPlayers(state.assignments);
  const demonText =
    alignment === "evil"
      ? demonPlayers.length
        ? `\nDemon: ${demonPlayers.map((playerId) => `<@${playerId}>`).join(" ")}`
        : "\nAsk the Storyteller who the Demon is."
      : "";

  try {
    await member.send(
      `You are the ${alignment} Traveller ${travellerInfo.name}. Your character is public; your alignment is private.\nAbility: ${travellerInfo.ability}${demonText}`
    );
  } catch (error) {
    console.error(`Failed to DM Traveller info to ${member.user.tag}:`, error);
    await logChannel?.send(
      `Could not DM <@${member.id}> their Traveller details. Tell them privately.`
    );
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("traveller")
    .setDescription("Manages Travellers in the current game.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Adds a Traveller to the current game.")
        .addUserOption((option) =>
          option
            .setName("player")
            .setDescription("The Traveller player")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("character")
            .setDescription("Traveller character")
            .setRequired(true)
            .addChoices(...TRAVELLER_CHOICES)
        )
        .addStringOption((option) =>
          option
            .setName("alignment")
            .setDescription("Traveller alignment")
            .setRequired(true)
            .addChoices(...ALIGNMENT_CHOICES)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("exile")
        .setDescription("Exiles a Traveller from the game.")
        .addUserOption((option) =>
          option
            .setName("player")
            .setDescription("The Traveller to exile")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Removes a Traveller without recording exile.")
        .addUserOption((option) =>
          option
            .setName("player")
            .setDescription("The Traveller to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Lists Travellers in the current game.")
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      const state = await requireSession(interaction, client);
      if (!state) return;

      return interaction.reply({
        content: formatTravellerList(state, interaction.user.id === state.gm),
        ephemeral: true,
      });
    }

    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    if (!state.categoryId) {
      return interaction.reply({
        content: "Finish setup before adding Travellers.",
        ephemeral: true,
      });
    }

    const player = interaction.options.getUser("player");
    const existingTraveller = findTravellerByPlayer(state, player.id);

    if (subcommand === "add") {
      if (state.players.includes(player.id)) {
        return interaction.reply({
          content: "That user is already a non-Traveller player.",
          ephemeral: true,
        });
      }

      if (existingTraveller && !existingTraveller.exiled) {
        return interaction.reply({
          content: "That user is already an active Traveller.",
          ephemeral: true,
        });
      }

      if (existingTraveller) {
        return interaction.reply({
          content: "That user already has Traveller history. Use /traveller remove before adding them again.",
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: false });

      const travellerInfo = getTraveller(interaction.options.getString("character"));
      const alignment = interaction.options.getString("alignment");
      const member = await interaction.guild.members.fetch(player.id);
      await setStoredNickname(member, state);
      if (state.playerRoleId) await member.roles.add(state.playerRoleId);

      state.travellers ||= [];
      state.travellers.push({
        playerId: player.id,
        character: travellerInfo,
        alignment,
        exiled: false,
      });
      state.deadPlayers = (state.deadPlayers || []).filter(
        (id) => id !== player.id
      );
      if (state.ghostVotes) delete state.ghostVotes[player.id];

      const logChannel = await getLogChannel(interaction, state);
      await dmTraveller(member, state, travellerInfo, alignment, logChannel);
      await logChannel?.send(
        `<@${player.id}> joined as the ${alignment} Traveller ${travellerInfo.name}.`
      );
      save(interaction, client, state);

      return interaction.editReply({
        content: `<@${player.id}> has joined as the Traveller ${travellerInfo.name}.\n${travellerInfo.ability}`,
      });
    }

    if (!existingTraveller) {
      return interaction.reply({
        content: "That user is not a Traveller in this game.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: false });
    const logChannel = await getLogChannel(interaction, state);

    if (subcommand === "exile") {
      if (existingTraveller.exiled) {
        return interaction.editReply({
          content: `<@${player.id}> is already exiled.`,
        });
      }

      existingTraveller.exiled = true;
      state.deadPlayers = (state.deadPlayers || []).filter(
        (id) => id !== player.id
      );
      if (state.ghostVotes) delete state.ghostVotes[player.id];
      await removeTravellerRole(interaction, state, player.id);

      const message = `<@${player.id}> has been exiled as the Traveller ${existingTraveller.character.name}.`;
      await logChannel?.send(message);
      save(interaction, client, state);
      return interaction.editReply({ content: message });
    }

    state.travellers = state.travellers.filter(
      (traveller) => traveller.playerId !== player.id
    );
    state.deadPlayers = (state.deadPlayers || []).filter(
      (id) => id !== player.id
    );
    if (state.ghostVotes) delete state.ghostVotes[player.id];
    await removeTravellerRole(interaction, state, player.id);

    const message = `<@${player.id}> has been removed as a Traveller.`;
    await logChannel?.send(message);
    save(interaction, client, state);
    return interaction.editReply({ content: message });
  },
};
