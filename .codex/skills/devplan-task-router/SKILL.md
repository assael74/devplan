---
name: devplan-task-router
description: Route any DevPlan repository task to the correct work mode, professional role, architecture documents, code layer, and focused validation.
---

# DevPlan task router

Use this skill for every DevPlan repository task. Keep it lightweight; do not
load every architecture document.

## Determine the work mode

- In Codex with a live workspace, inspect and edit the current repository and
  preserve unrelated changes.
- In ChatGPT with a ZIP or uploaded snapshot, work only from the supplied
  snapshot and return explicit changed files or a focused patch. Never claim
  the live repository was updated.
- If the available source or expected deliverable does not make the mode clear,
  ask the user which mode to use before implementation.

## Route the task

1. Read the applicable `AGENTS.md` instructions.
2. Classify the work as implementation, diagnosis, review, architecture,
   UI/UX, data/persistence, documentation, or a necessary combination.
3. Adopt the matching professional role from the root `AGENTS.md`.
4. Read `docs/README.md` and select only the documentation relevant to the
   request.
5. Inspect the requested files and the narrowest direct dependency path before
   proposing or making changes.

Additional routing:

- `src/features/playersDatabase/**`: also use `$players-database`.
- UI, layout, responsive behavior, styling, forms, drawers, modals, or user
  interaction: also use `$devplan-ui-ux`.
- `src/coreData/**`: read `docs/architecture/CORE_DATA.md`.
- Placement, layer ownership, or structural refactors: read
  `docs/architecture/PROJECT_STRUCTURE.md`.
- Scoring, expectations, targets, advanced stats, Live Tagging, scouting,
  Club Intelligence, or reports: follow the exact route in `docs/README.md`.

## Missing definition

If no available skill, documented workflow, or professional role clearly
matches the task, propose the closest role and work mode in one concise
question. Wait for the user's decision before implementation. Do not ask when
the routing is already clear.

## Decision rules

- Treat explicit user scope as authoritative.
- Prefer existing ownership, naming, builders, and patterns over parallel code.
- If documentation and implementation disagree, identify the discrepancy and
  establish the canonical source before changing behavior.
- Do not ask the user to attach repository files available in a live workspace.
- Do not turn a localized task into a broad architecture review.
- Validate in proportion to risk with focused checks; do not default to a full
  build.

