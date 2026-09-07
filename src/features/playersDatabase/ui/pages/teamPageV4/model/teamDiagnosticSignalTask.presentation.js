const TASK_LABEL_BY_SIGNAL = Object.freeze({
  ATTACK_CONCENTRATION: 'מומלץ לעקוב אחרי הבאנקרים בהתקפה',
  ATTACK_ESTABLISHED: 'אין משימת סקאוט מיידית',
  ATTACK_HIGH_COMPETITION: 'מומלץ לאתר ולעקוב אחרי שחקני ההתקפה',
  ATTACK_DEPTH_REVIEW: 'קבוצה צריכה שחקני התקפה איכותיים',
  ATTACK_POSSIBLE_GAP: 'קבוצה חייבת שחקני התקפה איכותיים',
  ATTACK_QUALITY_REVIEW: 'קבוצה חייבת שחקני התקפה איכותיים',
  ATTACK_CLASSIFICATION_MISSING: 'קבוצה חייבת שחקני התקפה איכותיים',
  DEFENSE_CONCENTRATION: 'מומלץ לעקוב אחרי הבאנקרים בהגנה',
  DEFENSE_ESTABLISHED: 'אין משימת סקאוט מיידית',
  DEFENSE_DEPTH_REVIEW: 'קבוצה צריכה שחקני הגנה איכותיים',
  DEFENSE_POSSIBLE_GAP: 'קבוצה חייבת שחקני הגנה איכותיים',
  DEFENSE_QUALITY_REVIEW: 'קבוצה חייבת שחקני הגנה איכותיים',
  DEFENSE_QUALITY_SEARCH: 'איתור ומעקב של שחקני ההגנה',
  DEFENSE_LOW_QUALITY_OVERLOAD: 'קבוצה חייבת שחקני הגנה איכותיים',
  DEFENSE_CLASSIFICATION_MISSING: 'קבוצה חייבת שחקני הגנה איכותיים',
  NO_CLEAR_FINDING: 'אין משימת סקאוט מיידית',
  REVIEW_REQUIRED: 'מעקב ובחינה עתידית',
})

const SIGNAL_LABEL_BY_ID = Object.freeze({
  ATTACK_CONCENTRATION: 'שחקני התקפה איכותיים מצומצם.',
  ATTACK_ESTABLISHED: 'התקפה מאוזנת בין איכות הביצוע ליעד הכמותי.',
  ATTACK_HIGH_COMPETITION: 'עומס בשחקני התקפה איכותיים.',
  ATTACK_DEPTH_REVIEW: 'מחסור בשחקני התקפה איכותיים.',
  ATTACK_POSSIBLE_GAP: 'מחסור בשחקני התקפה איכותיים.',
  ATTACK_QUALITY_REVIEW: 'שחקני ההתקפה באיכות נמוכה.',
  ATTACK_CLASSIFICATION_MISSING: 'אין שחקני התקפה מסווגים.',
  DEFENSE_CONCENTRATION: 'שחקני הגנה איכותיים מצומצם.',
  DEFENSE_ESTABLISHED: 'הגנה מאוזנת בין איכות הביצוע ליעד הכמותי.',
  DEFENSE_DEPTH_REVIEW: 'מחסור בשחקני הגנה איכותיים.',
  DEFENSE_POSSIBLE_GAP: 'מחסור בשחקני הגנה איכותיים.',
  DEFENSE_QUALITY_REVIEW: 'שחקני ההגנה באיכות נמוכה.',
  DEFENSE_QUALITY_SEARCH: 'עומס בשחקני הגנה איכותיים.',
  DEFENSE_LOW_QUALITY_OVERLOAD: 'עומס בשחקני הגנה באיכות נמוכה.',
  DEFENSE_CLASSIFICATION_MISSING: 'אין שחקני הגנה מסווגים.',
  NO_CLEAR_FINDING: 'אין סימן מקצועי חריג.',
  REVIEW_REQUIRED: 'אירוע למעקב ולבחינה עתידית.',
})

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const getTeamDiagnosticSignalTaskLabel = signalId => (
  TASK_LABEL_BY_SIGNAL[clean(signalId)] || 'אין משימת סקאוט מיידית'
)

export const getTeamDiagnosticSignalLabel = signalId => (
  SIGNAL_LABEL_BY_ID[clean(signalId)] || ''
)
