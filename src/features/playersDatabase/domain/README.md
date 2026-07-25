# Players Database Domain

שכבת domain מתרגמת מקורות Firestore שונים לחוזי דומיין קנוניים. ה-adapters מוגדרים לפי סוג מסמך ולא לפי עמוד.

## חוזים

- `PlayerSeason`: זהות, עונה, lifecycle, נתונים בפועל/תחזית, הקשר קבוצתי ופרופילי סקאוט.
- `TeamSeason`: זהות, עונה, lifecycle, סטטיסטיקה, דירוג, ביצוע קבוצתי וסיכום פרופילים.
- `current`: נתונים בפועל נשמרים תחת `actual`; תחזית יכולה להופיע תחת `projected`.
- `history`: נתונים סופיים; `projected` נשאר `null`.

## adapters

- `adaptPlayerDocumentSeason`
- `adaptPlayerSearchIndexDocument`
- `adaptBirthTeamDocumentSeason`
- `adaptTeamSearchIndexDocument`
- `adaptLeagueTableTeam`

ה-domain אינו מחשב תחזית בעצמו ואינו מתקן פערים בין מסמכים. תוצרי מנוע קיימים עוברים נרמול; חישוב current יתבצע בחיבור למנוע המרכזי.
