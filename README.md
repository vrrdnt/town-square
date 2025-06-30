# Town Square

**Town Square** is a Discord bot designed for assisting in running _Blood on the Clocktower_ (BOTC) games.  
It sets up immersive channels, manages private voice channels for night phases, and ensures evil players can communicate if desired.

## Features

Creates a category **`Ravenswood Bluff`** for the game session, and voice channel **`Town Square`** where all players meet during the day.  
Evil players get their own text channel **`Hell`**, visible only if allowed.  
All players get themed private voice channels like **`Dark Alley`, `Library`, and `Graveyard`** for night.

#### Roles:

- `Storyteller` (red) assigned to the GM
- `Townsfolk` (green) assigned to players

---

## Commands

### `/setup players:@User1 @User2 ... doesevilknow:true/false evilplayers:@Evil1 @Evil2`

- `players` should be a space separated list of mentioned (`@`) Discord users.
- `doesevilknow` should be true or false, and this controls whether or not evil players get a text channel they can communicate in privately.
  - if `doesevilknow` is `true`, then mention the evil players in the same way you did for the `players` argument.

---

### `/night`

- Creates individual private voice channels with thematic names.
- Moves each player to their own private channel (only the Storyteller can see them all).

---

### `/day`

- Returns all players to the **Town Square** voice channel.

---

### `/reset`

- Deletes the entire `Ravenswood Bluff` category (removing all game channels).
- Removes `Storyteller` and `Townsfolk` roles from everyone and deletes them.
- Clears all session state.

---

## Example usage

```bash
/setup players:@Will @Anna @Mark doesevilknow:true evilplayers:@Anna
```

Storyteller clicks proceed, and everyone starts in Town Square. Players will need to manually join the Town Square voice channel.

`/night`

Each player is moved to a private location like Graveyard or Library, that only the player and the Storyteller can see.

`/day`

All players are returned to the Town Square.

`/reset`

Everything gets cleaned up, and the session ends.
