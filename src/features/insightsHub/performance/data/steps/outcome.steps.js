// features/insightsHub/performance/data/steps/outcome.steps.js

export const outcomeSteps = [
  {
    id: 'efficiency-impact-bridge',
    stepLabel: 'פרופיל ביצוע',
    numStep: 8,
    iconId: 'performanceProfile',
    title: 'חיבור שני המדדים הראשונים נותן את פרופיל הביצוע',
    textParts: [
      { text: 'מדד היעילות', tone: 'rating', iconId: 'scoringRating' },
      { text: ' אומר לצוות המקצועי איך השחקן או קבוצה שיחקה היום, האם בהתאם / מעבר / פחות מהציפיות' },
      { text: '.' },
      { br: true },
      { br: true },
      { text: 'מדד ההשפעה', tone: 'impact', iconId: 'scoringImpact' },
      { text: ' אומר כמה רחוקים או קרובים השחקן או הקבוצה בסך הכל בפלוס ובמינוס מהמטרה והיעד שהוצב להם בתחילת העונה לפי ' },
      { text: 'מיקום בטבלה', tone: 'tablePosition' },
      { text: '.' },
    ],
    buttonLabel: 'המשך להסבר פרופיל הביצוע',
  },

  {
    id: 'performance-profile',
    stepLabel: 'הסבר לפרופיל הביצוע',
    numStep: 9,
    iconId: 'performanceProfile',
    title: 'התוצר הסופי של המודל הוא פרופיל הביצוע',
    textParts: [
      { text: 'בסוף התהליך, ' },
      { text: 'מודל הביצוע ', iconId: 'performanceModel' },
      { text: ' מחבר בין ' },
      { br: true },
      { text: 'מדד היעילות', tone: 'rating', iconId: 'scoringRating' },
      { text: ' לבין ' },
      { text: 'מדד ההשפעה המצטברת', tone: 'impact', iconId: 'scoringImpact' },
      { br: true },
      { text: ' ומתרגם אותם לפרופיל מקצועי, אובייקטיבי, שנקרא ' },
      { text: 'פרופיל ביצוע', tone: 'profile', iconId: 'performanceProfile' },
    ],
    profilesBlock: {
      label: 'פירוט פרופילי הביצוע',
      title: 'פירוט פרופילי הביצוע',
    },
    hiddenTitle: 'מה הפרופיל מסכם?',
    hiddenText:
      'פרופיל הביצוע נותן במילים את הדרך שבה צריך לבחון את שני המדדים יחד: איכות משחק, השפעה מצטברת, דקות, יציבות וגודל מדגם. כך אפשר להבין מי מייצר ערך, מי מנצל את הקרדיט, מי יציב, מי לא יציב, ומי עדיין מחוץ למדגם.',
    buttonLabel: 'סיכום מודל ביצוע',
  },

  {
    id: 'performance-model-summary',
    stepLabel: 'סיכום מודל הביצוע',
    numStep: 10,
    iconId: 'performanceModel',
    title: 'מסלול מודל הביצוע',
    type: 'summaryFlow',
    buttonLabel: 'סיום',
  },
]
