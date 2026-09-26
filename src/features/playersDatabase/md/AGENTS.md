# AGENTS.md

## playersDatabase working rules

Before modifying code under this directory, read:

- `README.md`
- `architecture/DATA_ARCHITECTURE.md`
- the relevant file under `contracts/`
- `plans/WRITE_V2_PLAN.md` when the change is part of Write V2

These files define the canonical source-of-truth, persistence ownership and current migration rules for this feature.


## Firestore catalog is mandatory

The persisted Firestore document schema source of truth is:

- `catalog/firestoreDocuments`

Before changing Team, Player, or SearchIndex persistence, inspect the relevant catalog definition as well as `architecture/DATA_ARCHITECTURE.md`.

Use the two sources for different questions:

- `architecture/DATA_ARCHITECTURE.md` → ownership, meaning, source-of-truth and write-flow rules.
- `catalog/firestoreDocuments` → persisted document structure/schema contract.

Do not treat writers, existing Firestore data, Audit code, Repair code, or SearchIndex projections as the canonical document schema when a catalog contract exists.

Any persistence change that adds, removes, renames, or changes the shape of a field must be checked against and, when appropriate, reflected in the relevant catalog definition.


## Mandatory architecture checks

Any change involving the following areas must be checked against `architecture/DATA_ARCHITECTURE.md` before implementation:

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


## Task scope and review efficiency

Use the smallest scope that can safely complete and validate the requested task.

- Work only within the scope explicitly requested by the user.
- Start from the files named in the task and, when relevant, the current `git diff`.
- Inspect direct dependencies only when required to understand or validate the requested change.
- Do not scan the entire `playersDatabase` feature for a localized task.
- Do not perform a broad architecture review unless the task explicitly requires one.
- For follow-up reviews, start with the latest diff and previously reported findings instead of re-reviewing unchanged areas.
- Run targeted tests first. Expand the test scope only when dependencies, risk, or failures justify it.
- Do not refactor, clean up, rename, move, or rewrite unrelated code discovered during a scoped task.
- Do not expand a task merely because an unrelated improvement is available.
- If an out-of-scope Blocker or High-severity issue is discovered, report it before expanding the implementation scope.
- When additional files must be inspected, prefer the narrowest dependency path that can prove correctness.


## Plan and task documents

Architecture rules and implementation plans have different roles.

- `AGENTS.md` defines stable working rules for this feature.
- `architecture/DATA_ARCHITECTURE.md` defines the canonical architecture and persistence ownership rules.
- `plans/WRITE_V2_PLAN.md` defines the current implementation sequence and wave-specific decisions.
- `architecture/WRITE_V2_ARCHITECTURE.md` defines the stable Write V2 execution principles.
- Read the relevant plan section when the task depends on it; do not treat the entire plan as mandatory reading for every localized task.
- A task-specific instruction may narrow the work scope, but it must not override canonical architecture, persistence contracts, or source-of-truth rules.


## Implementation and review discipline

For implementation tasks:

1. Establish the requested scope.
2. Read the applicable canonical contract.
3. Inspect the current implementation and direct dependencies.
4. Make the smallest coherent change that satisfies the contract.
5. Run targeted validation.
6. Report any material deviation or unresolved risk.

For review tasks:

1. Start with the requested change or current diff.
2. Validate it against the applicable canonical contracts.
3. Check affected write paths and projections only as far as necessary to prove correctness.
4. Prioritize correctness, data integrity, idempotency, race/generation safety, recovery behavior, and contract violations.
5. Do not turn a scoped review into a general refactor proposal.

A review finding outside the requested scope should be reported separately rather than silently incorporated into the implementation.

## Code style

- Prefer balanced multi-line formatting over dense one-liners.
- Keep `sx` definitions in dedicated style objects/files where appropriate.
- Keep a blank line between separate `sx` style objects.
- Avoid `??`.
- Preserve RTL conventions in UI code.
- Do not reformat unrelated code.
- Do not compress complex conditions, callbacks, or object construction into one line.
- Match the existing style of the surrounding module unless it conflicts with these rules.
- The first line of every source-code file must contain its project-relative path as a comment, for example:
  `// src/features/playersDatabase/...`


## Communication style

- Write reports, reviews, findings, and explanations in Hebrew.
- Use simple and clear Hebrew.
- Keep findings concise and focused.
- Explain the problem, its impact, and the required action without unnecessary background.
- Avoid English words and professional jargon when a clear Hebrew equivalent exists.
- Use English only when referring to code identifiers, file names, paths, commands, APIs, or technical terms that must remain exact.
- For review findings, clearly distinguish severity when relevant: Blocker, High, Medium.
- Do not produce long summaries when a short conclusion is sufficient.

