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

## Finding timeline and write provenance

Each finding in an Audit result includes `detectedAt`, `firstDetectedAt`,
`sourceUpdatedAt` and `indexUpdatedAt`. The Audit persists a stable finding
fingerprint in `dbAuditFindings`; this allows the next run to retain the first
time a still-open finding was detected.

All writes routed through `runPlayersDatabaseWriteAction` are recorded in
`dbWriteActions` with the action type, completion time and affected Audit
scope. The Audit uses that journal to display the latest known action for the
finding's team and season. This is scope provenance, not proof that one exact
field caused the mismatch.

If a flow commits canonical data and then a required projection fails, the
journal stores a `failed_after_canonical_commit` recovery record. The Audit
turns it into a **partial write** finding. For a failed Club projection it
offers the existing Club rebuild: it rebuilds from the canonical League table,
syncs Clubs Master, and only then marks the recovery record as resolved. No
roster deletion or reload is required.

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
| Retired roster player | No new Player Document or scout profile | The Team Season keeps the player for history. An existing Player Document is retained only when it contains another season/history or an independent tracking reason; otherwise it is removed. |
| Player has any scout profile | Player Document | This includes Professional and Preliminary profiles. |
| Player is Favorite, Watchlist, Manual or Transfer tracked | Player Document | These are independent lifecycle reasons for a Player Document. |

Team Root without a season is a valid lifecycle state. It is not an unexpected
document by itself.

A Player Document linked to a retired roster player is not an `unexpected_document`
when it retains historical seasons. A retired player with no remaining history or
independent tracking reason must not retain a Player Document.

## Canonical source comparisons

Only these projection comparisons are currently valid:

| Projection | Source of truth | Canonical builder |
| --- | --- | --- |
| Team Season performance | League table | `buildLeagueTeamPerformanceProjection` |
| Team SearchIndex performance | League table | `buildLeagueTeamPerformanceProjection` |
| Team SearchIndex balance | Team Season balance | `buildTeamBalanceSearchIndexProjection` |
| League Master entry and totals | League Documents | `buildLeaguesMasterLeagueEntry` and `buildLeaguesMasterSummary` |

The Team Performance comparison also uses the League Season's compact
`teamPerformanceContext` so that priority projections are evaluated against
the same engine version and normalization context as the League load.

The Club-performance audit is evaluated from the canonical League table and
that context. A refresh after a League Excel reload therefore fills only fields
whose source exists in the League table; balance and transfers remain checked
against the Team Season source.

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

## Club-season identity index

The identity index is an import-preflight and Team-page discovery projection,
not a canonical source and not a daily Audit source. It is refreshed after a
League-table write and can be backfilled by the explicit full Club-projection
refresh. The Team Page may use it only to locate candidate League Documents;
Audit must derive any identity expectation from League Documents, never from
the index.
