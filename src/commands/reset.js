import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Cleans up all channels, roles, and resets nicknames."),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const state = client.session.get(interaction.guild.id);
    if (!state) {
      return await interaction.editReply({
        content: "No game is currently running.",
      });
    }

    // Delete category (and all children channels automatically)
    if (state.categoryId) {
      const category = interaction.guild.channels.cache.get(state.categoryId);
      if (category) {
        try {
          await category.delete();
        } catch (err) {
          console.error("Failed to delete category:", err);
        }
      }
    }

    // Reset player nicknames & remove Townsfolk role
    const townsfolkRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Townsfolk"
    );
    for (const playerId of state.players) {
      const member = await interaction.guild.members
        .fetch(playerId)
        .catch(() => null);
      if (member) {
        try {
          if (townsfolkRole) await member.roles.remove(townsfolkRole);
          await member.setNickname(null);
        } catch (err) {
          console.error(`Failed to clean up ${member.user.tag}:`, err);
        }
      }
    }

    // Remove Storyteller role from GM
    const gm = await interaction.guild.members
      .fetch(state.gm)
      .catch(() => null);
    const storytellerRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Storyteller"
    );
    if (gm && storytellerRole) {
      try {
        await gm.roles.remove(storytellerRole);
      } catch (err) {
        console.error("Failed to remove storyteller role:", err);
      }
    }

    // Delete leftover roles
    try {
      if (storytellerRole) await storytellerRole.delete();
      if (townsfolkRole) await townsfolkRole.delete();
    } catch (err) {
      console.error("Failed to delete roles:", err);
    }

    client.session.delete(interaction.guild.id);

    await interaction.editReply({
      content: "✅ Ravenswood Bluff has been fully reset.",
    });
  },
};
