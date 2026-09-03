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
