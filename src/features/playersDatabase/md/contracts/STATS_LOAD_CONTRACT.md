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

## תרחישי טעינה

Stats V2 תומך בשלושה תרחישים:

1. טעינת Stats ראשונה ל־Team Season קיים.
2. טעינת Stats חוזרת לעונה פעילה; המצב החדש מחליף את מצב ה־Stats הקודם לפי
   ההחלטות שאושרו.
3. טעינת Stats לעונה שהסתיימה; היעד וה־`seasonStatus` נגזרים מה־League
   הקנוני.

`Clear Stats` אינו חלק מ־Stats V2 הנוכחי.

## משתתפי עונה

שורה שאינה בסגל המקורי מחייבת החלטה מפורשת: `left`,‏ `joined` או
`youngerAgeGroup`. החלטה זו אינה יוצרת `pendingPlayers`.

משתתף `left` או `youngerAgeGroup` נשמר לצורך היסטוריה וסטטיסטיקה, אך אינו
נכלל ב־Balance או ב־scout scope הנוכחי.

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
Stats V2 אינו מוחק Player Documents. ניקוי מסמכים שאינם נדרשים יוגדר כתהליך
נפרד בעתיד.

## גבולות הכתיבה

- Team Season מקבל רק את שדות ה־Stats, ה־Movement המקומי המאושר, Team
  Balance, scouting,‏ `scoutProfilesSummary` ומצב טעינת Stats.
- Counterpart Team Season מקבל Movement מאושר בלבד ורק כאשר המסמך כבר קיים.
- Player ו־Team SearchIndexes הם projections בלבד.
- League מקבל רק metadata של טעינת Stats, מספר שחקנים וסיכומי scouting או
  task signals שבבעלות Stats.
- Club ו־Masters מקבלים רק projections הנגזרים מהמצב המאושר.
- patch למסמך משותף חייב לשמר מידע שאינו בבעלות Stats.
