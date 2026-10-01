<!-- README.md -->

# DevPlan

DevPlan היא אפליקציה לניהול, ניתוח ופיתוח מקצועי של קבוצות ושחקני כדורגל.

הפרויקט בנוי כאפליקציה למשתמש יחיד שמבצע בכל רגע תהליך מרכזי אחד. יש להעדיף
פתרון ישיר, ברור ותחום על פני תשתית מורכבת שאינה נדרשת לצורך ממשי.

## כניסה מהירה

- כללי עבודה לסוכן: [`AGENTS.md`](./AGENTS.md)
- נתב מסמכי הפרויקט: [`docs/README.md`](./docs/README.md)
- מבנה השכבות: [`docs/architecture/PROJECT_STRUCTURE.md`](./docs/architecture/PROJECT_STRUCTURE.md)
- עבודה עם ChatGPT וקובץ ZIP: [`docs/onboarding/CHATGPT_ZIP_MODE.md`](./docs/onboarding/CHATGPT_ZIP_MODE.md)
- תיעוד Players Database: [`src/features/playersDatabase/md/README.md`](./src/features/playersDatabase/md/README.md)

אין צורך לקרוא את כל התיעוד לפני כל משימה. מתחילים ב־`AGENTS.md`, מזהים את
תחום העבודה, ואז קוראים רק את המסמך הרלוונטי דרך נתב המסמכים.

## מבנה מרכזי

- `src/app` — מעטפת האפליקציה והחיבורים העליונים.
- `src/coreData` — הרכבת אובייקטי המידע המרכזיים.
- `src/features` — מסכים ותהליכים לפי תחום מוצר.
- `src/services` — גישה לשירותים חיצוניים ולמסד הנתונים.
- `src/shared` — מנועים וחישובים משותפים.
- `src/ui` — רכיבי תצוגה ותבניות משותפות.
- `functions/src` — תהליכים בצד השרת.

## פקודות שימושיות

```bash
npm start
npm test
npm run build
```

בדיקות ובנייה נבחרות לפי היקף השינוי; אין צורך להפעיל בנייה מלאה לכל שינוי
מקומי.
