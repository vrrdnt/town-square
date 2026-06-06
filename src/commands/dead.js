import { SlashCommandBuilder } from "discord.js";
import {
  getLogChannel,
  deadNickname,
  isActiveParticipant,
  requireStoryteller,
  save,
  setStoredNickname,
} from "../commandUtils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dead")
    .setDescription("Marks a player as dead and gives them one ghost vote.")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The player to mark as dead")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const player = interaction.options.getUser("player");
    if (!isActiveParticipant(state, player.id)) {
      return interaction.reply({
        content: "That user is not an active player or Traveller.",
        ephemeral: true,
      });
    }

    state.deadPlayers ||= [];
    if (state.deadPlayers.includes(player.id)) {
      return interaction.reply({
        content: "That player is already marked as dead.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    state.deadPlayers.push(player.id);
    state.ghostVotes ||= {};
    state.ghostVotes[player.id] = true;

    const member = await interaction.guild.members.fetch(player.id);
    await setStoredNickname(member, state);
    await member.setNickname(deadNickname(member)).catch((error) => {
      console.error(`Failed to mark ${member.user.tag} as dead:`, error);
    });

    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(`Marked <@${player.id}> as dead. Ghost vote available.`);
    save(interaction, client, state);

    await interaction.editReply({
      content: `<@${player.id}> is now dead and has one ghost vote.`,
    });
  },
};
