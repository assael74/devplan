# Core Data — שכבת הרכבת הדאטה המרכזית

הקובץ הזה מסביר את תפקיד `src/features/coreData`.

צריך לצרף אותו לצ׳אט כאשר המשימה קשורה לדאטה הגדול של האפליקציה, לאובייקטים הראשיים, או לחיבור בין נתונים שנשלפו מ־Firestore.

---

## תפקיד התיקייה

`src/features/coreData` היא שכבת הרכבת הדאטה המרכזית של devplan.

כאן בונים את האובייקטים הראשיים של האפליקציה מתוך הדאטה שנשלף מ־Firestore.

ה־Firestore מחזיק דאטה מחולק, רזה או מפוזר במסמכי shorts.
`coreData` מחבר את הדאטה הזה לאובייקטים מסודרים, עשירים ומוכנים לצריכה.

הזרימה הכללית:

```txt
Firestore shorts
→ merge / normalize
→ indexes / maps
→ enrich stage
→ main app entities
→ useCoreData()
