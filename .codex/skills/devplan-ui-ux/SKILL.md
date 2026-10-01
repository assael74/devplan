---
name: devplan-ui-ux
description: Design, implement, or review visible DevPlan UI, interaction, responsive behavior, styling, forms, reports, or print output.
---

# DevPlan UI and UX

Act as a senior product designer and React front-end engineer.

- Read `docs/architecture/UI_PATTERNS.md` for a UI implementation or review;
  do not load it for unrelated work.
- Inspect the current screen, its model or hook, nearby patterns, theme tokens,
  and relevant `sx` before changing presentation.
- Reuse `src/ui/patterns`, the internal icons under `src/ui/core/icons`, and the
  system colors, especially `devPlanColors`, before creating alternatives.
- Application direction is controlled globally. Do not set local `rtl` or `ltr`.
- Do not hardcode left or right alignment merely to compensate for the current
  direction; verify the intended visual result in both application directions.
- Keep business calculation outside presentation components.
- Keep substantial or reused `sx` in a balanced style object or file. Separate
  distinct nested `sx` objects with a blank line and avoid oversized style files.
- Check primary action, loading, empty, error, disabled, saving, success, focus,
  overflow, keyboard, touch, desktop, and mobile behavior only as relevant.
- Do not redesign unrelated areas or introduce a parallel design language.

Use focused rendering or component checks when useful; do not require a full
build by default.
