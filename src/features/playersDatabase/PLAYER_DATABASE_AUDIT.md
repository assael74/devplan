# Player Database Audit

## Purpose

The Audit is a read-only check of persisted Player Database data. It is not a
source of truth and it does not decide new business state.

It answers only five questions:

1. Is a required document missing according to the lifecycle?
2. Does a persisted projection differ from its canonical source?
3. Is an explicit document relation broken?
4. Does a document exist although the lifecycle says it should not?
5. What legal lifecycle state explains the data?

The source-of-truth and persistence rules remain in
[`TEAM_DATA_ARCHITECTURE.md`](./TEAM_DATA_ARCHITECTURE.md).

## Boundaries

- Audit does **not** validate Firestore schema, field presence, field type,
  unknown fields, legacy fields, or Catalog diffs.
- `catalog/firestoreDocuments` remains the writer and persistence contract; it
  is not a runtime Audit engine.
- SearchIndex is a projection. It is never used to derive an Expected value.
  It may be used only to display a human-readable repair preview.
- Audit must use an existing canonical builder or domain calculation. It must
  not reproduce business formulas inside the Audit.

## Lifecycle contracts

| Stage | Required documents | Notes |
| --- | --- | --- |
| League table loaded | League Document and Team SearchIndex | A Team SearchIndex without a Team Season is valid `league_only`. |
| Roster loaded | Team Root, Team Season and Player SearchIndexes | Player Documents are not required merely because a player is in the roster. |
| Stats loaded | Updated Team Season and SearchIndexes | Statistics, Team Balance and scouting projections are refreshed. |
| Player has any scout profile | Player Document | This includes Professional and Preliminary profiles. |
| Player is Favorite, Watchlist, Manual or Transfer tracked | Player Document | These are independent lifecycle reasons for a Player Document. |

Team Root without a season is a valid lifecycle state. It is not an unexpected
document by itself.

## Canonical source comparisons

Only these projection comparisons are currently valid:

| Projection | Source of truth | Canonical builder |
| --- | --- | --- |
| Team Season performance | League table | `buildLeagueTeamPerformanceProjection` |
| Team SearchIndex performance | League table | `buildLeagueTeamPerformanceProjection` |
| Team SearchIndex balance | Team Season balance | `buildTeamBalanceSearchIndexProjection` |
| League Master entry and totals | League Documents | `buildLeaguesMasterLeagueEntry` and `buildLeaguesMasterSummary` |

The Team Season keeps a compact scout projection. It does not preserve enough
source data to reconstruct the full Player SearchIndex scout projection, so
Audit must not compare those two representations directly.

## Repair

Repair is separate from Audit and always requires explicit user confirmation.
It is available only for the proven case of a missing Player Document whose
lifecycle requires one.

Before writing, Repair performs a fresh read and groups eligible findings by:

`league → season → team → players`

The confirmation preview displays every player together with team, slot (only
when greater than one), league, season, age group and birth year. It writes
only the validated entries shown in that preview.

Repair uses canonical writers to create the Player Document and refresh the
affected Team Season scouting projection, Player SearchIndex, Team SearchIndex
and League team summary. It never creates a document from Audit output alone,
does not perform schema repair, and does not use SearchIndex as the write
source. A new Audit runs after Repair.

## Scopes

- **Full system** checks all loaded Player Database collections, including the
  League Master projection against the live League Documents.
- **Team and season** limits findings to one Team Season.
- **Last write** limits findings to Team Seasons recorded by the last write
  result.

The reader loads a complete snapshot before evaluating relations, so the Audit
does not infer broken relations from a partial data set.
