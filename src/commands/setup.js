import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup the game.")
    .addStringOption(opt =>
      opt.setName("players").setDescription("Space-separated @mentions").setRequired(true))
    .addBooleanOption(opt =>
      opt.setName("doesevilknow").setDescription("Does evil know each other?").setRequired(true))
    .addStringOption(opt =>
      opt.setName("evilplayers").setDescription("Space-separated @mentions if evil knows")),
  async execute(interaction, client) {
    const players = interaction.options.getString("players").match(/<@!?(\d+)>/g) || [];
    const doesevilknow = interaction.options.getBoolean("doesevilknow");
    const evilPlayers = doesevilknow
      ? (interaction.options.getString("evilplayers")?.match(/<@!?(\d+)>/g) || [])
      : [];

    if (players.length < 2) {
      return interaction.reply({ content: "Need at least 2 players.", ephemeral: true });
    }

    if (doesevilknow && !evilPlayers.length) {
      return interaction.reply({ content: "If evil knows each other, specify evil players.", ephemeral: true });
    }

    client.session.set(interaction.guild.id, {
      gm: interaction.user.id,
      players: players.map(m => m.match(/\d+/)[0]),
      evilPlayers: evilPlayers.map(m => m.match(/\d+/)[0]),
      categoryId: null,
      townSquareId: null,
      evilChannelId: null
    });

    const summary = `**Players:** ${players.join(" ")}
**Evil Knows:** ${doesevilknow}
${doesevilknow ? "**Evil Players:** " + evilPlayers.join(" ") : ""}`;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("cancelSetup").setLabel("Cancel").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("proceedSetup").setLabel("Proceed").setStyle(ButtonStyle.Success)
      );

    await interaction.reply({ content: summary, ephemeral: true, components: [row] });
  }
};
