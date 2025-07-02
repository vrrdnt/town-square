import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Sets up the game environment.")
    .addStringOption((option) =>
      option
        .setName("players")
        .setDescription("Space-separated @mentions of all players")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("doesevilknow")
        .setDescription("Should evil players know each other?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("evilplayers")
        .setDescription("If evil knows, mention them here. Space-separated")
    ),

  async execute(interaction, client) {
    // Immediately defer to prevent timeout
    await interaction.deferReply({ ephemeral: true });

    const playersRaw = interaction.options.getString("players");
    const doesevilknow = interaction.options.getBoolean("doesevilknow");
    const evilPlayersRaw = interaction.options.getString("evilplayers") || "";

    const players = playersRaw.match(/<@!?(\d+)>/g) || [];
    const evilPlayers = doesevilknow
      ? evilPlayersRaw.match(/<@!?(\d+)>/g) || []
      : [];

    if (!players.length)
      return await interaction.editReply({
        content: "You must mention at least one player.",
      });

    if (doesevilknow && !evilPlayers.length)
      return await interaction.editReply({
        content: "You set doesevilknow to true but didn't list evil players.",
      });

    // Create roles with hoist so they display separately
    let storytellerRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Storyteller"
    );
    if (!storytellerRole) {
      storytellerRole = await interaction.guild.roles.create({
        name: "Storyteller",
        color: "#e74c3c",
        hoist: true,
      });
    }

    let townsfolkRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Townsfolk"
    );
    if (!townsfolkRole) {
      townsfolkRole = await interaction.guild.roles.create({
        name: "Townsfolk",
        color: "#2ecc71",
        hoist: true,
      });
    }

    // Ensure Storyteller is above Townsfolk
    await storytellerRole.setPosition(townsfolkRole.position + 1);

    // Ensure bot stays above both
    const botHighestRole = interaction.guild.members.me.roles.highest;
    const targetTop =
      Math.max(storytellerRole.position, townsfolkRole.position) + 1;

    if (botHighestRole.position <= targetTop) {
      await botHighestRole.setPosition(targetTop);
    }

    // Assign roles
    const gmMember = await interaction.guild.members.fetch(interaction.user.id);
    await gmMember.roles.add(storytellerRole);

    for (const mention of players) {
      const id = mention.match(/\d+/)[0];
      const member = await interaction.guild.members.fetch(id);
      await member.roles.add(townsfolkRole);
    }

    // Store session state
    client.session.set(interaction.guild.id, {
      gm: interaction.user.id,
      players: players.map((m) => m.match(/\d+/)[0]),
      evilPlayers: evilPlayers.map((m) => m.match(/\d+/)[0]),
      deadPlayers: [],
      currentDay: 1,
      phase: "day",
      categoryId: null,
      townSquareId: null,
      evilChannelId: null,
      logChannelId: null,
    });

    // Build summary + buttons
    const summary = `🎩 **Storyteller:** <@${interaction.user.id}>
👥 **Players:** ${players.join(" ")}
${
  doesevilknow
    ? `😈 **Evil Players:** ${evilPlayers.join(" ")}`
    : "😈 Evil players do **not** know each other."
}`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cancelSetup")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("proceedSetup")
        .setLabel("Proceed")
        .setStyle(ButtonStyle.Success)
    );

    // Edit initial deferred reply with summary & buttons
    await interaction.editReply({ content: summary, components: [row] });
  },
};
