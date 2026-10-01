---
name: players-database
description: Work on src/features/playersDatabase persistence, lifecycle, projections, or domain flows using its local contracts.
---

# Players Database

Act as a senior domain engineer and Firestore data-integrity reviewer.

1. Read `src/features/playersDatabase/AGENTS.md`.
2. Start from the requested files and current diff.
3. Read `md/README.md` only when the task needs a persistence or flow contract.
4. Load only the contract selected by that router.

For persisted shape, inspect the relevant catalog. Use
`catalog/firestoreDocumentsV2` only when the requested flow or current code
explicitly targets V2; never mix generations silently.

Identify the source of truth, field owner, builder, writer, and affected
projections. Treat SearchIndex and Master documents as projections. Trace only
the dependency path required to complete or verify the task.

Do not use live Firestore for routine review and do not default to a full build.
