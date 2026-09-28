# Clear Roster V2

זרימה עצמאית: Prepare → Approval → Receipt → שלבי כתיבה ידניים → Roster Audit.

- תנאי קדם: Team Root ו־Team Season קיימים ו־Stats absent מהשרת.
- בעלות קנונית: teamPlayers, playersCount, pendingPlayers, transfersIn,
  transfersOut ו־rosterImport בלבד.
- Team Season, Balance, scouting וזהויות נשמרים. עובדות המעבר של העונה
  הנמחקת מתאפסות ללא קריאה, בדיקה או כתיבה של הקבוצה שבצד השני.
- אין קריאה או כתיבה של Player Documents; אין תיקון שקט של Stats.
- Receipt נשאר קטן, עם label מחיקת סגל, flowType roster ו־operationType clear.
- תיעוד הביצוע כולל executionStatus, lastCompletedStep, failedStep ו־failedTarget בלבד.
  לאחר כל שלב נשמרת התקדמות; כשל נשאר open. Retry מנקה את פרטי הכשל ומתחיל
  מהשלב הראשון לאחר הכנה ואישור חדשים. רק Audit תקין סוגר ומסמן succeeded.
- מזהי Team Season ו־Team SearchIndex עוברים דרך clearRosterIdentity בלבד.
- Player indexes נקראים לפי הקבוצה ומסוננים לפי normalizer עונה משותף;
  הכתיבה והביקורת מזהות גם ייצוגי עונה שקולים, ללא הסבת מזהים גורפת.
- League/Club/Masters: ערכי שדות בבעלות הפעולה מחושבים לפני האישור;
  כל שדה אחר במסמך המשותף נשמר. Masters אינם מקור לחישוב מוני השחקנים.
- חסר או עמימות ביעד משותף חוסמים Prepare; אין יצירת מסמך חלקי.
- Audit בונה Expected מחדש מהשרת, ובסשן נבדק בנוסף שימור השדות שלא בבעלות.
- לאחר רענון ניתן לבקר את המצב הנוכחי דרך Receipt. ללא snapshot היסטורי
  אין טענה שניתן להוכיח בדיעבד שלא השתנה שדה לפני תחילת הסשן.
- כשל עוצר; Retry מבצע Prepare ואישור חדשים. אין Resume, rollback או retry אוטומטי.
- Retry אינו מסמן Receipt כנטוש. לאחר Prepare ואישור חדשים משתמשים באותו
  Receipt פתוח מהשרת, גם לאחר רענון העמוד. תוצאה לא ידועה אינה הרשאה לנטישה.
  כמה Receipts פתוחים לאותו יעד חוסמים את ההמשך. רק ביקורת תקינה סוגרת פעולה.
- תפריט המחיקה מציג לכל עונה רק את הפעולה הבאה שמותרת מהשרת: Clear Stats,
  או Clear Roster לאחר השלמת Stats. פעולה חסומה אינה מוצגת. Clear Roster נשאר
  זמין גם כשה־Canonical כבר ריק, כדי לאפשר תיקון Projections וביקורת חוזרת.
- הכפתור, Prepare והאישור דורשים גם שאין Stats פתוח ושפעולת Stats האחרונה
  ליעד נסגרה עם ביקורת מלאה ותקינה. ללא Receipt מתאים נדרשת השלמת שלב Stats.
- Clear Stats מאפשר אישור ביקורת וסגירת Receipt גם כאשר אין נתונים לניקוי.
- ריצה על סגל ריק עדיין מסנכרנת ובודקת Projections.

לא הורצו בדיקות. יש להריץ בביקורת: בדיקות Domain המצורפות, build/lint,
בדיקות React של המודאל, ובדיקות Firestore מדומות לכשל בכל שלב ולריצה חוזרת.
