import { clean, percent } from './teamInformation.utils.js'

const RELIABILITY_LABELS = Object.freeze({
  sufficient: 'גבוהה',
  high: 'גבוהה',
  medium: 'בינונית',
  partial: 'חלקית',
  low: 'נמוכה',
  insufficient: 'נמוכה',
  unavailable: 'אין מספיק נתונים',
})

const reliabilityLabel = value => RELIABILITY_LABELS[clean(value)] || 'אין מספיק נתונים'

const BALANCE_KPI_PRESENTATION = Object.freeze({
  minutes: {
    title: 'חלוקת דקות',
    iconId: 'time',
    description: 'בודק עד כמה דקות המשחק מרוכזות אצל מספר מצומצם של שחקנים.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס חלוקת הדקות.',
    tooltip: 'מבוסס על ריכוז הדקות אצל חמשת השחקנים בעלי מספר הדקות הגבוה ביותר.',
    profileBands: {
      below_typical: ['מפוזרת', 'ריכוז דקות נמוך מהטווח הטיפוסי', 'הדקות מתחלקות בין יותר שחקנים.'],
      typical: ['טיפוסית', 'ריכוז דקות בטווח הטיפוסי', 'חלוקת הדקות דומה למצופה.'],
      above_typical: ['מרוכזת', 'ריכוז דקות גבוה מהטווח הטיפוסי', 'הדקות מרוכזות אצל פחות שחקנים.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה איך מתחלקות דקות המשחק בין שחקני הסגל.'],
      typical: ['רגיל', 'המדד מראה איך מתחלקות דקות המשחק בין שחקני הסגל.'],
      above_typical: ['גבוה', 'המדד מראה איך מתחלקות דקות המשחק בין שחקני הסגל.'],
    },
  },
  depth: {
    title: 'עומק שימוש',
    profileTitle: 'שימוש בסגל',
    iconId: 'players',
    description: 'בודק כמה שחקנים מקבלים שימוש משמעותי לאורך העונה.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס השימוש בסגל.',
    tooltip: 'מבוסס על מספר השחקנים שמגיעים לספי השימוש בדקות האפשריות.',
    profileBands: {
      below_typical: ['מצומצם', 'מספר השחקנים בשימוש משמעותי נמוך מהטווח הטיפוסי', 'פחות שחקנים מעורבים באופן משמעותי מהמצופה.'],
      typical: ['בטווח הרגיל', 'מספר השחקנים בשימוש משמעותי נמצא בטווח הטיפוסי', 'מספר השחקנים המעורבים באופן משמעותי דומה למצופה.'],
      above_typical: ['רחב', 'מספר השחקנים בשימוש משמעותי גבוה מהטווח הטיפוסי', 'יותר שחקנים מעורבים באופן משמעותי מהמצופה.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה כמה שחקנים מקבלים שימוש משמעותי בדקות המשחק.'],
      typical: ['רגיל', 'המדד מראה כמה שחקנים מקבלים שימוש משמעותי בדקות המשחק.'],
      above_typical: ['גבוה', 'המדד מראה כמה שחקנים מקבלים שימוש משמעותי בדקות המשחק.'],
    },
  },
  production: {
    title: 'פיזור שערים',
    iconId: 'goals',
    description: 'בודק עד כמה התפוקה ההתקפית מרוכזת אצל שחקן אחד או מתחלקת בין מספר שחקנים.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס פיזור השערים.',
    tooltip: 'מבוסס על חלקו של השחקן המוביל בתפוקת השערים של הקבוצה.',
    profileBands: {
      below_typical: ['מפוזר', 'ריכוז תפוקה נמוך מהטווח הטיפוסי', 'התפוקה מתחלקת בין יותר שחקנים.'],
      typical: ['טיפוסי', 'ריכוז תפוקה בטווח הטיפוסי', 'פיזור התפוקה דומה למצופה.'],
      above_typical: ['מרוכז', 'ריכוז תפוקה גבוה מהטווח הטיפוסי', 'חלק גדול מהתפוקה מרוכז אצל מעט שחקנים.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה איך מתחלקת תפוקת השערים בין שחקני הקבוצה.'],
      typical: ['רגיל', 'המדד מראה איך מתחלקת תפוקת השערים בין שחקני הקבוצה.'],
      above_typical: ['גבוה', 'המדד מראה איך מתחלקת תפוקת השערים בין שחקני הקבוצה.'],
    },
  },
  rotation: {
    title: 'חלוקת ההרכב הפותח',
    profileTitle: 'רוטציה בהרכב',
    iconId: 'formation',
    description: 'בודק עד כמה הפתיחות בהרכב מתחלקות בין שחקני הסגל.',
    unavailableReason: 'אין עדיין מספיק מידע כדי לקבוע את דפוס הרוטציה בהרכב.',
    tooltip: 'מבוסס על ריכוז הפתיחות אצל השחקנים שמתחילים בהרכב בתדירות הגבוהה ביותר.',
    profileBands: {
      below_typical: ['רוטציה רחבה', 'ריכוז פתיחות נמוך מהטווח הטיפוסי', 'הפתיחות מתחלקות בין יותר שחקנים.'],
      typical: ['טיפוסית', 'ריכוז פתיחות בטווח הטיפוסי', 'חלוקת הפתיחות דומה למצופה.'],
      above_typical: ['הרכב קבוע', 'ריכוז פתיחות גבוה מהטווח הטיפוסי', 'הפתיחות מרוכזות אצל מספר מצומצם של שחקנים.'],
    },
    bands: {
      below_typical: ['נמוך', 'המדד מראה איך מתחלקות הפתיחות בהרכב בין שחקני הקבוצה.'],
      typical: ['רגיל', 'המדד מראה איך מתחלקות הפתיחות בהרכב בין שחקני הקבוצה.'],
      above_typical: ['גבוה', 'המדד מראה איך מתחלקות הפתיחות בהרכב בין שחקני הקבוצה.'],
    },
  },
});
const buildBalanceCard = ({ key, band }) => {
  const definition = BALANCE_KPI_PRESENTATION[key]
  const presentation = definition?.bands?.[clean(band)] || null
  const profilePresentation = definition?.profileBands?.[clean(band)] || null

  return {
    key,
    title: definition?.title || '',
    profileTitle: definition?.profileTitle || definition?.title || '',
    band: clean(band),
    value: presentation?.[0] || 'אין סטטוס שמור',
    meaning: presentation?.[1] || 'לא נשמר סטטוס להשוואה עבור מדד זה.',
    description: definition?.description || '',
    tooltip: definition?.tooltip || '',
    profileValue: profilePresentation?.[0] || 'אין עדיין הערכה',
    profileFinding: profilePresentation?.[1] || 'אין מספיק מידע לקביעת דפוס',
    profileImplication: profilePresentation?.[2] || '',
    availabilityReason: profilePresentation
      ? ''
      : definition?.unavailableReason || 'אין מספיק נתונים זמינים כדי להשוות את המדד לטווח הקבוצות הרלוונטי.',
    iconId: definition?.iconId || 'info',
  }
}

export const buildBalance = ({ seasonDoc }) => {
  if (!seasonDoc || typeof seasonDoc !== 'object') return null

  const balance = seasonDoc.teamBalance && typeof seasonDoc.teamBalance === 'object'
    ? seasonDoc.teamBalance
    : null
  const reliability = balance?.reliability || {}

  return {
    cards: [
      buildBalanceCard({ key: 'minutes', band: balance?.bands?.minutesTop5 }),
      buildBalanceCard({ key: 'depth', band: balance?.bands?.usage50 }),
      buildBalanceCard({ key: 'production', band: balance?.bands?.productionTop1 }),
      buildBalanceCard({ key: 'rotation', band: balance?.bands?.rotationStartsTop5 }),
    ],
    reliability: {
      key: clean(reliability.reliability),
      label: reliabilityLabel(reliability.reliability),
      loadedCoverage: percent(reliability.loadedCoverage),
    },
  }
}

