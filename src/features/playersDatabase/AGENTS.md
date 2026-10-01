# Players Database instructions

## Scope

These rules apply only under `src/features/playersDatabase`. Use the
`$players-database` skill for persistence, lifecycle, projections, and domain
flows. Add `$devplan-ui-ux` for visible interface work.

Use `md/README.md` only when the task needs a domain or persistence contract.
When an active document is added, removed, or changes status, update that router.

## Canonical boundaries

- `md/architecture/DATA_ARCHITECTURE.md` defines ownership and sources of truth.
- `catalog/firestoreDocuments` defines the regular persisted document shapes.
- `catalog/firestoreDocumentsV2` applies only to an explicit V2 flow.
- `md/contracts` defines domain flows.
- `md/architecture/WRITE_V2_ARCHITECTURE.md` defines stable Write V2 principles.
- `md/plans/WRITE_V2_PLAN_UPDATED.md` is read only for cross-cutting Write V2 or
  Audit V2 behavior.
- SearchIndex and Master documents are projections, never repair or migration
  sources of truth.

Before changing persistence, identify the source of truth, field owner,
canonical builder, writer, and affected projections.

## Stable rules

- League table data owns official Team Performance.
- Player Stats must not overwrite official Team Performance.
- Keep Actual, Pace, and Projected values separate.
- Persist `goalsForPerGame` and `goalsAgainstPerGame` with at most one decimal.
- Roster Load does not create Player Documents only because a player is listed.
- Stats Load owns Player Stats, Team Balance, and scouting updates.
- Player V3 stores a compact scouting snapshot, not the full engine result.
- `existingSeason` may be defensive fallback, not the canonical domain source.
- Audit checks lifecycle, explicit relations, and projection mismatches; it is
  not a runtime schema validator.
- Repair uses canonical writers and requires user approval.

## Implementation and review

- Start from requested files and the current diff.
- Inspect only direct dependencies needed to prove correctness.
- Reuse canonical builders and do not duplicate formulas across writers,
  projections, Audit, or Repair.
- Prioritize data integrity, atomicity, idempotency, lifecycle, and recovery.
- Do not perform Firestore reads or writes for routine review.
- Use focused validation and do not spend time on a full build.
