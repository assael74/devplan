# PLAYERS_DB_ARCH

This document summarizes the current Firestore shape and the scan/database loading flow.

## Collections

- `dbLeagues`
- `dbLeagueSnapshots`
- `dbPlayers`
- `dbPlayerSeasons`
- `dbPlayerStats`
- `dbPlayerSearch`

## Source of truth by area

### League board data

The board is driven by `dbLeagues`, with snapshot metadata pulled from `dbLeagueSnapshots` when needed.

### Scan screen data

The scan screen is driven by `dbLeagues` for the summary list and by `dbLeagueSnapshots` only when indicators are loaded.

### Player search rows

The search rows shown in scan come from `dbPlayerSearch`, then are enriched with `dbPlayerSeasons` when the UI needs missing link fields like `playerUrl` and `teamUrl`.

## Route loading map

### `/players-database`

Loaded on entry:

- `dbLeagues` via KPI loading
- `dbLeagues` again via the board hook
- `dbLeagueSnapshots` only when the board preloads snapshot metadata

Not loaded on entry:

- `dbPlayers`
- `dbPlayerSeasons`
- `dbPlayerStats`
- `dbPlayerSearch`

### `/players-database/scan`

Loaded on entry:

- `dbLeagues` via `loadSummaries()`

Loaded only after the user requests indicators:

- `dbLeagueSnapshots` via `loadIndicators()`

Not loaded on entry:

- `dbPlayerSearch`
- `dbPlayerSeasons`
- `dbPlayers`

### Clicking "Load player documents"

This action reads:

1. `dbPlayerSearch` through `listPlayerSearchByTeamProfile()`
2. `dbPlayerSeasons` for the matching season ids

It does not read `dbPlayers` in this step.

The visible row links in scan are resolved from:

- `dbPlayerSearch.playerUrl` / `dbPlayerSearch.teamUrl`
- fallback to `dbPlayerSearch.source.playerUrl` / `dbPlayerSearch.source.teamUrl`
- fallback to `dbPlayerSeasons.source.playerUrl` / `dbPlayerSeasons.source.teamUrl`

## Row edit modal

The scan row edit modal updates:

- `dbPlayerSeasons`
- `dbPlayerSearch`
- `dbPlayers` for `playerUrl` only

This keeps the scan view, season row, and base player row aligned.
