# TEAM_DATA_ARCHITECTURE.md

## Purpose

This document defines the canonical data architecture and source-of-truth rules for `src/features/playersDatabase`.

Any change affecting Team, Player, SearchIndex, Roster Load, Stats Load, Audit, Repair, Migration, or Firestore persistence must be checked against this document before implementation.

The goal is to prevent different writers or flows from independently deciding:
- where data comes from,
- which layer owns it,
- which layer may overwrite it,
- and which values are canonical versus derived projections.

---

# 1. Core architecture principles

## 1.1 Firestore persistence layers

The main persisted layers are:

1. **League Document**
   - Canonical source for official team competition performance.
   - Contains league table rows for teams and season context.

2. **Team Root Document** (`dbBirthTeams/{birthTeamDocumentId}`)
   - Stable identity for a birth-year team only.
   - Holds only root identity fields and `seasons[]`, a compact navigation index of
     `{ seasonKey, seasonDocumentId, seasonStatus }`.
   - It never owns roster, statistics, balance, performance, scouting, or a
     `current/history` season payload.

3. **Team Season Document** (`dbBirthTeamSeasons/{birthTeamSeasonDocumentId}`)
   - The single source of truth for one Team + Season.
   - Owns `teamPlayers`, stats, League-derived performance projection, Team
     Balance, scout summary and season metadata.
   - `birthTeamDocumentId` is the relation back to the Team Root; `seasons[]`
     on the Root is navigation only and is never a second seasonal source.

4. **Player Document**
   - Source of truth for tracked-player history and human scouting state.
   - Does not store the entire scouting engine output.

5. **SearchIndex Documents**
   - Projection layer only.
   - Never a source of truth.
   - Must be reproducible from canonical persisted data.

---


# 1A. Firestore document catalog — schema source of truth

The canonical source of truth for the **persisted Firestore document structure** is:

`src/features/playersDatabase/catalog/firestoreDocuments`

This catalog defines what the Firestore documents are expected to contain.

It is the schema/source-of-truth layer for:
- allowed persisted fields,
- document shapes,
- nested structures,
- defaults where explicitly defined,
- expected persisted contracts for Team, Player, and SearchIndex documents.

The catalog must be treated differently from this architecture document:

- `TEAM_DATA_ARCHITECTURE.md` defines **why data exists, who owns it, where it comes from, and which flow may write it**.
- `catalog/firestoreDocuments` defines **what the persisted Firestore document is structurally expected to look like**.

Neither replaces the other.

A valid persistence change must satisfy both:
1. the architecture/source-of-truth rules in this document;
2. the document schema contract in `catalog/firestoreDocuments`.

## Catalog precedence rules

When working on Firestore persistence:

- Do not add a persisted field only in a writer without updating the relevant catalog contract.
- Do not remove or rename a persisted field only in a writer while leaving the catalog stale.
- Do not treat writer output as the schema source of truth.
- Do not infer document structure from existing Firestore documents when the catalog defines the intended structure.
- Do not let Audit, Repair, Migration, or SearchIndex introduce fields that are outside the intended catalog contract.
- If the architecture says a field must not be persisted, the catalog must not continue to require it.
- If the catalog and writer disagree, treat the disagreement as a schema/implementation mismatch that must be resolved deliberately.

## Recommended validation order

For any Team / Player / SearchIndex persistence change:

```text
Architecture rule
    ↓
Firestore document catalog
    ↓
Domain / canonical builder
    ↓
Writer
    ↓
SearchIndex projection
    ↓
Audit / Repair / Migration validation
```

The intended contract is therefore:

```text
TEAM_DATA_ARCHITECTURE.md
    = source of truth for ownership, meaning and data flow

catalog/firestoreDocuments
    = source of truth for persisted Firestore document shape
```


# 2. Team Performance source of truth

## 2.1 Canonical source

`league.current/history.tableRank` is the canonical source of actual team performance.

The following fields belong to the Team Performance domain:

- `teamGamePlayed`
- `goalsFor`
- `goalsAgainst`
- `tableRank`
- `tableAttackRank`
- `tableDefenseRank`
- `goalsForPerGame`
- `goalsAgainstPerGame`

These fields must not be reconstructed from Player Stats.

## 2.2 Derived team-performance values

The following values are derived from the canonical league table data:

- `goalsForPerGame = goalsFor / teamGamePlayed`
- `goalsAgainstPerGame = goalsAgainst / teamGamePlayed`
- `tableAttackRank` = ranking by goals scored
- `tableDefenseRank` = ranking by goals conceded

All persisted per-game values must use a maximum of one decimal place.

Examples:

- `5.542` → `5.5`
- `1.125` → `1.1`
- `3` → `3`

The same normalization rule must be used by Team Season writers and Team SearchIndex projections.

---

# 3. Actual / Pace / Projected

For an active league season, three concepts must remain separate.

## 3.1 Actual

Official values that already occurred.

Examples:

- games played
- goals for
- goals against
- points
- table rank

Actual values come from the League Document.

## 3.2 Pace

A rate derived from actual values.

Examples:

- goals per game
- goals against per game

Pace does not replace actual values.

## 3.3 Projected

A forecast to the end of the season.

Examples:

- `projectedTeamGamePlayed`
- `projectedGoalsFor`
- `projectedGoalsAgainst`
- `projectedPoints`

Projected values are derived values and must never overwrite Actual values.

Example:

If a team has:
- 10 games played
- 20 goals
- 24 total league rounds

Then:

- `teamGamePlayed = 10`
- `goalsFor = 20`
- `goalsForPerGame = 2.0`
- `projectedTeamGamePlayed = 24`
- `projectedGoalsFor = 48`

---

# 4. Roster Load responsibility

Roster Load is responsible for:

- resolving player identities,
- writing the Team roster,
- creating/updating the Team Season snapshot,
- updating roster-related Team SearchIndex metadata,
- preserving canonical Team Performance,
- keeping scouting and balance state empty/insufficient when stats do not exist.

Roster Load must not:

- create Player Documents merely because a player is in a roster,
- invent Player Stats,
- create Scout Profiles,
- use Player Stats as Team Performance,
- overwrite canonical League Team Performance with defaults.

When a Team Season is created for the first time, canonical Team Performance must be supplied from the League table context. The writer must not depend only on `existingSeason`.

`existingSeason` may be used as a defensive fallback, but not as the primary source of truth.

---

# 5. Stats Load responsibility

Stats Load is the source of truth for player statistical data.

It may update:

- `teamPlayers[].playerStats`
- `statsStatus`
- Team Balance
- scouting calculations and compact projections
- relevant Player Documents when tracking/profile eligibility exists
- Player SearchIndex and Team SearchIndex projections

Stats Load must not use Player Stats totals to overwrite official Team Performance.

## 5.1 Pre-commit validation

Before a Stats Load commit, the League table projection is the mandatory
official context for `teamGamePlayed`, `goalsFor`, `goalsAgainst`, and the
competition/game-duration context. Player statistics are observed input and
must be validated against that context before Team Balance, scouting, Player
documents, or SearchIndex projections are updated.

Blocking contradictions include values that can be proven impossible without
assumption: a player's games above league games, starts above games, starts
above `teamGamePlayed × 11`, player or aggregate goals above `goalsFor`, and
minutes above the League-derived capacity. The UI must present these findings
for correction and keep commit disabled until they are resolved. It must not
silently clamp, truncate, or reconcile player input.

For Stats Load validation only, the minutes capacity includes a fixed observed
stoppage-time allowance of six minutes per league game. This allowance does
not change the canonical age-group `gameMinutes` or persisted
`playerStats.teamMinutes`. When no pasted row would become negative, the UI
may offer an explicit one-minute equal reduction for all pasted rows. The
user may repeat that action while an aggregate excess remains; the preview
must recompute scout profiles and disclose added/removed profiles before
commit. No increase is offered for a minutes deficit.

`playerStats.teamMinutes` is a derived context value. Stats Load derives it
canonically as `teamGamePlayed × gameMinutes`, where `gameMinutes` comes from
the age-group league catalog. It is not imported player input and must not use
a missing-input default of `0` when league games are known.

A player above 100% of this canonical `playerStats.teamMinutes` is a blocking
row-level validation error, even though aggregate minutes validation includes
the separate observed stoppage-time allowance.

Example:

League:
- `goalsFor = 133`

Loaded player stats:
- sum of player goals = 128

Canonical Team Performance remains:

- `goalsFor = 133`

The difference is a coverage/completeness issue, not a Team Performance correction.

If Stats Load receives a `team` payload containing Team Performance fields, that payload must not be allowed to override the canonical League-derived values unless it is itself explicitly built from the canonical League Team Performance projection.

---

# 6. Player Stats vs Team Performance

These are separate domains.

## 6.1 Shared player identity candidate resolution

Roster Load and Stats Load keep separate write policies, but use the same
candidate-resolution order: `externalPlayerId`, then `identityKey`, then
normalized aliases/name, then a Player Document fallback. The fallback may
surface an existing player only as a candidate; it must not auto-link when the
available context is not uniquely sufficient.

Player Document existence alone does not establish a canonical `playerId`.
A write flow may use an existing `playerDocumentId` only when a canonical
`playerId` mapping is independently resolved.

`playerId` values in the `player__...` namespace are internal identities only.
They must never be used as a Player Document ID or as a write target in the
`players` collection. Player Document writes are permitted only under canonical
document namespaces such as `external__...` or `name__...`. A `player__...`
value may be used only for relations, lookup, or a legacy read fallback.

Stats Load first preserves a `ROSTER_MATCH`. A player found in the system but
not in the team roster requires an explicit season status. `AMBIGUOUS` and
`UNRESOLVED` identities block both UI confirmation and the writer boundary.
An unmatched row must not create an internal player ID by default: creation
requires an explicit UI decision that is carried to the writer.

## Team Performance

Source:
- League Document

Examples:
- games
- team goals
- team rank
- attack rank
- defense rank

## Player Stats

Source:
- Stats Load

Examples:
- player games
- player goals
- player minutes
- starts
- substitute appearances

A mismatch between Player Stats totals and Team Performance must not cause Team Performance to be rewritten.

Such mismatches may influence:
- data coverage,
- reliability,
- Team Balance availability,
- audit diagnostics.

---

# 7. Team Balance

Team Balance is derived from player statistical coverage.

Before Stats Load:

- roster players may exist,
- `statsStatus` should be `missing`,
- `loadedCount = 0`,
- `reliability = insufficient`,
- unavailable balance metrics should remain unavailable,
- balance bands should remain `null`.

Team Balance interpretation is available only when the official
`teamGamePlayed` is at least 8 **and** relevant player statistics are loaded.
When `teamGamePlayed < 8`, its canonical state is
`availability: unavailable` with
`availabilityReason: season_sample_insufficient`. Once the eight-game gate is
met, deleted or not-yet-loaded stats use `stats_not_loaded`.
Performance remains available under its own rules. Balance facts may still be
computed, but Balance benchmarks, Team Interest and SearchIndex findings must
remain inactive while Balance is unavailable.

Team Balance must not be treated as an official Team Performance source.

Team Balance population scopes are explicit:

- **Season Participants**: every player with season minutes, including
  `regular`, `transferredOut`, and `youngerAgeGroup`. Historical minutes,
  rotation, and production metrics use this scope.
- **Current Relevant Roster**: the current squad state; `transferredOut` is
  excluded. Current depth and recruitment-need views use this scope.

`playersCount` remains the existing persisted count of `teamPlayers` until a
separate schema decision maps every consumer to a named scope; it must not be
repurposed implicitly.

---

# 8. Scouting projection in Team Season Document

The Team Season Document may store a compact scouting projection for each roster player.

Typical compact fields include:

- `primaryScoutProfileId`
- `primaryScoutProfileStrengthDepthPct`
- `professionalScoutProfileIds`
- `preliminaryScoutProfileIds`
- `scoutPlayerInterestLevel`
- `scoutEffectiveImmediacyStatus`
- `scoutEngineVersion`

Roster Load does not create Scout Profiles.

These fields remain empty until scouting calculations are available.

`primaryScoutProfileId` is the primary **Core** profile only. It is not a
summary of every professional result. `professionalScoutProfileIds` contains
the active Core and Opportunity profile ids, while
`preliminaryScoutProfileIds` contains active Preliminary profile ids. Neither
array carries signals, hierarchy, evidence, or the full scouting result.
Team professional summaries use only `professionalScoutProfileIds`; a
Preliminary profile remains available to the Team UI, but is not a Team
professional summary. It is nevertheless a full Player lifecycle reason: a
Preliminary profile independently requires a Player Document, just as a
Professional profile does. Its result is synchronized into that document and
its SearchIndex projection.

The full scouting engine output must not be serialized into the Team Season Document.

---

# 9. Team SearchIndex

Team SearchIndex is a projection only.

It may contain:

- team identity
- league context
- official Team Performance projection
- projected season finish
- Team Balance bands
- scout summary
- roster metadata

It must not become an independent source of truth.

The same Team Performance calculation rules used for the Team Season Document must be used for the SearchIndex.

There must not be separate incompatible formulas for:

- goals per game
- goals against per game
- attack rank
- defense rank

---

# 10. Canonical flow

```text
League Document
      ↓
Canonical Team Performance
      ↓
 ┌──────────────────────┬────────────────┐
 ↓                      ↓                ↓
Team Season Document   Team SearchIndex  Active-season Projection
```

Player statistics follow a separate path:

```text
Stats Load
    ↓
Player Stats
    ↓
Team Balance / Scouting
    ↓
Compact Team + Player + SearchIndex projections
```

Player Stats must not become the canonical Team Performance source.

---

# 11. Field ownership summary

| Field / Area | Canonical source | Roster Load | Stats Load | SearchIndex |
|---|---|---|---|---|
| `teamGamePlayed` | League | copy/project | must not redefine | projection |
| `goalsFor` | League | copy/project | must not redefine | projection |
| `goalsAgainst` | League | copy/project | must not redefine | projection |
| `tableRank` | League | copy/project | must not redefine | projection |
| `tableAttackRank` | League-derived | copy/project | must not redefine | projection |
| `tableDefenseRank` | League-derived | copy/project | must not redefine | projection |
| `goalsForPerGame` | League-derived | canonical normalized value | preserve canonical | projection |
| `goalsAgainstPerGame` | League-derived | canonical normalized value | preserve canonical | projection |
| `playerStats` | Stats Load | empty/missing | source of truth | projection if needed |
| `teamBalance` | Player Stats-derived | insufficient | calculate | projection |
| Scout profile projection | Scouting | empty | calculate | projection |
| Projected season finish | League actual + projection rules | may project | preserve/recompute canonically | projection |

---

# 12. Firestore write policy

Writers should remain narrow.

A writer should not:
- independently discover a new source of truth,
- duplicate domain calculations already owned by a canonical helper,
- reconstruct values from unrelated persisted projections,
- use SearchIndex as a fallback source.

Prefer:

```text
Source data
  ↓
domain/shared canonical builder
  ↓
normalized persistence payload
  ↓
writer
```

over:

```text
writer
  ↓
find data
  ↓
calculate business logic
  ↓
write
```

---

# 13. Audit / Repair / Migration

Audit is a read-only integrity check. It answers only these questions:

1. **Missing Document** — a canonical lifecycle contract proves a document must exist but it is absent.
2. **Source Mismatch** — a persisted projection differs from an Expected value built by a canonical builder from its canonical source.
3. **Broken Relation** — an explicit document linkage is missing, points to a missing document, or contradicts the linked entity identity.
4. **Unexpected Document** — a document exists although the canonical lifecycle proves it should not.
5. **Lifecycle Status** — a non-error explanation of why an entity and its projections exist.

Audit is **not** a schema validator. It does not compare Firestore document
fields to the Catalog and does not report missing fields, unexpected/legacy
fields, type mismatches, nested-shape mismatches, or schema-health scores.
`catalog/firestoreDocuments` remains the persistence-development contract for
writers and schema changes; it is not a runtime Audit engine.

Lifecycle is the basis for existence and relation checks. SearchIndex is
projection only and is never a source used to derive Expected values.

Repair is separate from the daily Audit flow and always requires explicit user
confirmation. The supported missing-Player-Document Repair first performs a
fresh read, groups validated entries by `league → season → team`, and uses the
canonical player and projection writers to create the document and refresh the
affected Team Season, Player SearchIndex, Team SearchIndex and League summary.
It must not provide schema repair or use SearchIndex as a Repair/Migration
source when the original domain source exists. SearchIndex may be used only to
show display context in the confirmation preview. Migration must not introduce
a second source of truth.

---

# 14. Current Player V3 boundary

Player persistence intentionally stores a compact scouting snapshot.

The full deterministic scouting result remains runtime/domain state.

Player Season persistence keeps compact fields such as:

- `scoutProfiles`
- `scoutProfileHierarchy`
- `scoutCombinationIds`
- `scoutOpportunity`
- `scoutPlayerInterest`
- `scoutProfileProgression`
- `scoutEngineVersion`

Rich runtime-only fields should not be restored into Player persistence unless this architecture document is intentionally changed.

---

# 15. Rule for future changes

Before changing a Team/Stats/SearchIndex writer, answer:

1. What is the source of truth?
2. Is this value Actual, Pace, Projected, or derived Player state?
3. Is this writer allowed to own this field?
4. Does another writer already calculate the same value?
5. Can the value be reproduced deterministically?
6. Will this change create a second source of truth?

If any answer is unclear, stop and resolve the architecture before implementing the write.

---

# 16. Player line classification and current-team structure

## 16.1 Ownership and stored projection

`lineClassification` is a compact, season-scoped **performance** projection
for a Team Player and Player Season. It describes the player's role in that
specific season from the loaded statistics:

```text
line: DEFENSE | MIDFIELD | ATTACK
position: FULLBACK | ATTACKING_MIDFIELDER | null
```

It is not a replacement for the visually verified `positionLayer` and
`primaryPosition` fields. Those fields preserve the professional/visual
verification and must never be populated or overwritten by performance
classification. The classification is the canonical input to current-team
line analysis and performance-based scout reclassification.

The canonical classification builder is the shared team-line classification
domain. Writers must call that builder rather than recreate its rules. The
Team Season owns the current roster's classifications. A Player Season may
keep the same compact projection as player history, but a prior-season value
must never be used as a fallback for the current Team Season.

The Team Balance snapshot owns the derived `lineClassificationCoverage`,
`lineStructure`, `lineupBenchmark`, and compact `scoutInterpretation`
projections. `lineStructure` contains
facts only: the current counts, identified goalkeepers, classified players,
players with an 8+ sample who remain unclassified, and players below the
8-game sample. All counts exclude `retired`, `transferredOut`, and
`youngerAgeGroup`. A known goalkeeper is an identified role and is counted as
classified, while remaining outside the three field lines. `relevantPlayersCount`
is the real current-squad denominator. SearchIndex remains a projection only
and must not become a source for any balance value.

## 16.2 Classification decision order

Classification is decided from current-season performance only. It is derived
when sufficient current-season statistics are available and remains empty when
they are not. `primaryPosition` and `positionLayer` are not a classification
input and cannot change the performance result.

A visually verified `goalkeeper` / `GK` is excluded from field-player line
inference, so a goalkeeper cannot be misclassified as defense solely from
minutes. This exclusion does not make the visual fields a source of the
resulting line.

Known goalkeepers are counted separately in `lineStructure.goalkeeperPlayersCount`.
They are not included in `DEFENSE`, in the statistical-classification population,
or in the unclassified count.

## 16.3 Statistical inference rules

Statistical inference first identifies the line and only then refines the
position where the rules prove it:

- Fewer than 8 games: no statistical classification.
- 8 or more games and `10+` goals: `ATTACK`, with `position: null`.
- 8 or more games and fewer than 10 goals: continue through the personal
  minutes gate.
- Personal minutes rate is `playerMinutes / (playerGames × gameMinutes)`.
  Fewer than `70%` produces no classification; `70%` and above continues to
  the existing minutes and substitution matrix.
- Inside that matrix, `5–9` goals produce `MIDFIELD` and
  `ATTACKING_MIDFIELDER` only after both gates have passed.
- The fullback rule may return `FULLBACK` only inside `DEFENSE`.

The model must not infer striker, centre-back, winger, or any other detailed
position without an explicit rule. `FULLBACK` and `ATTACKING_MIDFIELDER` are
the only statistical position refinements currently supported.

## 16.4 Current-team line structure

`lineStructure` measures the current team only. Its real-squad population
excludes `retired`, `transferredOut`, and `youngerAgeGroup`. The three field
line counts use loaded players that pass the 8-game classification gate;
goalkeepers come from the separately verified goalkeeper role.

It is intentionally a derived-facts layer:

```text
Team Balance identifies current-squad facts
    ↓
Line Classification assigns line / proven position
    ↓
Line Structure counts the composition
    ↓
Benchmark Evaluation compares counts to a versioned reference
    ↓
Performance + Balance Interpretation may later decide a scouting finding
```

It must not emit `shortage`, `overload`, `need`, `opportunity`, a target flag,
or UI text. `FULLBACK` remains a factual position refinement only.

## 16.5 Reference Lineup Benchmark and evaluation

The canonical reference is defined once in:

`src/shared/scouting/teams/balance/benchmark/teamLineupStructureBenchmark.definition.js`

```text
GOALKEEPER: 1
DEFENSE: 4
MIDFIELD CORE: 3
ATTACKING_MIDFIELDER: 1
ATTACK: 2
```

`ATTACKING_MIDFIELDER` is a `MIDFIELD` subtype, so `midfieldCore` is the
MIDFIELD count less attacking midfielders. The same player is never counted
twice in the 3 + 1 reference.

The canonical evaluator is:

`src/shared/scouting/teams/balance/benchmark/evaluateTeamLineupStructureBenchmark.js`

It produces the persisted `lineupBenchmark` contract:

```text
definitionId, definitionVersion, availability, availabilityReason
metrics.<metric>.actual, reference, delta, state
```

The only evaluation states are `below_reference`, `at_reference`,
`above_reference`, and `unavailable`. This is a deterministic structural
comparison, not a verdict about shortage, quality, need, or opportunity. A
different age, level, or context can later select another versioned definition
without rewriting the evaluator.

## 16.6 Performance + balance interpretation and Team Interest V1

An unusual structure is information, not an automatic assertion that a team
is unbalanced. The versioned interpretation layer joins Team Performance,
Benchmark Evaluation, and classification coverage.

Team Interest V1 uses **only** the `ATTACK` and `DEFENSE` benchmark metrics.
`midfieldCore` and `attackingMidfielder` remain persisted structural
diagnostics and are displayed as `below_reference`, `at_reference`, or
`above_reference`; they must not generate a team-interest finding.

The performance band is derived from the existing Team Performance priority:
`POSITIVE`, `HIGH`, and `ELITE` are `positive_or_above`; `NEUTRAL` is
`regular`; `LOW` is `low`. The attack matrix is:

```text
positive_or_above + below/at/above = ATTACK_CONCENTRATION / ATTACK_ESTABLISHED / ATTACK_HIGH_COMPETITION
regular           + below/at/above = ATTACK_DEPTH_REVIEW / NO_CLEAR_FINDING / REVIEW_REQUIRED
low               + below/at/above = ATTACK_POSSIBLE_GAP / ATTACK_QUALITY_REVIEW / REVIEW_REQUIRED
```

The defense matrix is:

```text
positive_or_above + below/at/above = DEFENSE_CONCENTRATION / DEFENSE_ESTABLISHED / REVIEW_REQUIRED
regular           + below/at/above = DEFENSE_DEPTH_REVIEW / NO_CLEAR_FINDING / REVIEW_REQUIRED
low               + below/at/above = DEFENSE_POSSIBLE_GAP / DEFENSE_QUALITY_REVIEW / REVIEW_REQUIRED
```

`REVIEW_REQUIRED` is intentional: no professional conclusion has been
approved for that combination yet. The canonical `teamInterest.isInteresting`
is true only for `ATTACK_CONCENTRATION`, `ATTACK_HIGH_COMPETITION`,
`ATTACK_POSSIBLE_GAP`, `DEFENSE_CONCENTRATION`, and `DEFENSE_POSSIBLE_GAP`.
There is no separate Agent versus Club Scout interest model.

SearchIndex projects only the interpretation model version, availability,
attack finding, defense finding, and derived interest flag. It never stores
the whole benchmark evaluation.

Team Interest also includes a separate Squad Interest source. The canonical
`classification-coverage-v1` benchmark evaluates `classifiedPlayersCount`
against the versioned typical range `10–13`, returning `below_typical`,
`typical`, `above_typical`, or `unavailable`. These are structural facts, not
Squad Interest by themselves. Squad Interest is active only when coverage is
below or above typical and both offense and defense performance bands are
either `positive_or_above` or `low`. Typical coverage, mixed performance, and
unavailable performance never produce Squad Interest. This evaluation never
gates the line benchmark.

`teamInterest` is the versioned business summary with three independent
sources: line offense, line defense, and approved squad coverage/performance
interpretation. `teamInterest.isInteresting` is the OR of those sources. This mirrors the
purpose of Player Interest—whether further attention is justified—without
introducing an Agent versus Club Scout split.

The interpretation layer is unavailable before eight official league games
(`season_sample_insufficient`); once that gate is met, cleared or not-yet-
loaded stats use `stats_not_loaded`. In either state all benchmark metric states are
`unavailable`, Team Interest is false, and the Team SearchIndex receives no
active Balance finding. These gates never change Team Performance.

## 16.7 Write and invalidation flow

Stats Load derives and persists each Team Player's `lineClassification` from
the canonical builder before rebuilding Team Balance. The resulting
classification is passed into scout calculation: it reclassifies
`preliminary_low_output` ("מחפש זהות") using the performance line, without
changing `primaryPosition`, `positionLayer`, or visual-verification answers.

A manual role or position change updates only the visual-verification fields
and must:

```text
update current Team Player role
    ↓
recompute lineClassification with the canonical builder
    ↓
invalidate or rebuild the Team Balance snapshot
    ↓
recompute lineStructure, lineupBenchmark and their fingerprint
    ↓
refresh downstream projections
```

The Team Balance input fingerprint must include `lineClassification`; a role
edit must therefore never leave a fresh-looking snapshot with stale line
structure. Catalog definitions for Team Season and Player Season must remain
aligned whenever the compact classification or structure projection changes.

## 16.8 SearchIndex projection

`dbSearchIndexes` is a read/search projection and not a source of truth. Each
Player Season index row carries the flat performance fields:

```text
lineClassificationLine
lineClassificationPosition
lineClassificationSource
lineClassificationEvidenceLevel
lineClassificationModelVersion
```

The same row may also carry `primaryPosition` and `positionLayer`, but those
remain the visual-verification fields. Stats Load updates the flat
`lineClassification*` fields and scout-profile summary; it must not replace
the visual fields.

For Team Balance, the Team Season index stores only the balance dependency
versions and the compact `scoutInterpretationModelVersion`,
`scoutInterpretationAvailability`, `scoutInterpretationAvailabilityReason`, `scoutOffenseFinding`,
`scoutDefenseFinding`, and `teamInterest` projection. It does not duplicate
the line-structure facts or the full `lineupBenchmark` evaluation.
