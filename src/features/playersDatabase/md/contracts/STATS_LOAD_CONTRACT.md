# Stats Load Contract

## אחריות

Stats Load הוא המקור ל־Player Stats. הוא רשאי לעדכן `playerStats`,‏
`statsStatus`, Team Balance, scouting, Player Documents ו־SearchIndexes.

Stats Load רשאי לעדכן גם metadata ו־projections של League,‏ Leagues Master,
Club Documents ו־Clubs Master, אך רק בשדות הנגזרים ממצב ה־Stats המאושר
ונמצאים בבעלות Stats. כתיבות אלה אינן משנות את העובדות הקנוניות של טבלת
הליגה או את Team Performance הרשמי.

הוא אינו רשאי לשכתב Team Performance רשמי, גם כאשר סכומי Player Stats שונים
מסכומי League.

## לפני Commit

בשלב הזיהוי ניתן להשלים מזהה התאחדות וקישור בחלון פרטי שחקן. המזהה והקישור
חייבים להתאים, והזהות נבדקת מחדש בלי למחוק את החלטת ההשתתפות. הקישור עובר
עם הקלט המאושר ונשמר בשדה `manual.playersById[playerId].playerUrl` של Team
Season באישור הטעינה בלבד. עדכון נקודתי משמר את יתר המידע הידני; הקרנות
Player Season ו־SearchIndex מקבלות את הקישור מאותו מצב מאושר.

שמירת חלון הזיהוי מעדכנת את טיוטת הטעינה בלבד, ללא כתיבה ל־Firestore.
`externalPlayerId` ושנתון הזהות משמשים לבניית
`player__{birthYear}__{externalPlayerId}`. שינוי הפרטים מבטל את ההתאמה הקודמת
ומחייב בדיקת זהות מחדש; מזהה חיצוני כפול בין שורות נחסם בחלון.
הקישור חייב להפנות לעמוד שחקן בהתאחדות, עם `player_id` שתואם למזהה שהוזן.
אין להסיק זהות משם השחקן בלבד.

שינוי מזהה או קישור מחייב הכנה מחדש של התוכנית המאושרת. בעת האישור ננעלים
הקלט והתוכנית ששימשו לתצוגה; הסנכרון משתמש באותו מצב מאושר.
משתתף חדש נשמר ב־`roster.playersById` עם המזהה החיצוני דרך כותב השתתפות
הסגל המשותף בשלב `counterparts`, אחרי כתיבת ה־Stats הקנוני. החלטת ההשתתפות
נשמרת בנפרד מהשלמת המזהה והקישור.

גם כאשר קשר הקבוצה כבר קיים ב־Player Season, יש לעדכן נקודתית את
`teamsById[teamId].manual.playerUrl`, בלי להחליף את יתר המידע הידני.
קישור ריק בקלט אינו מוחק קישור קיים במקור האמת; ההקרנות משתמשות בערך
הקנוני לאחר מיזוג הקלט המאושר. Player Root אינו הבעלים של הקישור העונתי.

יש לאמת מול League context את `teamGamePlayed`,‏ `goalsFor`,‏ `goalsAgainst`,
משך המשחק וקיבולת הדקות. יש לחסום סתירות מוכחות, כולל משחקים או Starts מעל
הקיבולת, שערים מעל נתוני League ודקות מעל `teamGamePlayed × gameMinutes`.

אין לבצע clamp, truncation או תיקון שקט של נתוני משתמש.

`playerStats.teamMinutes` נגזר קנונית מ־`teamGamePlayed × gameMinutes`; הוא
אינו input מיובא ואינו מקבל ברירת מחדל `0` כאשר נתוני League ידועים.

`seasonStatus` נגזר ממצב העונה הקנוני ב־League ואינו החלטה חופשית של
המשתמש.

Stats Load דורש Team Root ו־Team Season קיימים שנוצרו בזרימת Roster. הוא
אינו יוצר אותם. Team Root הוא אינדקס ניווט בלבד ואינו יעד כתיבה של Stats.

Stats Load אינו קורא או דורש מסמך מועדון. רמות המועדון מגיעות מ־
`TeamSeason.competitionSnapshot`. העמוד יכול להשתמש ב־`dbClubsDirectory/all`
שכבר נמצא ב־Read Store, אך הכנת הטעינה, הכתיבה וה־Audit אינם תלויים בו.

## תרחישי טעינה

Stats Load תומך בשלושה תרחישים:

1. טעינת Stats ראשונה ל־Team Season קיים.
2. טעינת Stats חוזרת לעונה פעילה; המצב החדש מחליף את מצב ה־Stats הקודם לפי
   ההחלטות שאושרו.
3. טעינת Stats לעונה שהסתיימה; היעד וה־`seasonStatus` נגזרים מה־League
   הקנוני.

`Clear Stats` הוא תהליך נפרד מטעינת Stats.

`Clear Stats` מנקה רק מצב שבבעלות Stats ואת תוצרי החיפוש והמרכזים הנגזרים
ממנו. הוא שומר תמיד את Team Root,‏ Player Root,‏ הסגל, ה־Movement, המידע
הידני ונתוני הטבלה הרשמיים. הכנת המחיקה אינה דורשת `ClubProfile`; רמות
המועדון מגיעות מ־`TeamSeason.competitionSnapshot`, כמו בטעינת Stats.

## משתתפי עונה

שורה שאינה בסגל המקורי מחייבת החלטה מפורשת: `left`,‏ `joined` או
`youngerAgeGroup`. החלטה זו אינה יוצרת `pendingPlayers`.

משתתף `left` או `youngerAgeGroup` נשמר לצורך היסטוריה וסטטיסטיקה ומקבל
Player Scouting אישי. הוא אינו נכלל ב־Team Balance התפעולי, שמייצג את
הסגל הפעיל בלבד.

בטעינה חוזרת, שחקן שהיה במצב ה־Stats הקודם ואינו מופיע בטעינה החדשה מחייב
החלטה מפורשת לפני Approval:

- לשמר את ה־Stats הקודם שלו; או
- להסיר את ה־Stats שלו ולהשאיר אותו בסגל.

הסרת Stats אינה מסירה את השחקן מ־`teamPlayers`, אינה משנה את חברותו בסגל
ואינה יוצרת Movement.

## Balance ו־Scouting

לפני שמונה משחקי League רשמיים, Balance ו־Team Interest אינם זמינים. לאחר
הסף, Stats Load בונה את `lineClassification` ואת Team Balance מהנתונים
הנוכחיים בלבד, ומעביר אותם ל־scouting ול־projections.

לפני Approval יש להשלים Player Scouting,‏ Team Scout ו־
`scoutProfilesSummary`. Team Scout הוא חלק ממצב ה־Team Season הסופי המאושר
ואינו כתיבת Firestore נפרדת.

Stats רשאי ליצור או לעדכן Player Document לפי חוזי ה־scouting וה־lifecycle.
Stats Load אינו מוחק Player Documents. ניקוי מסמכים שאינם נדרשים יוגדר כתהליך
נפרד בעתיד.

המסלול הפעיל נמצא תחת `services/write/stats`. תיקיות `writeV2` ו־`auditV2`
אינן חלק מזרימת Stats Load הפעילה.

## גבולות הכתיבה

- Team Season מקבל רק את שדות ה־Stats, ה־Movement המקומי המאושר, Team
  Balance, scouting,‏ `scoutProfilesSummary`, מצב טעינת Stats וקישורי השחקנים
  שאושרו. משתתפים חדשים מתווספים דרך כותב הסגל המשותף.
- Counterpart Team Season מקבל Movement מאושר בלבד ורק כאשר המסמך כבר קיים.
- כאשר Stats יוצר Movement מאושר, `clubsCenter` מעודכן מאותו Movement גם
  לקבוצה המקומית וגם לכל Counterpart Team Season קיים.
- Player ו־Team SearchIndexes הם projections בלבד.
- League מקבל רק metadata של טעינת Stats, מספר שחקנים וסיכומי scouting או
  task signals שבבעלות Stats.
- Club ו־Masters מקבלים רק projections הנגזרים מהמצב המאושר.
- patch למסמך משותף חייב לשמר מידע שאינו בבעלות Stats.
- לפני כתיבת Player Season יש להבדיל בין מסמך עונה קיים לבין קשר קבוצה קיים.
  כאשר המסמך קיים אך `teamsById[teamId]` חסר, Stats כותב את קשר הקבוצה המלא;
  עדכון חלקי של `stats`,‏ `scouting` והקרנת `manual.playerUrl` מותר רק לקשר
  קבוצה שכבר קיים.

## זמני טעינה במסמך הליגה

טעינת סטטס מקרינה למסמך הליגה את `stats.loadedAt` מתוך `TeamSeason.stats.statsLoadState.updatedAt` כאשר מצב הטעינה `loaded`. שחזור הקרנות משמר את זמן הטעינה המקורי ואינו מציב את זמן השחזור. ניקוי סטטס מאפס את התאריך ל־`null`. תחום הסגל ותאריך טעינתו אינם משתנים. התאריכים נשמרים בפורמט מקור האמת (UTC) ומוצגים באמצעות פונקציות התאריך המשותפות לפי שעון ישראל.
