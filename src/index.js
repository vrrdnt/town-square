import {
  ChannelType,
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import {
  PLAYER_ROLE_NAME,
  STORYTELLER_ROLE_NAME,
  publicCharacterName,
  shouldEvilLearnInfo,
} from "./botcData.js";
import { loadSessions, saveSessions } from "./sessionStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

client.commands = new Collection();
client.session = loadSessions();
client.saveSession = (guildId, state) => {
  client.session.set(guildId, state);
  saveSessions(client.session);
};
client.deleteSession = (guildId) => {
  client.session.delete(guildId);
  saveSessions(client.session);
};

const commandsPath = path.join(__dirname, "commands");
for (const file of fs
  .readdirSync(commandsPath)
  .filter((name) => name.endsWith(".js"))) {
  const command = (await import(pathToFileURL(path.join(commandsPath, file)).href))
    .default;
  client.commands.set(command.data.name, command);
}

async function registerCommands() {
  const payload = [...client.commands.values()].map((command) =>
    command.data.toJSON()
  );

  if (process.env.DEV_GUILD_ID) {
    const guild = await client.guilds.fetch(process.env.DEV_GUILD_ID);
    await guild.commands.set(payload);
    console.log(`Registered ${payload.length} guild command(s).`);
    return;
  }

  await client.application.commands.set(payload);
  console.log(`Registered ${payload.length} global command(s).`);
}

async function sendAssignmentDms(guild, state, logChannel) {
  if (!state.assignments || state.assignmentsSent) return;

  for (const playerId of state.players) {
    const characterInfo = state.assignments[playerId];
    if (!characterInfo) continue;

    const member = await guild.members.fetch(playerId).catch(() => null);
    if (!member) continue;

    try {
      await member.send(
        `Your character is ${characterInfo.name}. Your starting alignment is ${characterInfo.alignment}. Keep this private.\nAbility: ${characterInfo.ability}`
      );
    } catch (error) {
      console.error(`Failed to DM assignment to ${member.user.tag}:`, error);
      await logChannel?.send(
        `Could not DM <@${playerId}> their character. Tell them privately.`
      );
    }
  }

  state.assignmentsSent = true;
}

async function sendEvilInfo(channel, state) {
  if (!channel || !shouldEvilLearnInfo(state.players.length)) return;
  if (!state.evilPlayers?.length) return;

  const evilLines = state.evilPlayers.map((playerId) => {
    const characterInfo = state.assignments?.[playerId];
    const roleText = characterInfo ? ` - ${characterInfo.name}` : "";
    return `<@${playerId}>${roleText}`;
  });
  const bluffText = state.demonBluffs?.length
    ? `\n\nDemon bluffs: ${state.demonBluffs.join(", ")}`
    : "";

  await channel.send(`Evil team information:\n${evilLines.join("\n")}${bluffText}`);
}

async function ensureGameRoles(interaction, state) {
  let storytellerRole = state.storytellerRoleId
    ? await interaction.guild.roles.fetch(state.storytellerRoleId).catch(() => null)
    : null;
  if (!storytellerRole) {
    storytellerRole = interaction.guild.roles.cache.find(
      (role) => role.name === STORYTELLER_ROLE_NAME
    );
  }
  if (!storytellerRole) {
    storytellerRole = await interaction.guild.roles.create({
      name: STORYTELLER_ROLE_NAME,
      color: "#e74c3c",
      hoist: true,
    });
    state.createdStorytellerRole = true;
  }
  state.storytellerRoleId = storytellerRole.id;

  let playerRole = state.playerRoleId
    ? await interaction.guild.roles.fetch(state.playerRoleId).catch(() => null)
    : null;
  if (!playerRole) {
    playerRole = interaction.guild.roles.cache.find(
      (role) => role.name === PLAYER_ROLE_NAME
    );
  }
  if (!playerRole) {
    playerRole = await interaction.guild.roles.create({
      name: PLAYER_ROLE_NAME,
      color: "#2ecc71",
      hoist: true,
    });
    state.createdPlayerRole = true;
  }
  state.playerRoleId = playerRole.id;

  const gmMember = await interaction.guild.members.fetch(state.gm);
  await gmMember.roles.add(storytellerRole);

  state.nicknames ||= {};
  for (const playerId of state.players) {
    const member = await interaction.guild.members.fetch(playerId);
    if (!(playerId in state.nicknames)) state.nicknames[playerId] = member.nickname;
    await member.roles.add(playerRole);
  }

  return storytellerRole;
}

async function createGameChannels(interaction, state) {
  const storytellerRole = await ensureGameRoles(interaction, state);

  const category = await interaction.guild.channels.create({
    name: "Ravenswood Bluff",
    type: ChannelType.GuildCategory,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.UseSoundboard],
      },
      {
        id: state.playerRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: storytellerRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.MoveMembers,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.UseSoundboard,
        ],
      },
      {
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.MoveMembers,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  const logChannel = await interaction.guild.channels.create({
    name: "town-square-log",
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: storytellerRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  const townSquare = await interaction.guild.channels.create({
    name: "Town Square",
    type: ChannelType.GuildVoice,
    parent: category.id,
  });

  state.categoryId = category.id;
  state.townSquareId = townSquare.id;
  state.logChannelId = logChannel.id;
  state.phase = "setup";

  await sendAssignmentDms(interaction.guild, state, logChannel);

  if (shouldEvilLearnInfo(state.players.length) && state.evilPlayers.length > 0) {
    const evilChannel = await interaction.guild.channels.create({
      name: "hell",
      type: ChannelType.GuildText,
      topic: "Evil team information for standard 7+ player games.",
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        ...state.evilPlayers.map((playerId) => ({
          id: playerId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ReadMessageHistory,
          ],
          deny: [PermissionFlagsBits.SendMessages],
        })),
        {
          id: state.gm,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });

    state.evilChannelId = evilChannel.id;
    await sendEvilInfo(evilChannel, state);
  }

  return logChannel;
}

async function cleanupPendingSetup(interaction, state) {
  for (const playerId of state.players || []) {
    const member = await interaction.guild.members.fetch(playerId).catch(() => null);
    if (member && state.playerRoleId) {
      await member.roles.remove(state.playerRoleId).catch(() => null);
    }
  }

  const storyteller = await interaction.guild.members.fetch(state.gm).catch(() => null);
  if (storyteller && state.storytellerRoleId) {
    await storyteller.roles.remove(state.storytellerRoleId).catch(() => null);
  }

  if (state.createdPlayerRole && state.playerRoleId) {
    const role = await interaction.guild.roles.fetch(state.playerRoleId).catch(() => null);
    if (role) await role.delete().catch(() => null);
  }
  if (state.createdStorytellerRole && state.storytellerRoleId) {
    const role = await interaction.guild.roles
      .fetch(state.storytellerRoleId)
      .catch(() => null);
    if (role) await role.delete().catch(() => null);
  }
}

async function runButtonCommand(interaction, commandName) {
  const command = client.commands.get(commandName);
  if (!command) return false;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`Error running ${commandName} button:`, error);
    const response = { content: "There was an error.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(response);
    } else {
      await interaction.reply(response);
    }
  }

  return true;
}

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command?.autocomplete) {
      await interaction.respond([]);
      return;
    }

    try {
      await command.autocomplete(interaction, client);
    } catch (error) {
      console.error("Error running autocomplete:", error);
      await interaction.respond([]).catch(() => null);
    }
    return;
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error("Error running command:", error);
      const response = { content: "There was an error.", ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(response);
      } else {
        await interaction.reply(response);
      }
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    const [prefix] = interaction.customId.split(":");
    const command = prefix === "setupModal" ? client.commands.get("setup") : null;
    if (!command?.handleModal) return;

    try {
      await command.handleModal(interaction, client);
    } catch (error) {
      console.error("Error running modal handler:", error);
      const response = { content: "There was an error.", ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(response);
      } else {
        await interaction.reply(response);
      }
    }
    return;
  }

  if (interaction.isStringSelectMenu()) {
    const state = client.session.get(interaction.guild.id);
    if (!state) return;

    if (interaction.user.id !== state.gm) {
      await interaction.reply({
        content: "Only the Storyteller can use setup controls.",
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId.startsWith("setupAssign:")) {
      const command = client.commands.get("setup");
      await command?.handleSelect?.(interaction, client);
    }
    return;
  }

  if (!interaction.isButton()) return;

  const state = client.session.get(interaction.guild.id);
  if (!state) return;

  if (interaction.user.id !== state.gm) {
    await interaction.reply({
      content: "Only the Storyteller can use this setup button.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.customId.startsWith("quick:")) {
    const commandName = {
      "quick:day": "day",
      "quick:night": "night",
      "quick:nightguide": "nightguide",
      "quick:status": "status",
    }[interaction.customId];

    if (commandName) {
      await runButtonCommand(interaction, commandName);
    }
    return;
  }

  if (
    interaction.customId.startsWith("setupAssignOpen:") ||
    interaction.customId === "setupAssignClear" ||
    interaction.customId === "setupReview"
  ) {
    const command = client.commands.get("setup");
    await command?.handleButton?.(interaction, client);
    return;
  }

  if (interaction.customId === "cancelSetup") {
    await interaction.deferUpdate();
    await cleanupPendingSetup(interaction, state);
    client.deleteSession(interaction.guild.id);
    await interaction.editReply({ content: "Setup cancelled.", components: [] });
    return;
  }

  if (interaction.customId !== "proceedSetup") return;

  if (state.assignments) {
    const assigned = Object.keys(state.assignments).length;
    if (assigned !== state.players.length) {
      await interaction.reply({
        content: "Finish assigning every player, or clear assignments before proceeding.",
        ephemeral: true,
      });
      return;
    }
  }

  await interaction.deferUpdate();
  const logChannel = await createGameChannels(interaction, state);
  client.saveSession(interaction.guild.id, state);

  await interaction.editReply({
    content: "Ravenswood Bluff is ready. Use /dashboard for Storyteller controls.",
    components: [],
  });

  const assigned = state.assignments
    ? Object.values(state.assignments).map(publicCharacterName).join(", ")
    : "No character assignments recorded.";
  await logChannel.send(`Setup complete.\nCharacters: ${assigned}`);
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  if (process.env.REGISTER_COMMANDS !== "false") {
    await registerCommands();
  }
});

client.login(process.env.BOT_TOKEN);
