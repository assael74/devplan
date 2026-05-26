// features/insightsHub/performance/data/steps/targets.steps.js

export const targetsSteps = [
  {
    id: 'team-target-start',
    stepLabel: 'נקודת הפתיחה',
    numStep: 3,
    iconId: 'teams',
    title: 'מודל הביצוע מתחיל מיעד קבוצתי',
    textParts: [
      { text: 'נקודת הפתיחה היא ' },
      { text: 'מיקום בטבלה', tone: 'tablePosition' },
      { text: '. ' },
      { text: 'מה המיקום בטבלה שהמועדון מצפה מהקבוצה לסיים בו את העונה.' },
      { br: true },
      { text: 'מודל הביצוע הופך את יעד המיקום ' },
      { text: 'ליעדים מספריים', tone: 'numericTargetsStrong' },
      { text: ': נקודות, שערי זכות ושערי חובה.' },
    ],
    hiddenTitle: 'איך זה עובד?',
    hiddenText:
      'בתחילת העונה מנהל מקצועי מגדיר למאמן יעד קבוצתי כללי. מודל הביצוע לוקח את יעד המיקום בטבלה ומתרגם אותו ליעדים מספריים שאפשר למדוד לאורך העונה.',
    numbersBlock: {
      type: 'teamTargetProfiles',
      title: 'מספרי יעד לפי אזור טבלה',
      subtitle:
        'המספרים נשלפים ממקור היעדים המקצועי של המערכת, ולא נכתבים ידנית בעמוד ההסבר.',
    },
    buttonLabel: 'המשך להצבת יעדי שחקנים',
  },

  {
    id: 'player-targets',
    stepLabel: 'הצבת יעדים לשחקנים',
    numStep: 4,
    iconId: 'players',
    title: 'יעדים קבוצתיים מספריים מתורגמים ליעדי שחקנים',
    textParts: [
      { text: 'מודל הביצוע לוקח ' },
      { text: 'יעד מספרי קבוצתי' },
      { text: ', מחבר אליו את ' },
      { br: true },
      { text: 'מעמד השחקן בסגל', tone: 'role' },
      { text: ' + ' },
      { text: 'העמדה שלו במגרש', tone: 'position' },
      { br: true },
      { text: ' ומייצר ' },
      { text: 'יעד אישי', tone: 'playerTargetsStrong' },
      { text: ' לכל שחקן שמותאם לדרישות ולציפיות ממנו' },
    ],
    hiddenTitle: 'איך זה עובד?',
    hiddenText:
      'המסלול אינו חלוקה שווה בין כל השחקנים. יעד קבוצתי של שערים, נקודות או ספיגה מתורגם אחרת לשחקן מוביל, לשחקן מרכזי או לשחקן רוטציה. בנוסף, העמדה משנה את סוג האחריות: שחקן התקפה מקבל יעד תפוקה התקפית, ושחקן הגנה נמדד יותר דרך עמידה ביעדי הספיגה וההשפעה הקבוצתית.',
    numbersBlock: {
      type: 'playerOutputShare',
      title: 'דוגמה לחלוקה יעדים אישית',
      subtitle:
        'דוגמה לפי יעד קבוצתי של 80 שערים בעונה. המספרים נבנים לפי מעמד בסגל ועמדה.',
      teamGoalsForTarget: 80,
      teamProfileId: 'midHigh',
    },
    buttonLabel: 'המשך לתוצרי מודל הביצוע',
  },
]
