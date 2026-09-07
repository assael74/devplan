const TEAM_LINE_INTEREST_PRESENTATION = Object.freeze({
  ATTACK_CONCENTRATION: Object.freeze({
    label: 'שחקני התקפה איכותיים מצומצם',
    explanation: 'ביצוע התקפי חיובי ומעלה עם מעט שחקני התקפה איכותיים',
  }),
  ATTACK_HIGH_COMPETITION: Object.freeze({
    label: 'עומס בשחקני התקפה איכותיים',
    explanation: 'ביצוע התקפי חיובי ומעלה עם הרבה שחקני התקפה איכותיים',
  }),
  ATTACK_POSSIBLE_GAP: Object.freeze({
    label: 'מחסור בשחקני התקפה איכותיים',
    explanation: 'ביצוע התקפי נמוך עם מעט שחקני התקפה איכותיים',
  }),
  ATTACK_CLASSIFICATION_MISSING: Object.freeze({
    label: 'אין שחקני התקפה בסגל',
    explanation: 'נדרש סיווג של שחקני התקפה לפני שאפשר להסיק על עומק או באנקרים בחוליה.',
  }),
  DEFENSE_CONCENTRATION: Object.freeze({
    label: 'שחקני הגנה איכותיים מצומצם',
    explanation: 'מומלץ לעקוב אחרי הבאנקרים בהגנה',
  }),
  DEFENSE_DEPTH_REVIEW: Object.freeze({
    label: 'מחסור בשחקני הגנה איכותיים',
    explanation: 'קבוצה שצריכה שחקני הגנה איכותיים',
  }),
  DEFENSE_POSSIBLE_GAP: Object.freeze({
    label: 'מחסור בשחקני הגנה איכותיים',
    explanation: 'קבוצה שחייבת שחקני הגנה איכותיים',
  }),
  DEFENSE_QUALITY_REVIEW: Object.freeze({
    label: 'שחקני ההגנה באיכות נמוכה',
    explanation: 'קבוצה שחייבת שחקני הגנה איכותיים',
  }),
  DEFENSE_QUALITY_SEARCH: Object.freeze({
    label: 'עומס בשחקני הגנה איכותיים',
    explanation: 'מומלץ לאתר ולעקוב אחרי שחקני ההגנה',
  }),
  DEFENSE_LOW_QUALITY_OVERLOAD: Object.freeze({
    label: 'עומס בשחקני הגנה באיכות נמוכה',
    explanation: 'קבוצה שחייבת שחקני הגנה איכותיים',
  }),
  DEFENSE_CLASSIFICATION_MISSING: Object.freeze({
    label: 'אין שחקנים מסווגים להגנה',
    explanation: 'קבוצה שחייבת שחקני הגנה איכותיים',
  }),
})

const TEAM_SQUAD_INTEREST_PRESENTATION = Object.freeze({
  LOW_CLASSIFICATION_COVERAGE: Object.freeze({
    two_positive: Object.freeze({
      label: 'מעט באנקרים בסגל',
      explanation: 'ביצועים טובים למרות מעט שחקנים עם מעמד סטטיסטי ברור',
    }),
    positive_and_low: Object.freeze({
      label: 'מעט באנקרים בסגל',
      explanation: 'ביצועים מעורבים לצד מעט שחקנים עם מעמד סטטיסטי ברור',
    }),
    two_low: Object.freeze({
      label: 'בסיס סגל מעורער',
      explanation: 'מעט שחקנים מבססים מעמד ברור לצד ביצועים נמוכים',
    }),
  }),
  HIGH_CLASSIFICATION_COVERAGE: Object.freeze({
    two_positive: Object.freeze({
      label: 'סגל רחב ואיכותי',
      explanation: 'הרבה שחקנים משמעותיים לצד ביצועים טובים בשני חלקי המשחק',
    }),
    positive_and_low: Object.freeze({
      label: 'סגל רחב לצד ביצועים מעורבים',
      explanation: 'הרבה שחקנים משמעותיים לצד ביצוע חיובי וביצוע נמוך',
    }),
    two_low: Object.freeze({
      label: 'הרבה שחקנים ללא איכות',
      explanation: 'הרבה שחקנים מקבלים תפקיד משמעותי, אך הביצועים נשארים נמוכים',
    }),
  }),
})

const TEAM_SQUAD_ACTION_PRESENTATION = Object.freeze({
  BUILD_QUALITY_DEPTH: Object.freeze({
    label: 'הקבוצה צריכה עומק איכותי',
  }),
  STRENGTHEN_WEAK_SIDE_QUALITY: Object.freeze({
    label: 'הקבוצה צריכה איכות בצד החלש',
  }),
  STRENGTHEN_BOTH_SIDES_QUALITY: Object.freeze({
    label: 'הקבוצה חייבת איכות בשני צידי המגרש',
  }),
  IDENTIFY_KEY_QUALITY_PLAYERS: Object.freeze({
    label: 'איתור ומעקב אחר שחקנים איכותיים מובילים',
  }),
  IDENTIFY_QUALITY_PLAYERS_ON_STRONG_SIDE: Object.freeze({
    label: 'איתור ומעקב אחר שחקנים איכותיים בצד החיובי',
  }),
  MONITOR_TRANSFER_OPPORTUNITY: Object.freeze({
    label: 'איתור ומעקב אחר שחקנים איכותיים שעשויים להיות זמינים עקב תחרות גבוהה',
  }),
})

const TEAM_LINE_ACTION_PRESENTATION = Object.freeze({
  BUILD_OFFENSIVE_DEPTH: Object.freeze({ label: 'הקבוצה צריכה עומק איכותי בהתקפה' }),
  STRENGTHEN_OFFENSIVE_QUALITY: Object.freeze({ label: 'הקבוצה חייבת איכות בהתקפה' }),
  IDENTIFY_OFFENSIVE_CORE: Object.freeze({ label: 'איתור ומעקב אחר שחקני ההתקפה המובילים' }),
  MONITOR_OFFENSIVE_TRANSFER_OPPORTUNITY: Object.freeze({
    label: 'איתור ומעקב אחר שחקני התקפה איכותיים שעשויים להיות זמינים עקב תחרות גבוהה',
  }),
  BUILD_DEFENSIVE_DEPTH: Object.freeze({ label: 'הקבוצה צריכה עומק איכותי בהגנה' }),
  STRENGTHEN_DEFENSIVE_QUALITY: Object.freeze({ label: 'הקבוצה חייבת איכות בהגנה' }),
  IDENTIFY_DEFENSIVE_CORE: Object.freeze({ label: 'איתור ומעקב אחר שחקני ההגנה המובילים' }),
  MONITOR_DEFENSIVE_TRANSFER_OPPORTUNITY: Object.freeze({
    label: 'איתור ומעקב אחר שחקני הגנה איכותיים שעשויים להיות זמינים עקב תחרות גבוהה',
  }),
})

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const getTeamLineInterestPresentation = finding => (
  TEAM_LINE_INTEREST_PRESENTATION[clean(finding)] || null
)

export const getTeamSquadInterestPresentation = ({
  reason,
  performanceState,
} = {}) => {
  return TEAM_SQUAD_INTEREST_PRESENTATION[clean(reason)]?.[clean(performanceState)] || null
}

const presentSquadAction = action => {
  const source = action && typeof action === 'object' ? action : null
  const id = clean(source?.id)
  if (!id) return null

  return {
    id,
    targetSides: Array.isArray(source?.targetSides) ? source.targetSides : [],
    label: TEAM_SQUAD_ACTION_PRESENTATION[id]?.label || '',
  }
}

export const getTeamSquadActionsPresentation = actions => {
  const source = actions && typeof actions === 'object' ? actions : {}

  return {
    teamNeed: presentSquadAction(source.teamNeed),
    marketOpportunity: presentSquadAction(source.marketOpportunity),
  }
}

const presentLineAction = action => {
  const source = action && typeof action === 'object' ? action : null
  const id = clean(source?.id)
  if (!id) return null

  return {
    id,
    targetSides: Array.isArray(source?.targetSides) ? source.targetSides : [],
    label: TEAM_LINE_ACTION_PRESENTATION[id]?.label || '',
  }
}

export const getTeamLineActionsPresentation = actions => {
  const source = actions && typeof actions === 'object' ? actions : {}

  return {
    teamNeed: presentLineAction(source.teamNeed),
    marketOpportunity: presentLineAction(source.marketOpportunity),
  }
}
