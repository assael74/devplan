# PLAYERS_DB_ARCH

This document summarizes the current Firestore shape and the scan/database loading flow.

## Collections

- `dbLeagues`
- `dbPlayers`
- `dbBirthTeams`
- `dbBirthTeamSeasons`
- `dbSearchIndexes`
- `dbLeaguesMaster`
- `dbFavorites`

## Position and line fields

The current Team Season is the operational source of truth for a player's
seasonal data.

## League season lifecycle

`catalog/seasons.catalog.js` is the single UI configuration source for season
keys, their default placement and display order. It does not claim that a
season exists: `dbLeagues` remains the source of truth for seasons created for
each league, and `dbLeaguesMaster` is its read projection.

The League-to-Team and Team-to-Player navigation opens the receiving page at
its latest available season. A seasonal query parameter is reserved for an
explicit selection made inside that receiving page; it is not inherited from
the page that opened it.

`dbLeagues.current` stores a `seasonStatus` selected during league-table
import: `not_started` or `active`. `dbLeagues.history[]` stores completed
seasons with `seasonStatus: completed`. The import modal starts without a
selection, so saving is blocked until the user explicitly chooses a state.
`not_started` is available only when every imported performance metric is
zero; it preserves zeroes as a league-frame placeholder rather than player
statistics or a professional performance signal.

The season-creation modal can place a season in the active or historical
target. Re-saving the same season in the other target moves it, so the same
season identity cannot exist in both `current` and `history[]`; a different
active season must be moved to history before another active season is opened.

- `dbBirthTeamSeasons.teamPlayers[]` stores `primaryPosition`,
  `positionLayer`, and `lineClassification`.
- `dbPlayers.current[]` and `dbPlayers.history[]` store the same seasonal
  projection for identified players. The root `dbPlayers` document keeps the
  visually verified `primaryPosition` and `positionLayer`.
- `dbSearchIndexes` stores `primaryPosition` and `positionLayer`, plus the
  flat search projection: `lineClassificationLine`,
  `lineClassificationPosition`, `lineClassificationSource`,
  `lineClassificationEvidenceLevel`, and `lineClassificationModelVersion`.

`lineClassification` is derived from current-season performance. It is not
allowed to overwrite the visually verified `primaryPosition` or
`positionLayer`. A preliminary "מחפש זהות" profile is reclassified from this
performance classification; a manual position edit does not perform that
reclassification.

## Source of truth by area

### Team Balance / Benchmark / Interest

`dbBirthTeamSeasons.teamBalance` persists derived Team Balance facts,
the versioned Reference Lineup Benchmark evaluation, and the compact Team
Interest interpretation. The reference evaluates goalkeeper, defense,
midfield core, attacking midfielder, and attack. Team Interest V1 uses only
the attack and defense evaluations with Team Performance; midfield and
attacking-midfielder deviations remain structural diagnostics only.

Team Balance interpretation has a canonical availability gate. When
`teamGamePlayed < 8`, it is `unavailable` with
`availabilityReason: season_sample_insufficient`; facts may still be stored,
but lineup and classification-coverage benchmarks emit no active state and
Team Interest/SearchIndex emit no Balance finding. Once the eight-game gate is
met, cleared or not-yet-loaded statistics use `stats_not_loaded`. Team
Performance remains independent of this gate.

Team Interest also aggregates Squad Interest from the independent,
versioned `classification-coverage-v1` benchmark. It evaluates the classified
player count against the V1 typical range of 10–13. Below or above the range
remains a structural fact, but activates Squad Interest only when both offense
and defense are `positive_or_above` or both are `low`. Typical coverage, mixed
performance, and unavailable performance do not activate Squad Interest. This
coverage evaluation does not block Line Interest.

The Team SearchIndex projects only compact interpretation fields
(`scoutInterpretationModelVersion`, attack finding, defense finding, and
`teamInterest`). It never stores the complete benchmark evaluation.

### Team-season player state

`dbBirthTeamSeasons.teamPlayers[]` is the operational source of truth for a
player in a team and season. Stats Load writes the performance classification
there before rebuilding Team Balance and downstream projections.

### Player history

`dbPlayers` stores an identified player's seasonal projection in `current[]`
or `history[]`, as well as the verified role fields at the document root.

### Expected league-level path

`expectedLevelDelta` is the projected change in league level for a birth year
in the following age category. A row for birth year `Y` is compared with the
same club, season and team slot in birth year `Y - 1`; a lower numeric league
level is a positive progression. If that adjacent source is unavailable, the
value is `null` (`unknown`) and is never treated as zero.

After every league-table load for `Y`, the write flow reconciles both `Y` and
`Y + 1`. This makes load order immaterial: loading `Y + 1` first leaves its
path unknown; loading `Y` later recalculates and writes the dependent `Y + 1`
path. The reconciliation writes the Team Season and identified Player
projections, then rebuilds the team and player SearchIndex projections from
`dbLeagues`.

### Search rows

`dbSearchIndexes` is a projection for search and list rendering. It receives
the verified role fields, the flat performance classification fields, and the
current scout-profile summary. It must never be used as a write source.

## Update flow

```text
Stats Load
  → dbBirthTeamSeasons.teamPlayers[].lineClassification
  → dbPlayers current/history projection when a Player Document is required
  → dbSearchIndexes lineClassification* + scout summary

Visual role edit
  → dbBirthTeamSeasons.teamPlayers[].primaryPosition / positionLayer
  → dbPlayers verified-role projection
  → dbSearchIndexes verified-role projection
```

## League season deletion

The league-page deletion menu is ordered by dependency: deleting teams is
disabled while any rostered player exists; deleting a season is disabled while
any team remains. Deleting the season is also guarded in the write flow and
requires its table, team-season documents and SearchIndex rows to be empty.
After deleting the final season, a league that no longer exists in the league
catalog is deleted from `dbLeagues` and removed from `dbLeaguesMaster/all` in
the same flow. Catalog leagues retain an empty root document so they remain
available for a future season.
