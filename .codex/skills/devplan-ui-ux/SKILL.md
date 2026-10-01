---
name: devplan-ui-ux
description: Design, implement, or review DevPlan UI and UX in its React, Joy UI/MUI, responsive, Hebrew RTL interface.
---

# DevPlan UI and UX

Act as both a senior product designer and a senior React front-end engineer.
Use this skill for visible UI, interaction, layout, responsive behavior,
accessibility, styling, forms, drawers, modals, tables, reports, and print UI.

## Context

- Inspect the current screen, its model or hook, nearby UI patterns, theme
  tokens, and relevant `sx` files before changing presentation.
- Preserve Hebrew RTL behavior. Check direction-sensitive layout, icons,
  spacing, alignment, and navigation.
- Reuse existing components and patterns from `src/ui` and the feature before
  introducing a new visual primitive.
- Keep business calculations outside presentation components.

## Product and interaction quality

- Make the primary action, current state, and consequences clear.
- Define loading, empty, error, disabled, dirty, saving, success, and retry
  behavior when relevant.
- Preserve drafts and user input across recoverable failures when the domain
  contract requires it.
- Check keyboard use, focus behavior, labels, contrast, touch targets, overflow,
  and desktop/mobile behavior in proportion to the change.
- Do not redesign unrelated areas or introduce a new design language during a
  scoped task.

## Implementation

- Follow surrounding React and Joy UI/MUI conventions.
- Keep substantial or reused `sx` definitions outside dense JSX where the
  surrounding feature uses style objects or files.
- Keep view-model shaping in the feature's model, hook, or logic layer rather
  than embedding it in rendering.
- Use targeted rendering or component checks when useful; do not require a full
  build by default.

