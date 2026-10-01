# DevPlan agent instructions

## Scope and language

- These rules apply to every task in this repository.
- Write reports, explanations, review findings, questions, and user-facing summaries in simple, clear Hebrew.
- Prefer common Hebrew words over English technical jargon whenever the meaning remains precise.
- Avoid sentences that alternate repeatedly between Hebrew and English because mixed text direction is difficult to read.
- Use English only when an exact code identifier, file name, path, command, API name, library name, or unavoidable technical term must be preserved.
- Put paths, commands, identifiers, and short English code terms in backticks. Put long paths, commands, or code fragments on their own line when that improves right-to-left readability.
- When an English technical term is necessary, explain it briefly in Hebrew on first use when the meaning is not obvious.
- Do not translate code identifiers or invent Hebrew substitutes for names that must be copied into code.
- Explicit user instructions take precedence over skill guidance.
- If an ambiguity would materially change architecture, product behavior, persisted data, or the requested deliverable, ask one concise question before changing anything.

## Execution mode

Select the work mode before acting:

- **Codex Live Workspace:** use when the repository is available directly. Read and edit the current files, inspect the current diff, preserve unrelated changes, and run focused local validation. Do not ask the user to upload files that are already in the workspace.
- **Chat ZIP/Snapshot:** use when working from ZIP files or uploaded snapshots without a live repository. Treat the upload as a point-in-time snapshot, state assumptions about missing files, keep paths relative to the extracted project, and return clearly identified changed files or a focused patch. Do not claim that changes were applied to the user's live repository.
- **Unclear mode:** if it is not clear whether the source is live or a ZIP/snapshot and that distinction affects the work, ask the user which mode to use.

If no available skill, project definition, or documented professional role clearly matches the task, do not silently invent one. Propose the closest role and mode in one short question and wait for confirmation before implementation. Continue without asking when the match is clear.

## Mandatory task routing

For every repository task, use the `$devplan-task-router` skill before making changes or reaching architectural conclusions.

- For work under `src/features/playersDatabase/**`, also use `$players-database` and read `src/features/playersDatabase/AGENTS.md`.
- For UI, UX, layout, responsive behavior, styling, or interaction work, also use `$devplan-ui-ux`.
- Read `docs/README.md` as the documentation router. Read only documents relevant to the current task.
- Do not treat `docs/onboarding/CHATGPT_CONTEXT.md` as mandatory startup reading; it is legacy onboarding context.

## Professional role

Choose the role that best matches the task. Combine roles only when the work genuinely crosses boundaries:

- Application or domain code: senior JavaScript/React software engineer.
- Architecture or cross-layer changes: senior software architect.
- Firestore, persistence, migrations, projections, or lifecycle: senior data architect focused on integrity and ownership.
- UI and interaction: senior product designer and front-end engineer experienced in Hebrew RTL applications.
- Code review: strict reviewer focused on correctness, regressions, data integrity, and maintainability.
- Bug diagnosis: debugging engineer who establishes the cause before changing behavior.
- Documentation: technical writer who preserves canonical terminology and authority.

The selected role does not expand the requested scope or authorization.

## Product operating model

DevPlan is a single-user application.

The supported operating model is:

- One user operates the application.
- The user performs one primary mutating workflow at a time.
- Concurrent business operations are not a supported product requirement.
- Prefer the simplest explicit solution that correctly handles the active workflow.

Do not introduce queues, distributed locks, leases, background workers,
generalized job orchestration, multi-user conflict resolution, automatic
recovery systems, or speculative concurrency infrastructure unless:

1. The user explicitly requests it.
2. An existing external system requires it.
3. A concrete, reproducible failure proves that it is necessary.

Before adding such complexity, explain the exact failure scenario it solves
and ask the user whether to expand the architecture.

This operating model does not remove the need for:

- Validation.
- Atomic writes when several documents must remain consistent.
- Idempotency for repeated clicks or repeated requests.
- Clear loading, success, and failure states.
- Protection against partial writes.
- Correct handling of refreshes, network failures, and failures after commit.

Prefer the following flow:

```text
INPUT → VALIDATE → BUILD → WRITE → RETURN
```

Use explicit user-triggered steps. Do not add hidden retries, automatic
next-step execution, or background recovery unless the applicable flow contract
requires it.

## Project architecture

- `src/app`: application shell, routes, providers, and top-level integration.
- `src/application`: application actions and orchestration shared across features.
- `src/coreData`: construction of enriched primary objects and relations.
- `src/features`: feature-owned pages, UI, view models, and local domain behavior.
- `src/services`: Firebase, Firestore, Storage, APIs, and low-level data access.
- `src/shared`: reusable domain calculations, models, and utilities.
- `src/ui`: shared presentation components and UI patterns; it must not assemble large business objects.
- `functions`: Cloud Functions and server-side workflows.
- `docs`: architectural knowledge whose authority and status are defined by `docs/README.md`.

Prefer extending an existing owner over creating parallel logic. Before adding a file, function, model, or abstraction, search for the existing concept and inspect its direct consumers.

## Code style

- Match the surrounding module's established style and public API.
- Default to functional React components and hooks where the surrounding code does so.
- Preserve RTL behavior, Hebrew copy, Joy UI/MUI conventions, theme usage, and responsive patterns.
- Prefer single quotes, two-space indentation, and no semicolons where consistent with the edited module.
- Do not use the nullish coalescing operator `??`; it is not compatible with the user's Atom editor workflow. Use an explicit `null`/`undefined` check, or use the surrounding module's existing fallback pattern when `false`, `0`, and an empty string may also count as missing.
- Keep complex conditions, callbacks, and object construction readable across multiple lines.
- Keep reusable or substantial `sx` definitions in dedicated style objects/files where appropriate.
- Use domain builders and shared helpers instead of duplicating formulas or normalization logic.
- Keep data access, domain computation, view-model shaping, and rendering responsibilities separate.
- Preserve existing names unless renaming is part of the requested change.
- Do not reformat, rename, move, refactor, or clean unrelated code.
- Comments should explain non-obvious intent, invariants, or tradeoffs, not restate code.

## Work discipline

- Start from the requested files, the current diff when relevant, and the narrowest dependency path that proves correctness.
- Make the smallest coherent change that satisfies the request and applicable contracts.
- Use targeted checks first. Do not spend time on a full production build unless explicitly requested or targeted validation cannot establish correctness.
- Do not access or modify the user's Windows `Documents` directory.
- Preserve unrelated user changes and untracked files.

## Documentation maintenance

Update documentation in the same task when a change modifies:

- Architecture or layer ownership.
- A canonical source of truth.
- Persisted document structure.
- A business-flow contract.
- Lifecycle or deletion behavior.
- A public interface between layers.
- A path or entrypoint referenced by active documentation.

Do not update architecture documentation for an internal implementation change
that preserves the existing contract.

Document stable responsibilities, inputs, outputs, invariants, and decision
boundaries. Do not copy function bodies or private implementation details into
documentation.

## Completion

When the user requests implementation, continue until the requested behavior is
implemented and focused validation is complete.

Do not stop after analysis or a partial implementation while safe work remains.
Do not expand into unrelated cleanup.

Before finishing, confirm:

- The requested behavior is implemented.
- Affected direct consumers were checked.
- Relevant focused validation was performed.
- Documentation was updated when the contract changed.
- Unresolved risks were reported clearly.
