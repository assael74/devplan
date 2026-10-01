# DevPlan Codex instructions

## Scope

- These instructions are for Codex working with the live repository.
- ChatGPT working from an uploaded ZIP uses `docs/onboarding/CHATGPT_ZIP_MODE.md`.
- Explain results, findings, and questions in simple Hebrew with minimal English.
- Preserve exact code identifiers, paths, commands, and API names.
- Explicit user instructions override project guidance.
- Ask one concise question only when uncertainty could materially change the
  architecture, product behavior, persisted data, or requested result.

## Task routing

- Start from the requested files and the current diff when relevant.
- Inspect only the narrowest dependency path needed to complete or verify the task.
- Read `docs/README.md` only when the task needs an architecture or domain contract.
- Under `src/features/playersDatabase`, use `$players-database` and follow the
  feature `AGENTS.md`.
- For visible UI, interaction, layout, styling, responsive behavior, or print UI,
  use `$devplan-ui-ux`.
- If no documented skill or professional role clearly matches the task, propose
  the closest role in one short question before implementation.

Choose the professional role that matches the task: senior application engineer,
software architect, Firestore data architect, UI/UX designer and front-end
engineer, code reviewer, debugging engineer, or technical writer. Combine roles
only when the task genuinely crosses boundaries.

## Product model

DevPlan is a single-user application. One primary mutating workflow is performed
at a time. Prefer the simplest explicit solution that correctly supports that
workflow.

Do not add queues, distributed locks, leases, background workers, generalized
job orchestration, multi-user conflict handling, or speculative recovery systems
without a concrete requirement approved by the user.

This does not remove the need for validation, atomic writes, idempotency where a
request may repeat, clear UI states, and protection against partial writes.

Prefer the flow:

```text
INPUT → VALIDATE → BUILD → WRITE → RETURN
```

## Project boundaries

- `src/app`: shell, routes, providers, and top-level integration.
- `src/application`: shared application actions and orchestration.
- `src/coreData`: enriched primary objects and relations.
- `src/features`: feature-owned pages, UI, models, and local domain behavior.
- `src/services`: external services and low-level data access.
- `src/shared`: reusable domain calculations and models.
- `src/ui`: shared presentation components and patterns.
- `functions`: server-side workflows.

Extend an existing owner before creating parallel logic. Search for an existing
concept before adding a file, function, model, or abstraction.

## Code style

- The first line of a source-code file must contain its project-relative path.
- Use clear names that are neither vague nor unnecessarily long.
- Match the surrounding module's public API and formatting.
- Prefer single quotes, two-space indentation, and no semicolons where consistent.
- Do not use `??`; use an explicit `null`/`undefined` check or the existing safe
  fallback pattern.
- Keep a function signature on one line only when it has at most four short
  properties or parameters; otherwise use balanced multi-line formatting.
- Keep complex conditions, callbacks, and object construction readable.
- Separate data access, domain calculation, view-model shaping, and rendering.
- Reuse canonical builders and helpers instead of duplicating formulas.
- Do not reformat, rename, move, or clean unrelated code.
- Comments explain non-obvious intent or invariants, not the code itself.

## Work and validation

- Preserve unrelated user changes and untracked files.
- Do not access or modify the user's Windows `Documents` directory.
- Use focused checks. Do not run a full production build unless explicitly asked
  or targeted validation cannot establish correctness.
- Do not stop after partial implementation while safe, requested work remains.
- Do not expand into unrelated cleanup.

Update documentation only when a change modifies architecture, ownership, a
persisted structure, a business contract, lifecycle behavior, a public boundary,
or a documented path. Document stable rules rather than private implementation.

## Git

When the user requests a Git action, treat it as one complete operation:

```text
git add .
git commit -m "<date or topic>"
git push
```

Inspect status first. If unexpected changes appeared after the user's approval,
report them before including them.
