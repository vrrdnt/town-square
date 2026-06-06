import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import {
  requireStoryteller,
  getLogChannel,
  livingParticipantIds,
  save,
} from "../commandUtils.js";

const nightChannelNames = [
  "Dark Alley",
  "Library",
  "Graveyard",
  "Chapel",
  "Butcher Shop",
  "Alchemist Hut",
  "Tower Room",
  "Secret Garden",
  "Smithy",
  "Caves",
  "Watchtower",
  "Tavern",
  "Crypt",
  "Bell Tower",
  "Courtyard",
  "Wine Cellar",
];

function channelNameFor(member, index) {
  const baseName = nightChannelNames[index % nightChannelNames.length];
  return `${baseName} - ${member.displayName}`.slice(0, 100);
}

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
    .setName("night")
    .setDescription("Moves each living player to a private night channel."),

  async execute(interaction, client) {
    const state = await requireStoryteller(interaction, client);
    if (!state) return;

    if (!state.categoryId) {
      return interaction.reply({
        content: "Setup has not been completed yet.",
        ephemeral: true,
      });
    }

    if (state.phase === "night") {
      return interaction.reply({
        content: "It is already night. Use /day when the night is finished.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    await deletePrivateChannels(interaction, state);

    state.phase = "night";
    state.currentNight = (state.currentNight || 0) + 1;
    const logChannel = await getLogChannel(interaction, state);
    await logChannel?.send(`Night ${state.currentNight} has started.`);

    const livingPlayers = livingParticipantIds(state);
    const privateChannels = [];

    for (let index = 0; index < livingPlayers.length; index++) {
      const member = await interaction.guild.members.fetch(livingPlayers[index]);
      const channel = await interaction.guild.channels.create({
        name: channelNameFor(member, index),
        type: ChannelType.GuildVoice,
        parent: state.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
            ],
          },
          {
            id: state.gm,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.MoveMembers,
            ],
          },
          {
            id: client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.MoveMembers,
            ],
          },
        ],
      });
      privateChannels.push(channel);

      if (member.voice.channel) {
        await member.voice.setChannel(channel).catch(async (error) => {
          console.error(`Failed to move ${member.user.tag}:`, error);
          await logChannel?.send(`Could not move <@${member.id}> to ${channel.name}.`);
        });
      } else {
        await logChannel?.send(`<@${member.id}> is not connected to voice.`);
      }
    }

    state.privateChannelIds = privateChannels.map((channel) => channel.id);
    save(interaction, client, state);

    await interaction.editReply({
      content: `Night ${state.currentNight}: ${privateChannels.length} private channel(s) ready.`,
    });
  },
};
