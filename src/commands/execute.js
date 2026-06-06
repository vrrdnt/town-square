import { SlashCommandBuilder } from "discord.js";
import {
  getLogChannel,
  deadNickname,
  findTraveller,
  livingPlayerIds,
  requireStoryteller,
  save,
  setStoredNickname,
} from "../commandUtils.js";

function executionReminder(characterInfo, livingAfterDeath) {
  if (!characterInfo) return null;

  if (characterInfo.name === "Saint") {
    return "Saint executed: evil wins unless another rule prevents it.";
  }

  if (characterInfo.type === "demons") {
    return `Demon executed: check Scarlet Woman, Mastermind, Fang Gu, Zombuul, and other script rules before declaring a winner. Living players after death: ${livingAfterDeath}.`;
  }

  return null;
}

export default {
  data: new SlashCommandBuilder()
    .setName("execute")
    .setDescription("Records an execution and optionally marks the player dead.")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The executed player")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("died")
        .setDescription("Whether the execution killed the player")
    ),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const player = interaction.options.getUser("player");
    const died = interaction.options.getBoolean("died") ?? true;

    if (!state.players.includes(player.id)) {
      if (findTraveller(state, player.id)) {
        return interaction.reply({
          content: "Travellers are exiled instead of executed. Use /traveller exile.",
          ephemeral: true,
        });
      }
      return interaction.reply({
        content: "That user is not a registered player.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const logChannel = await getLogChannel(interaction, state);
    let response = `<@${player.id}> was executed`;
    state.deadPlayers ||= [];

    if (died && !state.deadPlayers.includes(player.id)) {
      state.deadPlayers.push(player.id);
      state.ghostVotes ||= {};
      state.ghostVotes[player.id] = true;

      const member = await interaction.guild.members.fetch(player.id);
      await setStoredNickname(member, state);
      await member.setNickname(deadNickname(member)).catch((error) => {
        console.error(`Failed to mark ${member.user.tag} as dead:`, error);
      });

      response += " and died.";
    } else if (died) {
      response += ", but was already dead.";
    } else {
      response += " but did not die.";
    }

    const livingAfterDeath = livingPlayerIds(state).length;
    const reminder = died
      ? executionReminder(state.assignments?.[player.id], livingAfterDeath)
      : null;

    await logChannel?.send(`${response}${reminder ? `\n${reminder}` : ""}`);
    save(interaction, client, state);

    await interaction.editReply({
      content: `${response}${reminder ? `\n${reminder}` : ""}`,
    });
  },
};
