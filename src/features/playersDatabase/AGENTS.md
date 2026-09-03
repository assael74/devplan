# AGENTS.md

## playersDatabase working rules

Before modifying code under this directory, read:

- `TEAM_DATA_ARCHITECTURE.md`

That file defines the canonical source-of-truth and Firestore persistence rules for this feature.


## Firestore catalog is mandatory

The persisted Firestore document schema source of truth is:

- `catalog/firestoreDocuments`

Before changing Team, Player, or SearchIndex persistence, inspect the relevant catalog definition as well as `TEAM_DATA_ARCHITECTURE.md`.

Use the two sources for different questions:

- `TEAM_DATA_ARCHITECTURE.md` → ownership, meaning, source-of-truth and write-flow rules.
- `catalog/firestoreDocuments` → persisted document structure/schema contract.

Do not treat writers, existing Firestore data, Audit code, Repair code, or SearchIndex projections as the canonical document schema when a catalog contract exists.

Any persistence change that adds, removes, renames, or changes the shape of a field must be checked against and, when appropriate, reflected in the relevant catalog definition.


## Mandatory architecture checks

Any change involving the following areas must be checked against `TEAM_DATA_ARCHITECTURE.md` before implementation:

- Team Document
- Player Document
- Team SearchIndex
- Player SearchIndex
- Roster Load
- Stats Load
- Team Balance
- Scouting persistence
- Audit
- Repair
- Migration

## Audit decision order

Before changing Audit, answer these questions in order:

1. What is the canonical lifecycle status?
2. Should this document exist in that lifecycle?
3. What is the canonical source of truth?
4. Is this an explicit relation between documents?
5. Should the existing document no longer exist?

Audit is not a runtime Firestore schema validator. Do not compare documents to
the Catalog for missing, unknown, legacy, or mistyped fields. The Catalog
remains mandatory when changing persistence writers or persisted schema.

## Core rules

- League table data is the source of truth for official Team Performance.
- Player Stats must not overwrite official Team Performance.
- SearchIndex is projection only and never a source of truth.
- Actual, Pace, and Projected values must remain separate.
- Team `goalsForPerGame` and `goalsAgainstPerGame` persist with at most one decimal place.
- Roster Load does not create Player Documents merely because a player exists in a roster.
- Stats Load owns Player Stats, Team Balance, and scouting updates.
- Player V3 stores a compact scouting snapshot, not the full scouting engine result.
- Avoid duplicating business logic across writers. Prefer canonical shared/domain builders before persistence.
- `existingSeason` may be used as a defensive fallback, but must not replace the canonical domain source.
- Do not use SearchIndex as a repair/migration source when canonical domain data exists.

## Review behavior

When changing persistence behavior:

1. Identify the source of truth.
2. Trace the full write path.
3. Check all projections of the affected fields.
4. Avoid introducing parallel formulas.
5. Prefer Code Only validation unless Firestore data access is strictly necessary.
6. Do not perform Firestore reads/writes merely for routine code review.
