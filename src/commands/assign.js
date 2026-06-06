import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import {
  getCharacter,
  getEdition,
  getEvilPlayers,
} from "../botcData.js";
import {
  findTraveller,
  getLogChannel,
  requireStoryteller,
  save,
} from "../commandUtils.js";

const ALIGNMENT_CHOICES = [
  { name: "Default for character", value: "default" },
  { name: "Good", value: "good" },
  { name: "Evil", value: "evil" },
];

async function syncEvilChannel(interaction, state) {
  if (!state.evilChannelId) return;

  const evilChannel = await interaction.guild.channels
    .fetch(state.evilChannelId)
    .catch(() => null);
  if (!evilChannel) return;

  const evilPlayers = new Set(state.evilPlayers || []);
  for (const playerId of state.players) {
    if (evilPlayers.has(playerId)) {
      await evilChannel.permissionOverwrites
        .edit(playerId, {
          ViewChannel: true,
          ReadMessageHistory: true,
          SendMessages: false,
        })
        .catch(() => null);
    } else {
      await evilChannel.permissionOverwrites.delete(playerId).catch(() => null);
    }
  }
}

async function dmAssignment(member, assignment) {
  await member.send(
    `Your character is now ${assignment.name}. Your alignment is ${assignment.alignment}. Keep this private.\nAbility: ${assignment.ability}`
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName("assign")
    .setDescription("Updates a player's private character assignment.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The non-Traveller player")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription("Base character name, e.g. Imp, Snake Charmer, Fang Gu")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("alignment")
        .setDescription("Override alignment after a swap or conversion")
        .addChoices(...ALIGNMENT_CHOICES)
    )
    .addBooleanOption((option) =>
      option
        .setName("notify")
        .setDescription("DM the player their updated character")
    ),

  async autocomplete(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    const edition = getEdition(state?.editionId || "trouble_brewing");
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = edition.characters
      .filter((characterInfo) =>
        characterInfo.name.toLowerCase().includes(focused)
      )
      .slice(0, 25)
      .map((characterInfo) => ({
        name: `${characterInfo.name} (${characterInfo.type})`,
        value: characterInfo.name,
      }));

    await interaction.respond(choices);
  },

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const player = interaction.options.getUser("player");
    if (findTraveller(state, player.id)) {
      return interaction.reply({
        content: "Use /traveller for Traveller character and alignment changes.",
        ephemeral: true,
      });
    }

    if (!state.players.includes(player.id)) {
      return interaction.reply({
        content: "That user is not a registered non-Traveller player.",
        ephemeral: true,
      });
    }

    const characterName = interaction.options.getString("character");
    const characterInfo = getCharacter(characterName, state.editionId);
    if (!characterInfo) {
      return interaction.reply({
        content: `Unknown ${getEdition(state.editionId).name} character: ${characterName}.`,
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const alignmentOverride = interaction.options.getString("alignment");
    const assignment = {
      ...characterInfo,
      alignment:
        alignmentOverride && alignmentOverride !== "default"
          ? alignmentOverride
          : characterInfo.alignment,
    };

    state.assignments ||= {};
    state.assignments[player.id] = assignment;
    state.evilPlayers = getEvilPlayers(state.assignments);
    await syncEvilChannel(interaction, state);
    save(interaction, client, state);

    const notify = interaction.options.getBoolean("notify") ?? true;
    const logChannel = await getLogChannel(interaction, state);
    if (notify) {
      const member = await interaction.guild.members.fetch(player.id);
      await dmAssignment(member, assignment).catch(async (error) => {
        console.error(`Failed to DM updated assignment to ${member.user.tag}:`, error);
        await logChannel?.send(
          `Could not DM <@${player.id}> their updated character. Tell them privately.`
        );
      });
    }

    const message = `<@${player.id}> is now ${assignment.alignment} ${assignment.name}.`;
    await logChannel?.send(message);
    await interaction.editReply({ content: message });
  },
};
