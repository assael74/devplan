// src/shared/abilities/insights/abilities.insights.labels.js

export const ABILITIES_INSIGHTS_LABELS = {
  thresholds: {
    minEligiblePlayerDomains: 3,
    minEligibleTeamPlayers: 11,
    minAbilityCoveragePct: 65,
    minPotentialCoveragePct: 70,
  },

  readiness: {
    player: {
      readyTitle: 'התיעוד מספק לתובנות',
      notReadyTitle: 'אין עדיין מספיק תיעוד לתובנות מלאות',
    },
    team: {
      readyTitle: 'לקבוצה יש תיעוד מספק לתובנות',
      notReadyTitle: 'אין עדיין מספיק תיעוד קבוצתי לתובנות מלאות',
    },
  },

  titles: {
    player: {
      strongestDomain: 'הדומיין המוביל',
      weakestDomain: 'הדומיין החלש ביותר',
      balance: 'איזון פרופיל',
      potentialGap: 'מימוש פוטנציאל',
      domainReliability: 'אמינות הנתונים',
      windows: 'חלונות הערכה',
    },
    team: {
      identity: 'זהות הקבוצה',
      mainGap: 'החולשה המרכזית',
      depth: 'עומק תיעוד בסגל',
      potentialGap: 'פער פוטנציאל קבוצתי',
      missingPlayers: 'שחקנים שחוסמים עומק תיעוד',
    },
  },

  balanceLabels: {
    unknown: 'לא ידוע',
    balanced: 'מאוזן',
    moderate: 'עם פערים מתונים',
    unbalanced: 'לא מאוזן',
  },

  colors: {
    success: 'success',
    primary: 'primary',
    warning: 'warning',
    danger: 'danger',
    neutral: 'neutral',
  },

  priorities: {
    readiness: 100,
    strongestDomain: 90,
    weakestDomain: 89,
    balance: 88,
    depth: 88,
    potentialGap: 85,
    missingPlayers: 70,
    coverage: 40,
  },
}

export function getAbilitiesInsightLabel(path, fallback = '') {
  if (!path) return fallback

  const parts = String(path).split('.').filter(Boolean)
  let current = ABILITIES_INSIGHTS_LABELS

  for (const part of parts) {
    if (current == null || typeof current !== 'object' || !(part in current)) {
      return fallback
    }
    current = current[part]
  }

  return current ?? fallback
}

export function getBalanceLabel(gap) {
  const n = Number(gap)

  if (!Number.isFinite(n)) return ABILITIES_INSIGHTS_LABELS.balanceLabels.unknown
  if (n <= 0.6) return ABILITIES_INSIGHTS_LABELS.balanceLabels.balanced
  if (n <= 1.2) return ABILITIES_INSIGHTS_LABELS.balanceLabels.moderate
  return ABILITIES_INSIGHTS_LABELS.balanceLabels.unbalanced
}

export function getScoreColor(score) {
  const n = Number(score)

  if (!Number.isFinite(n)) return ABILITIES_INSIGHTS_LABELS.colors.neutral
  if (n >= 4) return ABILITIES_INSIGHTS_LABELS.colors.success
  if (n >= 3) return ABILITIES_INSIGHTS_LABELS.colors.primary
  if (n >= 2) return ABILITIES_INSIGHTS_LABELS.colors.warning
  return ABILITIES_INSIGHTS_LABELS.colors.danger
}
