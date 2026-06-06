import { SlashCommandBuilder } from "discord.js";
import { restoreNickname } from "../commandUtils.js";

async function deleteGameChannels(interaction, state) {
  await interaction.guild.channels.fetch();

  const childChannels = interaction.guild.channels.cache.filter(
    (channel) => channel.parentId === state.categoryId
  );
  for (const channel of childChannels.values()) {
    await channel.delete().catch((error) => {
      console.error(`Failed to delete channel ${channel.name}:`, error);
    });
  }

  if (state.categoryId) {
    const category = await interaction.guild.channels
      .fetch(state.categoryId)
      .catch(() => null);
    if (category) {
      await category.delete().catch((error) => {
        console.error("Failed to delete category:", error);
      });
    }
  }
}

async function removeRole(member, roleId) {
  if (!roleId) return;
  await member.roles.remove(roleId).catch((error) => {
    console.error(`Failed to remove role from ${member.user.tag}:`, error);
  });
}

async function deleteRole(guild, roleId) {
  if (!roleId) return;
  const role = await guild.roles.fetch(roleId).catch(() => null);
  if (role) {
    await role.delete().catch((error) => {
      console.error(`Failed to delete role ${role.name}:`, error);
    });
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Cleans up the current Clocktower session."),

  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state) {
      return interaction.reply({
        content: "No game is currently running.",
        ephemeral: true,
      });
    }

    if (interaction.user.id !== state.gm) {
      return interaction.reply({
        content: "Only the Storyteller can reset the game.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    await deleteGameChannels(interaction, state);

    const playerIds = new Set([
      ...state.players,
      ...(state.travellers || []).map((traveller) => traveller.playerId),
    ]);

    for (const playerId of playerIds) {
      const member = await interaction.guild.members
        .fetch(playerId)
        .catch(() => null);
      if (!member) continue;
      await removeRole(member, state.playerRoleId);
      await restoreNickname(member, state).catch((error) => {
        console.error(`Failed to restore nickname for ${member.user.tag}:`, error);
      });
    }

    const storyteller = await interaction.guild.members
      .fetch(state.gm)
      .catch(() => null);
    if (storyteller) {
      await removeRole(storyteller, state.storytellerRoleId);
    }

    if (state.createdStorytellerRole) {
      await deleteRole(interaction.guild, state.storytellerRoleId);
    }
    if (state.createdPlayerRole) {
      await deleteRole(interaction.guild, state.playerRoleId);
    }

    client.deleteSession(interaction.guild.id);

    await interaction.editReply({
      content: "Ravenswood Bluff has been reset.",
    });
  },
};
