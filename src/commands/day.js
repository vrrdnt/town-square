import { SlashCommandBuilder } from "discord.js";
import {
  activeParticipantIds,
  getLogChannel,
  requireStoryteller,
  save,
} from "../commandUtils.js";

async function deletePrivateChannels(interaction, state) {
  const channelIds = state.privateChannelIds || [];
  state.privateChannelIds = [];

  for (const channelId of channelIds) {
    const channel = await interaction.guild.channels
      .fetch(channelId)
      .catch(() => null);
    if (channel) await channel.delete().catch(() => null);
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("day")
    .setDescription("Moves all players back to the Town Square."),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    if (!state.townSquareId) {
      return interaction.reply({
        content: "Setup has not been completed yet.",
        ephemeral: true,
      });
    }

    if (state.phase !== "night") {
      return interaction.reply({
        content: "Use /night before advancing to the next day.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    state.phase = "day";
    state.currentDay = Math.max((state.currentDay || 0) + 1, state.currentNight || 1);
    state.nominations ||= {};
    state.nominations[String(state.currentDay)] = [];
    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(`Day ${state.currentDay} has started.`);

    for (const playerId of activeParticipantIds(state)) {
      const member = await interaction.guild.members.fetch(playerId);
      if (member.voice.channel) {
        await member.voice.setChannel(state.townSquareId).catch(async (error) => {
          console.error(`Failed to move ${member.user.tag}:`, error);
          await logChannel?.send(`Could not return <@${member.id}> to Town Square.`);
        });
      }
    }

    await deletePrivateChannels(interaction, state);
    save(interaction, client, state);

    await interaction.editReply({
      content: `Players returned to Town Square for Day ${state.currentDay}.`,
    });
  },
};
