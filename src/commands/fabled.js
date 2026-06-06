import { SlashCommandBuilder } from "discord.js";
import { FABLED, FABLED_CHOICES, getFabled } from "../botcData.js";
import { getLogChannel, requireStoryteller, save } from "../commandUtils.js";

function fabledList(ids) {
  if (!ids?.length) return "none";
  return ids.map((id) => getFabled(id)?.name || id).join(", ");
}

export default {
  data: new SlashCommandBuilder()
    .setName("fabled")
    .setDescription("Manages Fabled in the current game.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Adds a Fabled to the current game.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Fabled")
            .setRequired(true)
            .addChoices(...FABLED_CHOICES)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Removes a Fabled from the current game.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Fabled")
            .setRequired(true)
            .addChoices(...FABLED_CHOICES)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Lists Fabled in this game or the base Fabled catalog.")
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      const state = client.session.get(interaction.guild.id);
      const active = state?.fabled?.length
        ? `Active Fabled: ${fabledList(state.fabled)}`
        : "Active Fabled: none";
      const catalog = FABLED.map(
        (fabledInfo) => `- ${fabledInfo.name}: ${fabledInfo.ability}`
      ).join("\n");
      return interaction.reply({
        content: `${active}\n\nCatalog:\n${catalog}`,
        ephemeral: true,
      });
    }

    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    const fabledId = interaction.options.getString("name");
    const fabledInfo = getFabled(fabledId);
    state.fabled ||= [];

    if (subcommand === "add") {
      if (state.fabled.includes(fabledId)) {
        return interaction.reply({
          content: `${fabledInfo.name} is already in play.`,
          ephemeral: true,
        });
      }

      state.fabled.push(fabledId);
      save(interaction, client, state);

      const message = `${fabledInfo.name} is now in play. ${fabledInfo.ability}`;
      const logChannel = await getLogChannel(interaction, state);
      await logChannel?.send(message);
      return interaction.reply({ content: message, ephemeral: false });
    }

    state.fabled = state.fabled.filter((id) => id !== fabledId);
    save(interaction, client, state);

    const message = `${fabledInfo.name} has been removed from play.`;
    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(message);
    return interaction.reply({ content: message, ephemeral: false });
  },
};
