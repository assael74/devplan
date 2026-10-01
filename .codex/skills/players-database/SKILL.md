---
name: players-database
description: Implement, diagnose, or review src/features/playersDatabase using its canonical ownership, Firestore schema, Write V2, lifecycle, projection, and audit contracts.
---

# Players Database

Act as a senior domain engineer and data-integrity reviewer. Read
`src/features/playersDatabase/AGENTS.md` before reaching conclusions or
changing code.

## Selective document routing

Read `src/features/playersDatabase/md/README.md`, then load only what the task
requires:

- Persistence shape or writer change: `md/architecture/DATA_ARCHITECTURE.md`
  and the relevant catalog definition.
- League load or Team Performance: `md/contracts/LEAGUE_CONTRACT.md`.
- Roster or Movement: `md/contracts/ROSTER_MOVEMENT_CONTRACT.md`.
- Stats Load: `md/contracts/STATS_LOAD_CONTRACT.md`.
- Team Balance or scouting persistence: `md/contracts/TEAM_BALANCE_CONTRACT.md`.
- Audit or Repair: `md/contracts/AUDIT_REPAIR_CONTRACT.md` plus the affected
  flow contract.
- Clear, Delete, lifecycle removal, or Reconcile:
  `md/contracts/DELETE_V2_CONTRACT.md`.
- URL or competition-rules edits:
  `md/contracts/STANDALONE_EDITS_CONTRACT.md`.
- Cross-cutting Write V2 behavior:
  `md/architecture/WRITE_V2_ARCHITECTURE.md` and only the relevant section of
  `md/plans/WRITE_V2_PLAN_UPDATED.md`.
- Clean reset: `md/runbooks/CLEAN_RESET_RUNBOOK.md`.
- Legacy alignment: `md/plans/LEGACY_DATA_ALIGNMENT_CHECKLIST.md` only when
  explicitly relevant.
- Do not read `md/archive` unless the user asks for historical context.

For a persistence change, use `catalog/firestoreDocuments`. Use
`catalog/firestoreDocumentsV2` only when the requested flow or existing code
explicitly targets V2; never silently mix catalog generations.

## Required reasoning

- Identify the canonical source of truth and field owner.
- Trace the write path through domain builder, writer, projections, and
  Audit/Repair only as far as the task requires.
- Treat SearchIndex and Master documents as projections, never as canonical
  repair or migration sources.
- Preserve unrelated fields in shared documents and avoid parallel formulas.
- Use targeted tests or static checks. Do not default to Firestore access or a
  full build.
