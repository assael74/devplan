const TEAM_LINE_INTEREST_PRESENTATION = Object.freeze({
  ATTACK_CONCENTRATION: Object.freeze({
    label: 'התקפה טובה עם באנקרים',
    explanation: 'ביצוע התקפי גבוה עם מעט שחקני התקפה',
  }),
  ATTACK_HIGH_COMPETITION: Object.freeze({
    label: 'עומס בחלק ההתקפי',
    explanation: 'ביצוע התקפי גבוה עם הרבה שחקני התקפה',
  }),
  ATTACK_POSSIBLE_GAP: Object.freeze({
    label: 'מחסור בשחקני התקפה',
    explanation: 'ביצוע התקפי נמוך עם מעט שחקני התקפה',
  }),
  DEFENSE_CONCENTRATION: Object.freeze({
    label: 'הגנה טובה עם באנקרים',
    explanation: 'ביצוע הגנתי גבוה עם מעט שחקני הגנה',
  }),
  DEFENSE_POSSIBLE_GAP: Object.freeze({
    label: 'מחסור בשחקני הגנה',
    explanation: 'ביצוע הגנתי נמוך עם מעט שחקני הגנה',
  }),
})

const TEAM_SQUAD_INTEREST_PRESENTATION = Object.freeze({
  LOW_CLASSIFICATION_COVERAGE: Object.freeze({
    positive_or_above: Object.freeze({
      label: 'מעט באנקרים בסגל',
      explanation: 'ביצועים טובים למרות מעט שחקנים עם מעמד סטטיסטי ברור',
    }),
    low: Object.freeze({
      label: 'בסיס סגל מעורער',
      explanation: 'מעט שחקנים מבססים מעמד ברור לצד ביצועים נמוכים',
    }),
  }),
  HIGH_CLASSIFICATION_COVERAGE: Object.freeze({
    positive_or_above: Object.freeze({
      label: 'סגל רחב ואיכותי',
      explanation: 'הרבה שחקנים משמעותיים לצד ביצועים טובים בשני חלקי המשחק',
    }),
    low: Object.freeze({
      label: 'הרבה שחקנים ללא איכות',
      explanation: 'הרבה שחקנים מקבלים תפקיד משמעותי, אך הביצועים נשארים נמוכים',
    }),
  }),
})

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const getTeamLineInterestPresentation = finding => (
  TEAM_LINE_INTEREST_PRESENTATION[clean(finding)] || null
)

export const getTeamSquadInterestPresentation = ({
  reason,
  offensePerformanceBand,
  defensePerformanceBand,
} = {}) => {
  const performanceBand = clean(offensePerformanceBand)
  if (!performanceBand || performanceBand !== clean(defensePerformanceBand)) return null

  return TEAM_SQUAD_INTEREST_PRESENTATION[clean(reason)]?.[performanceBand] || null
}
