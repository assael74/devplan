---
name: devplan-ui-ux
description: Design, implement, or review visible DevPlan UI, interaction, responsive behavior, styling, forms, reports, or print output.
---

# DevPlan UI and UX

> **הנחת עבודה מחייבת:** DevPlan היא מערכת למשתמש אחד, המבצע בכל רגע תהליך כתיבה עיקרי אחד.
> כל הסוכנים חייבים להתבסס על כך בתכנון, במימוש ובביקורת, תוך שמירה על אימות נתונים, כתיבות אטומיות והגנה מפני כתיבה חלקית.

**חובה בכל מסמך חדש:** כל סוכן, כולל סוכני משנה, חייב להוסיף את הערת ״הנחת עבודה מחייבת״ שלעיל בראש כל מסמך הנחיות או תיעוד חדש במאגר, מיד אחרי הכותרת הראשית ולאחר מטא־נתונים אם קיימים. בעת עדכון מסמך קיים יש לוודא שההערה מופיעה בראשו. יש לשמור על גבולות העבודה שהמשתמש קבע.

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
