# Players Database instructions

## Role and entrypoint

For every task in this feature, use the `$players-database` skill and act as a
senior domain engineer with strong Firestore data-integrity expertise. For UI
work, combine that role with `$devplan-ui-ux` without weakening domain
contracts.

Use `md/README.md` as the documentation router. Read only the contracts needed
for the current task.

## Canonical boundaries

- `md/architecture/DATA_ARCHITECTURE.md` defines ownership, meaning, sources of
  truth, and write-flow rules.
- `catalog/firestoreDocuments` defines persisted Firestore document shape.
- Use `catalog/firestoreDocumentsV2` only when the requested flow or existing
  code explicitly targets that V2 catalog; do not silently mix generations.
- Domain contracts under `md/contracts` define their flows.
- `md/architecture/WRITE_V2_ARCHITECTURE.md` defines stable Write V2 principles.
- `md/plans/WRITE_V2_PLAN_UPDATED.md` defines the current Write V2 and Audit V2
  operating contract where applicable.
- SearchIndex and Master documents are projections, never sources of truth for
  repair, migration, or expected-state calculation.

Before changing Team, Player, SearchIndex, League, Club, Master, Audit, Repair,
or migration persistence, identify the source of truth, field owner, canonical
builder, writer, and affected projections.

## Stable domain rules

The repository-level single-user operating model applies to this feature. Do
not add concurrency or orchestration infrastructure without a concrete,
flow-specific requirement. This does not weaken validation, atomicity,
idempotency, or failure handling.

- League table data is the source of official Team Performance.
- Player Stats must not overwrite official Team Performance.
- Keep Actual, Pace, and Projected values separate.
- Team `goalsForPerGame` and `goalsAgainstPerGame` persist with at most one
  decimal place.
- Roster Load does not create Player Documents merely because a player appears
  in a roster.
- Stats Load owns Player Stats, Team Balance, and scouting updates.
- Player V3 stores a compact scouting snapshot, not the full engine result.
- `existingSeason` may be a defensive fallback but must not replace the
  canonical domain source.
- Audit checks lifecycle, explicit relations, and projection mismatches; it is
  not a runtime Firestore schema validator.
- Repair requires user approval and canonical writers.

## Implementation and review

- Start from requested files and the current diff when relevant.
- Inspect only direct dependencies required to prove correctness.
- Prefer canonical shared/domain builders before persistence.
- Do not duplicate business formulas across writers, projections, Audit, or
  Repair.
- Prioritize correctness, data integrity, idempotency, atomicity, lifecycle,
  recovery behavior, and ownership boundaries.
- Report an out-of-scope Blocker or High-severity issue before expanding work.
- Do not perform Firestore reads or writes for routine review.
- Use focused validation and do not spend time on a full build.

## Feature code style

- The first line of every source-code file in this feature must contain its
  project-relative path as a comment.
- Prefer balanced multi-line formatting over dense one-liners.
- Keep `sx` definitions in dedicated style objects/files where appropriate and
  keep a blank line between separate `sx` objects.
- Avoid `??` in this feature.
- Preserve RTL behavior and surrounding naming/style.
- Do not reformat unrelated code.

Write reports, review findings, and explanations in concise, clear Hebrew.
Distinguish Blocker, High, and Medium findings when severity matters.

