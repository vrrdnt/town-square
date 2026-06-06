export async function requireSession(interaction, client) {
  const state = client.session.get(interaction.guild.id);
  if (!state) {
    await interaction.reply({
      content: "No active game session.",
      ephemeral: true,
    });
    return null;
  }
  return state;
}

export async function requireStoryteller(interaction, client) {
  const state = await requireSession(interaction, client);
  if (!state) return null;

  if (interaction.user.id !== state.gm) {
    await interaction.reply({
      content: "Only the Storyteller can use that command.",
      ephemeral: true,
    });
    return null;
  }

  return state;
}

export async function getLogChannel(interaction, state) {
  if (!state.logChannelId) return null;
  return interaction.guild.channels.fetch(state.logChannelId).catch(() => null);
}

export async function setStoredNickname(member, state) {
  state.nicknames ||= {};
  if (!(member.id in state.nicknames)) {
    state.nicknames[member.id] = member.nickname;
  }
}

export async function restoreNickname(member, state) {
  const nickname = state.nicknames?.[member.id] ?? null;
  await member.setNickname(nickname);
}

export function deadNickname(member) {
  const name = member.displayName.replace(/^\[DEAD\]\s*/, "");
  return `[DEAD] ${name}`.slice(0, 32);
}

export function activeTravellers(state) {
  return (state.travellers || []).filter((traveller) => !traveller.exiled);
}

export function activeTravellerIds(state) {
  return activeTravellers(state).map((traveller) => traveller.playerId);
}

export function activeParticipantIds(state) {
  return [...state.players, ...activeTravellerIds(state)];
}

export function livingPlayerIds(state) {
  return state.players.filter(
    (playerId) => !(state.deadPlayers || []).includes(playerId)
  );
}

export function livingParticipantIds(state) {
  return activeParticipantIds(state).filter(
    (playerId) => !(state.deadPlayers || []).includes(playerId)
  );
}

export function isActiveParticipant(state, playerId) {
  return activeParticipantIds(state).includes(playerId);
}

export function findTraveller(state, playerId) {
  return (state.travellers || []).find(
    (traveller) => traveller.playerId === playerId
  );
}

export function save(interaction, client, state) {
  client.saveSession(interaction.guild.id, state);
}
