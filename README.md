# Town Square

Town Square is a Discord bot for running Blood on the Clocktower games in voice channels.

It creates the Ravenswood Bluff category, a shared Town Square voice channel, private night channels, a Storyteller log, optional character DMs with ability text, standard 7+ player evil-team info, death markers, ghost votes, Traveller/Fabled tracking, and base-edition reference commands.

## Supported Scope

- Base editions: Trouble Brewing, Bad Moon Rising, Sects & Violets
- Non-Traveller setup chart: 5-15 players, with Travellers added separately
- Base-edition Travellers and Fabled
- Storyteller night checklist and character lookup
- Manual assignment updates for role swaps, Fang Gu jumps, Pit-Hag changes, and setup corrections
- Storyteller-led resolution for character abilities and win conditions
- Persistent session state in `data/sessions.json`

The bot intentionally does not automate Storyteller judgement, hidden information choices, madness enforcement, or win-condition calls. Nominations record the Storyteller's counted vote total rather than running a live voting UI.

## Setup

```bash
npm install
```

Set environment variables:

```bash
BOT_TOKEN=your_discord_bot_token
DEV_GUILD_ID=optional_guild_id_for_instant_command_registration
REGISTER_COMMANDS=true
```

Run the bot:

```bash
npm start
```

Slash commands register automatically on startup. If `DEV_GUILD_ID` is set, commands register to that guild immediately. Without it, global command registration can take time to appear in Discord.

## Deployment

The recommended deployment is Docker Compose on an always-on host with a persistent volume. This bot uses Discord's Gateway connection, so it should run as a long-lived process rather than a serverless function.

Create an env file:

```bash
cp .env.example .env
```

Set `BOT_TOKEN` in `.env`, then run:

```bash
docker compose up -d --build
```

Useful operations:

```bash
docker compose logs -f
docker compose pull && docker compose up -d --build
docker compose down
```

Session state is stored in the `town-square-data` Docker volume at `/app/data/sessions.json`. Back up that volume before replacing the host.

## Storyteller Flow

Start setup:

```text
/setup edition:Trouble Brewing
```

The bot opens a modal. Paste player mentions and optional Demon bluffs:

```text
Players:
@Will @Anna @Mark @Priya @Sam

Demon bluffs:
Mayor, Soldier, Ravenkeeper
```

After the preview appears, press **Assign Characters** to pick each player's character from dropdowns. Used characters disappear from the other dropdowns, so duplicate assignments are avoided. Press **Review Setup**, then **Proceed**.

The bot does not create roles or channels until Proceed is pressed. If no characters are assigned, Proceed starts a channels-only game without character DMs. After setup, use `/dashboard` for Storyteller controls.

Common commands:

- `/script` shows the base edition roster and setup chart.
- `/dashboard` shows Storyteller controls with buttons for status, night guide, and phase changes.
- `/character` looks up base character, Traveller, and Fabled abilities.
- `/assign` updates a player's private character assignment after swaps or conversions.
- `/traveller add` adds a Traveller with private alignment DM; `/traveller exile` exiles them.
- `/fabled add` and `/fabled remove` manage public Fabled rules.
- `/nightguide` shows the current first/other night wake checklist.
- `/night` creates private channels for living players and moves connected players.
- `/day` returns players to Town Square and removes private night channels.
- `/dead` marks a player dead and gives them a ghost vote.
- `/nominate` records a nomination, vote count, threshold, and current player on the block.
- `/execute` records an execution and optionally marks the player dead.
- `/ghostvote` marks a dead player's ghost vote available or spent.
- `/alive` restores a player to life.
- `/status` shows public state; the Storyteller also sees private assignments.
- `/announce` posts the current phase and living count publicly.
- `/reset` removes session channels, roles created by the bot, nicknames, and saved state.

## Notes

- Character assignments are private. Player-facing `/status` does not reveal evil players or roles.
- For 5-6 player games, evil team info and Demon bluffs are skipped by default.
- For 7+ player games, the bot creates `hell` when assignments identify evil players.
- Travellers do not count toward non-Traveller setup counts or Demon-death living-player checks, but active Travellers are included in movement, status, and nomination threshold tracking.
