import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Deletes all channels and roles, clearing the game."),
  async execute(interaction, client) {
    const state = client.session.get(interaction.guild.id);
    if (!state) return interaction.reply({ content: "No session to reset.", ephemeral: true });

    const logChannel = await interaction.guild.channels.fetch(state.logChannelId);
    await logChannel.send("🧹 Resetting Ravenswood Bluff. Deleting channels and removing roles.");

    try {
      const category = await interaction.guild.channels.fetch(state.categoryId);
      if (category) {
        for (const [_, channel] of category.children.cache) {
          await channel.delete();
        }
        await category.delete();
      }
    } catch (err) {
      console.error("Cleanup error:", err);
      await logChannel.send("⚠️ Some channels failed to delete. Check manually.");
    }

    const storytellerRole = interaction.guild.roles.cache.find(r => r.name === "Storyteller");
    const townsfolkRole = interaction.guild.roles.cache.find(r => r.name === "Townsfolk");

    for (const uid of [state.gm, ...state.players]) {
      const member = await interaction.guild.members.fetch(uid);
      if (storytellerRole) await member.roles.remove(storytellerRole).catch(() => {});
      if (townsfolkRole) await member.roles.remove(townsfolkRole).catch(() => {});
    }

    if (storytellerRole) await storytellerRole.delete().catch(() => {});
    if (townsfolkRole) await townsfolkRole.delete().catch(() => {});

    client.session.delete(interaction.guild.id);
    await logChannel.send("✅ Ravenswood Bluff has been cleared.");
    await interaction.reply({ content: "🧹 Session reset.", ephemeral: true });
  }
};
