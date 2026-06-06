export const SETUP_COUNTS = {
  5: { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
  6: { townsfolk: 3, outsiders: 1, minions: 1, demons: 1 },
  7: { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
  8: { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
  9: { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
  10: { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
  11: { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
  12: { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
  13: { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
  14: { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 },
  15: { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 },
};

export const CHARACTER_TYPES = ["townsfolk", "outsiders", "minions", "demons"];

const TYPE_LABELS = {
  townsfolk: "Townsfolk",
  outsiders: "Outsider",
  minions: "Minion",
  demons: "Demon",
  travellers: "Traveller",
  fabled: "Fabled",
};

const CHARACTER_ABILITIES = {
  washerwoman:
    "You start knowing that 1 of 2 players is a particular Townsfolk.",
  librarian:
    "You start knowing that 1 of 2 players is a particular Outsider, or that none are in play.",
  investigator:
    "You start knowing that 1 of 2 players is a particular Minion.",
  chef: "You start knowing how many pairs of evil players are neighboring each other.",
  empath:
    "Each night, learn how many of your 2 alive neighbors are evil.",
  fortuneteller:
    "Each night, choose 2 players; learn if either is the Demon. One good player registers falsely to you.",
  undertaker:
    "Each night*, learn which character died by execution today.",
  monk: "Each night*, choose a player other than yourself: they are safe from the Demon tonight.",
  ravenkeeper:
    "If you die at night, wake and choose a player: you learn their character.",
  virgin:
    "The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.",
  slayer:
    "Once per game, publicly choose a player: if they are the Demon, they die.",
  soldier: "You are safe from the Demon.",
  mayor:
    "If only 3 players live and no execution occurs, good wins. If you die at night, another player might die instead.",
  butler:
    "Each night, choose a player: tomorrow, you may only vote if they are voting too.",
  drunk:
    "You do not know you are the Drunk. You think you are a Townsfolk, but you have no ability.",
  recluse:
    "You might register as evil and as a Minion or Demon, even if dead.",
  saint: "If you die by execution, evil wins.",
  poisoner:
    "Each night, choose a player: they are poisoned tonight and tomorrow day.",
  spy: "Each night, see the Grimoire. You might register as good and as a Townsfolk or Outsider, even if dead.",
  scarletwoman:
    "If there are 5 or more living non-Travellers and the Demon dies, you become the Demon.",
  baron: "There are 2 extra Outsiders in play.",
  imp: "Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.",
  grandmother:
    "You start knowing a good player and their character. If the Demon kills them, you die too.",
  sailor:
    "Each night, choose a living player: one of you is drunk until dusk. You cannot die.",
  chambermaid:
    "Each night, choose 2 living players other than yourself: learn how many woke due to their ability tonight.",
  exorcist:
    "Each night*, choose a player different from last night: if they are the Demon, they learn you chose them and do not wake.",
  innkeeper:
    "Each night*, choose 2 players: they cannot die tonight, but one is drunk until dusk.",
  gambler:
    "Each night*, choose a player and guess their character: if wrong, you die.",
  gossip:
    "Each day, make one public statement: if true, a player dies tonight.",
  courtier:
    "Once per game, at night, choose a character: they are drunk for 3 nights and 3 days.",
  professor:
    "Once per game, at night*, choose a dead player: if they are a Townsfolk, they are resurrected.",
  minstrel:
    "When a Minion dies by execution, all other players are drunk until dusk tomorrow.",
  tealady:
    "If both your living neighbors are good, they cannot die.",
  pacifist: "Executed good players might not die.",
  fool: "The 1st time you die, you do not.",
  goon:
    "Each night, the 1st player to choose you becomes drunk until dusk and you become their alignment.",
  lunatic:
    "You think you are the Demon, but you are not. The Demon knows who you are and who you choose at night.",
  tinker: "You might die at any time.",
  moonchild:
    "When you learn that you died, publicly choose a living player: if they are good, they die tonight.",
  godfather:
    "You start knowing which Outsiders are in play. If an Outsider died today, choose a player tonight: they die. Setup has -1 or +1 Outsider.",
  devilsadvocate:
    "Each night, choose a living player different from last night: if executed tomorrow, they do not die.",
  assassin:
    "Once per game, at night*, choose a player: they die, even if they could not.",
  mastermind:
    "If the Demon dies by execution with 5 or more living non-Travellers, play one more day. If a player is then executed, their team loses.",
  zombuul:
    "Each night*, if nobody died today, choose a player: they die. The 1st time you die, you live but register as dead.",
  pukka:
    "Each night, choose a player: they are poisoned. The previously poisoned player dies and becomes healthy.",
  shabaloth:
    "Each night*, choose 2 players: they die. A dead player you chose last night might be regurgitated.",
  po: "Each night*, choose a player: they die. If you chose nobody last night, choose 3 players tonight.",
  clockmaker:
    "You start knowing the shortest distance from the Demon to the nearest Minion.",
  dreamer:
    "Each night, choose a player other than yourself or a Traveller: learn 1 good and 1 evil character, one of which is correct.",
  snakecharmer:
    "Each night, choose a living player: if they are the Demon, swap characters and alignments with them, then they are poisoned.",
  mathematician:
    "Each night, learn how many players' abilities malfunctioned since dawn because of another character's ability.",
  flowergirl:
    "Each night*, learn whether a Demon voted today.",
  towncrier:
    "Each night*, learn whether a Minion nominated today.",
  oracle: "Each night*, learn how many dead players are evil.",
  savant:
    "Each day, privately visit the Storyteller: learn 2 statements, one true and one false.",
  seamstress:
    "Once per game, at night, choose 2 players other than yourself: learn whether they have the same alignment.",
  philosopher:
    "Once per game, at night, choose a good character: gain that ability. If it is in play, its owner is drunk.",
  artist:
    "Once per game, during the day, privately ask the Storyteller any yes/no question.",
  juggler:
    "On your 1st day, publicly guess up to 5 players' characters. That night, learn how many are correct.",
  sage: "If the Demon kills you, learn that it is 1 of 2 players.",
  mutant:
    "If you are mad about being an Outsider, you might be executed.",
  sweetheart: "When you die, one player is drunk from now on.",
  barber:
    "If you die, the Demon may choose 2 players tonight, not another Demon, to swap characters.",
  klutz:
    "When you learn that you died, publicly choose a living player: if they are evil, your team loses.",
  eviltwin:
    "You and an opposing player know each other. If the good twin is executed, evil wins. Good cannot win while you both live.",
  witch:
    "Each night, choose a player: if they nominate tomorrow, they die. If only 3 players live, you lose this ability.",
  cerenovus:
    "Each night, choose a player and a good character: tomorrow, they are mad they are that character or might be executed.",
  pithag:
    "Each night*, choose a player and a character they become, if not in play. If a Demon is created, deaths are arbitrary.",
  fanggu:
    "Each night*, choose a player: they die. The 1st Outsider killed this way becomes an evil Fang Gu and you die instead. Setup has +1 Outsider.",
  vigormortis:
    "Each night*, choose a player: they die. Minions you kill keep their ability and poison a neighboring Townsfolk. Setup has -1 Outsider.",
  nodashii:
    "Each night*, choose a player: they die. Your 2 neighboring Townsfolk are poisoned.",
  vortox:
    "Each night*, choose a player: they die. Townsfolk abilities yield false info. If no execution occurs in a day, evil wins.",
};

function normalizeKey(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

function character(name, type) {
  const id = normalizeKey(name);
  return {
    id,
    name,
    type,
    alignment: type === "minions" || type === "demons" ? "evil" : "good",
    ability: CHARACTER_ABILITIES[id] || null,
  };
}

function traveller(name, ability) {
  return {
    id: normalizeKey(name),
    name,
    type: "travellers",
    alignment: null,
    ability,
  };
}

function fabled(name, ability) {
  return {
    id: normalizeKey(name),
    name,
    type: "fabled",
    alignment: null,
    ability,
  };
}

export const EDITIONS = {
  trouble_brewing: {
    id: "trouble_brewing",
    name: "Trouble Brewing",
    characters: [
      character("Washerwoman", "townsfolk"),
      character("Librarian", "townsfolk"),
      character("Investigator", "townsfolk"),
      character("Chef", "townsfolk"),
      character("Empath", "townsfolk"),
      character("Fortune Teller", "townsfolk"),
      character("Undertaker", "townsfolk"),
      character("Monk", "townsfolk"),
      character("Ravenkeeper", "townsfolk"),
      character("Virgin", "townsfolk"),
      character("Slayer", "townsfolk"),
      character("Soldier", "townsfolk"),
      character("Mayor", "townsfolk"),
      character("Butler", "outsiders"),
      character("Drunk", "outsiders"),
      character("Recluse", "outsiders"),
      character("Saint", "outsiders"),
      character("Poisoner", "minions"),
      character("Spy", "minions"),
      character("Scarlet Woman", "minions"),
      character("Baron", "minions"),
      character("Imp", "demons"),
    ],
    travellers: [
      traveller(
        "Scapegoat",
        "If a player of your alignment is executed, you might be executed instead."
      ),
      traveller(
        "Gunslinger",
        "Each day, after the 1st vote has been tallied, you may choose a player that voted: they die."
      ),
      traveller(
        "Beggar",
        "You must use a vote token to vote. If a dead player gives you theirs, you learn their alignment. You are sober and healthy."
      ),
      traveller(
        "Bureaucrat",
        "Each night, choose a player (not yourself): their vote counts as 3 votes tomorrow."
      ),
      traveller(
        "Thief",
        "Each night, choose a player (not yourself): their vote counts negatively tomorrow."
      ),
    ],
  },
  bad_moon_rising: {
    id: "bad_moon_rising",
    name: "Bad Moon Rising",
    characters: [
      character("Grandmother", "townsfolk"),
      character("Sailor", "townsfolk"),
      character("Chambermaid", "townsfolk"),
      character("Exorcist", "townsfolk"),
      character("Innkeeper", "townsfolk"),
      character("Gambler", "townsfolk"),
      character("Gossip", "townsfolk"),
      character("Courtier", "townsfolk"),
      character("Professor", "townsfolk"),
      character("Minstrel", "townsfolk"),
      character("Tea Lady", "townsfolk"),
      character("Pacifist", "townsfolk"),
      character("Fool", "townsfolk"),
      character("Goon", "outsiders"),
      character("Lunatic", "outsiders"),
      character("Tinker", "outsiders"),
      character("Moonchild", "outsiders"),
      character("Godfather", "minions"),
      character("Devil's Advocate", "minions"),
      character("Assassin", "minions"),
      character("Mastermind", "minions"),
      character("Zombuul", "demons"),
      character("Pukka", "demons"),
      character("Shabaloth", "demons"),
      character("Po", "demons"),
    ],
    travellers: [
      traveller(
        "Apprentice",
        "On your 1st night, you gain a Townsfolk ability if good, or a Minion ability if evil."
      ),
      traveller(
        "Matron",
        "Each day, you may choose up to 3 sets of 2 players to swap seats. Players may not leave their seats to talk in private."
      ),
      traveller(
        "Voudon",
        "Only you and the dead can vote. They do not need a vote token to do so. A 50% majority is not required."
      ),
      traveller(
        "Judge",
        "Once per game, if another player nominated, you may choose to force the current execution to pass or fail."
      ),
      traveller(
        "Bishop",
        "Only the Storyteller can nominate. At least 1 opposing player must be nominated each day."
      ),
    ],
  },
  sects_violets: {
    id: "sects_violets",
    name: "Sects & Violets",
    characters: [
      character("Clockmaker", "townsfolk"),
      character("Dreamer", "townsfolk"),
      character("Snake Charmer", "townsfolk"),
      character("Mathematician", "townsfolk"),
      character("Flowergirl", "townsfolk"),
      character("Town Crier", "townsfolk"),
      character("Oracle", "townsfolk"),
      character("Savant", "townsfolk"),
      character("Seamstress", "townsfolk"),
      character("Philosopher", "townsfolk"),
      character("Artist", "townsfolk"),
      character("Juggler", "townsfolk"),
      character("Sage", "townsfolk"),
      character("Mutant", "outsiders"),
      character("Sweetheart", "outsiders"),
      character("Barber", "outsiders"),
      character("Klutz", "outsiders"),
      character("Evil Twin", "minions"),
      character("Witch", "minions"),
      character("Cerenovus", "minions"),
      character("Pit-Hag", "minions"),
      character("Fang Gu", "demons"),
      character("Vigormortis", "demons"),
      character("No Dashii", "demons"),
      character("Vortox", "demons"),
    ],
    travellers: [
      traveller(
        "Butcher",
        "Each day, after the 1st execution, you may nominate again."
      ),
      traveller(
        "Bone Collector",
        "Once per game, at night*, choose a dead player: they regain their ability until dusk."
      ),
      traveller(
        "Harlot",
        "Each night*, choose a living player: if they agree, you learn their character, but you both might die."
      ),
      traveller(
        "Barista",
        "Each night, until dusk, 1) a player becomes sober, healthy and gets true info, or 2) their ability works twice. They learn which."
      ),
      traveller("Deviant", "If you were funny today, you cannot die by exile."),
    ],
  },
};

export const FABLED = [
  fabled(
    "Angel",
    "Something bad might happen to whoever is most responsible for the death of a new player."
  ),
  fabled(
    "Buddhist",
    "For the first 2 minutes of each day, veteran players may not talk."
  ),
  fabled(
    "Doomsayer",
    "If 4 or more players live, each living player may publicly choose once per game that a player of their own alignment dies."
  ),
  fabled(
    "Fiddler",
    "Once per game, the Demon secretly chooses an opposing player: all players choose which of these 2 players win."
  ),
  fabled(
    "Hell's Librarian",
    "Something bad might happen to whoever talks when the Storyteller has asked for silence."
  ),
  fabled(
    "Revolutionary",
    "2 neighboring players are known to be the same alignment. Once per game, 1 of them registers falsely."
  ),
  fabled("Toymaker", "The Demon may choose not to attack and must do this at least once per game."),
  fabled("Djinn", "Use the Djinn's special rule for scripts with jinxes."),
  fabled("Duchess", "Each day, 3 players may visit you. At night*, each visitor learns how many visitors are evil, but 1 gets false info."),
  fabled("Fibbin", "Once per game, 1 good player might get false information."),
  fabled("Sentinel", "There might be 1 extra or 1 fewer Outsider in play."),
  fabled("Spirit of Ivory", "There cannot be more than 1 extra evil player."),
];

const NIGHT_CHECKLIST = {
  trouble_brewing: {
    first: [
      "bureaucrat",
      "thief",
      "poisoner",
      "washerwoman",
      "librarian",
      "investigator",
      "chef",
      "empath",
      "fortuneteller",
      "butler",
      "spy",
    ],
    other: [
      "bureaucrat",
      "thief",
      "poisoner",
      "monk",
      "scarletwoman",
      "imp",
      "ravenkeeper",
      "empath",
      "fortuneteller",
      "undertaker",
      "butler",
      "spy",
    ],
  },
  bad_moon_rising: {
    first: [
      "apprentice",
      "lunatic",
      "sailor",
      "courtier",
      "godfather",
      "devilsadvocate",
      "pukka",
      "grandmother",
      "chambermaid",
    ],
    other: [
      "sailor",
      "courtier",
      "innkeeper",
      "gambler",
      "devilsadvocate",
      "lunatic",
      "exorcist",
      "zombuul",
      "pukka",
      "shabaloth",
      "po",
      "assassin",
      "godfather",
      "gossip",
      "professor",
      "tinker",
      "moonchild",
      "grandmother",
      "chambermaid",
    ],
  },
  sects_violets: {
    first: [
      "barista",
      "philosopher",
      "snakecharmer",
      "eviltwin",
      "witch",
      "cerenovus",
      "clockmaker",
      "dreamer",
      "seamstress",
      "mathematician",
    ],
    other: [
      "barista",
      "harlot",
      "bonecollector",
      "philosopher",
      "snakecharmer",
      "witch",
      "cerenovus",
      "pithag",
      "fanggu",
      "nodashii",
      "vortox",
      "vigormortis",
      "barber",
      "sweetheart",
      "sage",
      "dreamer",
      "flowergirl",
      "towncrier",
      "oracle",
      "seamstress",
      "juggler",
      "mathematician",
    ],
  },
};

const NIGHT_REMINDERS = {
  poisoner: {
    first: "Choose a player to poison tonight and tomorrow day.",
    other: "Choose a player to poison tonight and tomorrow day.",
  },
  washerwoman: { first: "Show a Townsfolk token and point to 2 players." },
  librarian: { first: "Show an Outsider token and point to 2 players, or show none." },
  investigator: { first: "Show a Minion token and point to 2 players." },
  chef: { first: "Give the number of neighboring evil pairs." },
  empath: {
    first: "Give the number of evil alive neighbors.",
    other: "Give the number of evil alive neighbors.",
  },
  fortuneteller: {
    first: "They choose 2 players; nod if either is the Demon or red herring.",
    other: "They choose 2 players; nod if either is the Demon or red herring.",
  },
  butler: {
    first: "Choose the player they must follow when voting tomorrow.",
    other: "Choose the player they must follow when voting tomorrow.",
  },
  spy: {
    first: "Show the Grimoire.",
    other: "Show the Grimoire.",
  },
  monk: { other: "Choose a player to protect from the Demon tonight." },
  imp: { other: "Choose a player to die; handle self-kill Demon transfer if needed." },
  ravenkeeper: { other: "If killed tonight, wake them to choose a player and learn their character." },
  undertaker: { other: "If there was an execution today, show the executed player's character." },
  scarletwoman: { other: "If the Demon died with 5+ living non-Travellers, show the new Demon token." },
  thief: {
    first: "Choose a player whose vote counts negatively tomorrow.",
    other: "Choose a player whose vote counts negatively tomorrow.",
  },
  bureaucrat: {
    first: "Choose a player whose vote counts as 3 tomorrow.",
    other: "Choose a player whose vote counts as 3 tomorrow.",
  },
  grandmother: {
    first: "Point to the grandchild and show their character.",
    other: "If the Demon killed the grandchild, the Grandmother dies too.",
  },
  sailor: {
    first: "Choose a living player; one of them is drunk until dusk.",
    other: "Choose a living player; one of them is drunk until dusk.",
  },
  chambermaid: {
    first: "They choose 2 living players; give how many woke due to ability.",
    other: "They choose 2 living players; give how many woke due to ability.",
  },
  courtier: {
    first: "Optionally choose a character to drunk for 3 nights and days.",
    other: "Optionally choose a character to drunk for 3 nights and days.",
  },
  lunatic: {
    first: "Simulate Demon info; then show the real Demon who the Lunatic is.",
    other: "Simulate Demon action, then tell the real Demon the Lunatic target.",
  },
  godfather: {
    first: "Show all in-play Outsider tokens.",
    other: "If an Outsider died today, choose a player to die.",
  },
  devilsadvocate: {
    first: "Choose a living player to survive execution tomorrow.",
    other: "Choose a different living player to survive execution tomorrow.",
  },
  pukka: {
    first: "Choose a player to poison.",
    other: "Previously poisoned player dies and becomes healthy; choose a new poisoned player.",
  },
  innkeeper: { other: "Choose 2 players safe tonight; one is drunk until dusk." },
  gambler: { other: "Choose a player and character; die if the guess is wrong." },
  exorcist: { other: "Choose a player; if Demon, tell the Demon and skip their wake." },
  professor: { other: "Optionally choose a dead player to resurrect if Townsfolk." },
  gossip: { other: "If today's public Gossip statement was true, kill a player." },
  tinker: { other: "May die at Storyteller discretion." },
  moonchild: { other: "If their chosen player is good, that player dies." },
  assassin: { other: "Once per game, may choose a player to die." },
  shabaloth: { other: "May regurgitate last night's victim, then choose 2 players." },
  po: { other: "Choose 1 player, or 3 if the Po charged last night." },
  zombuul: { other: "If nobody died today, choose a player to die." },
  apprentice: { first: "Give a Townsfolk ability if good, or Minion ability if evil." },
  clockmaker: { first: "Give the Demon-to-nearest-Minion distance." },
  snakecharmer: {
    first: "Choose a player; if Demon, swap characters and alignments.",
    other: "Choose a player; if Demon, swap characters and alignments.",
  },
  mathematician: {
    first: "Give the count of malfunctioning abilities since dawn.",
    other: "Give the count of malfunctioning abilities since dawn.",
  },
  dreamer: {
    first: "Choose a non-Traveller; show 1 good and 1 evil character, one correct.",
    other: "Choose a non-Traveller; show 1 good and 1 evil character, one correct.",
  },
  seamstress: {
    first: "Once per game, may choose 2 players and learn same alignment yes/no.",
    other: "Once per game, may choose 2 players and learn same alignment yes/no.",
  },
  philosopher: {
    first: "Once per game, may choose a good character and gain its ability.",
    other: "Once per game, may choose a good character and gain its ability.",
  },
  eviltwin: { first: "Wake both twins, allow eye contact, and show each other's character." },
  witch: {
    first: "Choose a player who dies if they nominate tomorrow.",
    other: "Choose a player who dies if they nominate tomorrow.",
  },
  cerenovus: {
    first: "Choose a player and good character; wake target with madness instruction.",
    other: "Choose a player and good character; wake target with madness instruction.",
  },
  flowergirl: { other: "Nod if a Demon voted today; otherwise shake head." },
  towncrier: { other: "Nod if a Minion nominated today; otherwise shake head." },
  oracle: { other: "Give the number of dead evil players." },
  juggler: { other: "Give the number of correct public character guesses." },
  sage: { other: "If killed by Demon, point to 2 players, one of which is the Demon." },
  sweetheart: { other: "If dead, make one player drunk from now on." },
  barber: { other: "If dead today/tonight, let the Demon swap 2 non-Demon characters." },
  pithag: { other: "Choose a player and character; change them if the character is not in play." },
  nodashii: { other: "Choose a player to die." },
  vigormortis: { other: "Choose a player to die; if Minion, poison a neighboring Townsfolk." },
  vortox: { other: "Choose a player to die; remember Townsfolk info must be false." },
  fanggu: { other: "Choose a player to die; handle first Outsider jump if applicable." },
  barista: {
    first: "Choose a player for sober/healthy/true info or double ability.",
    other: "Choose a player for sober/healthy/true info or double ability.",
  },
  harlot: { other: "Choose a living player; if they agree, show their character and maybe kill both." },
  bonecollector: { other: "Once per game, may give a dead player their ability until dusk." },
};

export const EDITION_CHOICES = Object.values(EDITIONS).map((edition) => ({
  name: edition.name,
  value: edition.id,
}));

export const TRAVELLER_CHOICES = Object.values(EDITIONS).flatMap((edition) =>
  edition.travellers.map((entry) => ({
    name: `${entry.name} (${edition.name})`,
    value: entry.id,
  }))
);

export const FABLED_CHOICES = FABLED.map((entry) => ({
  name: entry.name,
  value: entry.id,
}));

export const PLAYER_ROLE_NAME = "Town Square Player";
export const STORYTELLER_ROLE_NAME = "Storyteller";

export function parseUserMentions(raw) {
  const matches = [...(raw || "").matchAll(/<@!?(\d+)>/g)].map(
    (match) => match[1]
  );
  return [...new Set(matches)];
}

export function parseCharacterNames(raw) {
  return (raw || "")
    .split(/[,;\n]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function parseAssignments(raw) {
  const assignments = new Map();
  const errors = [];
  const pattern = /<@!?(\d+)>\s*(?:=|:|-)\s*([^,;\n]+)/g;
  const matches = [...(raw || "").matchAll(pattern)];

  if ((raw || "").trim() && matches.length === 0) {
    errors.push("Use entries like @Player=Chef, @Player=Imp.");
  }

  for (const match of matches) {
    const playerId = match[1];
    const characterName = match[2].trim().replace(/^["']|["']$/g, "");
    if (assignments.has(playerId)) {
      errors.push(`<@${playerId}> has more than one character assignment.`);
    }
    assignments.set(playerId, characterName);
  }

  return { assignments, errors };
}

export function getEdition(editionId) {
  return EDITIONS[editionId] || EDITIONS.trouble_brewing;
}

export function getSetupCounts(playerCount) {
  return SETUP_COUNTS[playerCount] || null;
}

export function shouldEvilLearnInfo(playerCount) {
  return playerCount >= 7;
}

export function getCharacter(name, editionId) {
  const edition = getEdition(editionId);
  const key = normalizeKey(name);
  return edition.characters.find((entry) => entry.id === key) || null;
}

export function getCharacterById(characterId, editionId) {
  const edition = getEdition(editionId);
  return (
    edition.characters.find((entry) => entry.id === normalizeKey(characterId)) ||
    null
  );
}

export function getTraveller(nameOrId, editionId) {
  const key = normalizeKey(nameOrId);
  const editions = editionId ? [getEdition(editionId)] : Object.values(EDITIONS);
  for (const edition of editions) {
    const match = edition.travellers.find((entry) => entry.id === key);
    if (match) return { ...match, editionId: edition.id, editionName: edition.name };
  }
  return null;
}

export function getFabled(nameOrId) {
  const key = normalizeKey(nameOrId);
  return FABLED.find((entry) => entry.id === key) || null;
}

export function formatSetupCounts(counts) {
  if (!counts) return "5-15 players use the base setup chart.";
  return `${counts.townsfolk} Townsfolk, ${counts.outsiders} Outsider(s), ${counts.minions} Minion(s), ${counts.demons} Demon`;
}

export function countByType(characters) {
  return characters.reduce(
    (totals, characterInfo) => ({
      ...totals,
      [characterInfo.type]: totals[characterInfo.type] + 1,
    }),
    { townsfolk: 0, outsiders: 0, minions: 0, demons: 0 }
  );
}

export function validateCharacterList(characterNames, editionId, playerCount) {
  const errors = [];
  const warnings = [];
  const characters = [];
  const seenCharacters = new Set();
  const counts = getSetupCounts(playerCount);

  for (const name of characterNames) {
    const characterInfo = getCharacter(name, editionId);
    if (!characterInfo) {
      errors.push(`Unknown ${getEdition(editionId).name} character: ${name}.`);
      continue;
    }
    if (seenCharacters.has(characterInfo.id)) {
      errors.push(`${characterInfo.name} is listed more than once.`);
      continue;
    }
    seenCharacters.add(characterInfo.id);
    characters.push(characterInfo);
  }

  if (characterNames.length && characterNames.length !== playerCount) {
    errors.push(
      `Expected ${playerCount} character(s), got ${characterNames.length}.`
    );
  }

  if (counts && characters.length === playerCount) {
    const actual = countByType(characters);
    const matchesSetup = CHARACTER_TYPES.every(
      (type) => actual[type] === counts[type]
    );
    if (!matchesSetup) {
      warnings.push(
        `Base setup chart is ${formatSetupCounts(
          counts
        )}; selected characters are ${formatSetupCounts(actual)}. Setup modifiers or Storyteller choice may explain this.`
      );
    }
  }

  return { characters, errors, warnings };
}

export function validateAssignments(rawAssignments, players, editionId) {
  const parsed = parseAssignments(rawAssignments);
  const errors = [...parsed.errors];
  const assignedCharacterNames = [];

  for (const playerId of parsed.assignments.keys()) {
    if (!players.includes(playerId)) {
      errors.push(`<@${playerId}> is not in this game.`);
    }
  }

  for (const playerId of players) {
    if (!parsed.assignments.has(playerId)) {
      errors.push(`<@${playerId}> is missing a character assignment.`);
      continue;
    }
    assignedCharacterNames.push(parsed.assignments.get(playerId));
  }

  const validated = validateCharacterList(
    assignedCharacterNames,
    editionId,
    players.length
  );

  const assignments = {};
  players.forEach((playerId, index) => {
    if (validated.characters[index]) {
      assignments[playerId] = validated.characters[index];
    }
  });

  return {
    assignments,
    errors: [...errors, ...validated.errors],
    warnings: validated.warnings,
  };
}

export function getEvilPlayers(assignments) {
  return Object.entries(assignments || {})
    .filter(([, characterInfo]) => characterInfo.alignment === "evil")
    .map(([playerId]) => playerId);
}

export function getDemonPlayers(assignments) {
  return Object.entries(assignments || {})
    .filter(([, characterInfo]) => characterInfo.type === "demons")
    .map(([playerId]) => playerId);
}

export function getNightGuide(state, phase) {
  const nightPhase = phase === "first" ? "first" : "other";
  const edition = getEdition(state.editionId);
  const checklist = NIGHT_CHECKLIST[edition.id]?.[nightPhase] || [];
  const activeIds = new Set();

  if (state.assignments) {
    for (const characterInfo of Object.values(state.assignments)) {
      activeIds.add(characterInfo.id);
    }
  } else {
    for (const characterInfo of edition.characters) {
      activeIds.add(characterInfo.id);
    }
  }

  for (const travellerInfo of state.travellers || []) {
    if (
      !travellerInfo.exiled &&
      !(state.deadPlayers || []).includes(travellerInfo.playerId)
    ) {
      activeIds.add(travellerInfo.character.id);
    }
  }

  const rows = [];
  const seen = new Set();
  for (const characterId of checklist) {
    const reminder = NIGHT_REMINDERS[characterId]?.[nightPhase];
    if (!reminder || !activeIds.has(characterId)) continue;
    const characterInfo =
      getCharacterById(characterId, edition.id) || getTraveller(characterId);
    if (!characterInfo) continue;
    rows.push({ character: characterInfo, reminder });
    seen.add(characterId);
  }

  for (const characterId of activeIds) {
    if (seen.has(characterId)) continue;
    const reminder = NIGHT_REMINDERS[characterId]?.[nightPhase];
    if (!reminder) continue;
    const characterInfo =
      getCharacterById(characterId, edition.id) || getTraveller(characterId);
    if (!characterInfo) continue;
    rows.push({ character: characterInfo, reminder });
  }

  return rows;
}

export function publicCharacterName(characterInfo) {
  if (!characterInfo) return "Unassigned";
  return `${characterInfo.name} (${TYPE_LABELS[characterInfo.type]})`;
}
