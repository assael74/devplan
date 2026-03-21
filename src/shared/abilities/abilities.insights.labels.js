// shared/abilities/abilities.insights.labels.js

export const ABILITIES_INSIGHTS_LABELS = {
  thresholds: {
    minDomainCoveragePct: 60,
    minDocumentedPerformanceDomains: 3,
    minEligiblePlayersForTeam: 11,
    developmentDomainId: 'development',
  },

  domainOrder: [
    'physical',
    'technical',
    'gameUnderstanding',
    'mental',
    'cognitive',
    'development',
  ],

  domainLabels: {
    physical: 'פיזי',
    technical: 'טכני',
    gameUnderstanding: 'הבנת משחק',
    mental: 'מנטלי',
    cognitive: 'קוגניטיבי',
    development: 'התפתחות',
  },

  missingReasons: {
    missingDevelopment: 'חסר תיעוד בדומיין התפתחות',
    notEnoughDocumentedDomains: 'אין מספיק דומיינים מקצועיים עם תיעוד מספק',
    notEnoughEligiblePlayers: 'אין מספיק שחקנים עם תיעוד מספק',
  },

  readiness: {
    player: {
      readyTitle: 'התיעוד מספק לתובנות',
      readyText: ({ documentedPerformanceDomains = 0 }) =>
        `יש תיעוד מספק להתפתחות ועוד ${documentedPerformanceDomains} דומיינים מקצועיים.`,

      notReadyTitle: 'אין עדיין מספיק תיעוד לתובנות מלאות',
      missingDevelopmentText: 'חסר תיעוד בדומיין התפתחות',
      missingDomainsText: ({ missingDomains = 0 }) =>
        `חסרים עוד ${missingDomains} דומיינים מקצועיים עם תיעוד מספק`,
    },

    team: {
      readyTitle: 'לקבוצה יש תיעוד מספק לתובנות',
      readyText: ({ eligiblePlayersCount = 0 }) =>
        `${eligiblePlayersCount} שחקנים עומדים בתנאי הסף.`,

      notReadyTitle: 'אין עדיין מספיק תיעוד קבוצתי לתובנות מלאות',
      notReadyText: ({
        eligiblePlayersCount = 0,
        minEligiblePlayersForTeam = 11,
      }) =>
        `כרגע רק ${eligiblePlayersCount} שחקנים עומדים בתנאי הסף. נדרשים לפחות ${minEligiblePlayersForTeam}.`,
    },
  },

  titles: {
    player: {
      strongestDomain: 'הדומיין המוביל',
      weakestDomain: 'הדומיין החלש ביותר',
      balance: 'איזון פרופיל',
      topAbilities: 'יכולות בולטות',
      bottomAbilities: 'יכולות לחיזוק',
      potentialGap: 'מימוש פוטנציאל',
    },

    team: {
      identity: 'זהות הקבוצה',
      mainGap: 'החולשה המרכזית',
      depth: 'עומק תיעוד בסגל',
      topAbilities: 'יכולות קבוצתיות בולטות',
      bottomAbilities: 'יכולות קבוצתיות לחיזוק',
      missingPlayers: 'שחקנים שחוסמים עומק תיעוד',
    },

    coverage: {
      domain: ({ domainLabel = '' }) => `תיעוד ${domainLabel}`,
      teamDomain: ({ domainLabel = '' }) => `כיסוי ${domainLabel}`,
    },
  },

  text: {
    player: {
      strongestDomain: ({ domainLabel = '', avgLabel = '—' }) =>
        `${domainLabel} הוא הדומיין המוביל עם ממוצע ${avgLabel}.`,

      weakestDomain: ({ domainLabel = '', avgLabel = '—' }) =>
        `${domainLabel} הוא הדומיין החלש ביותר עם ממוצע ${avgLabel}.`,

      balance: {
        unknown: 'לא ניתן להעריך איזון פרופיל כרגע.',
        formatted: ({ balanceLabel = '', gapLabel = '—' }) =>
          `הפרופיל ${balanceLabel}. הפער בין הדומיין החזק לחלש הוא ${gapLabel}.`,
      },

      topAbilities: ({ itemsText = '' }) => itemsText,
      bottomAbilities: ({ itemsText = '' }) => itemsText,

      potentialGapHigh: ({ gapLabel = '—' }) =>
        `יש פער פוטנציאל משמעותי של ${gapLabel} בין הרמה הנוכחית לפוטנציאל.`,
      potentialGapMid: ({ gapLabel = '—' }) =>
        `יש עוד מרווח התפתחות של ${gapLabel} מעל הרמה הנוכחית.`,
      potentialGapLow: 'הרמה הנוכחית קרובה מאוד לפוטנציאל המחושב.',
    },

    team: {
      identity: ({ domainLabel = '', avgLabel = '—' }) =>
        `הזהות הבולטת של הקבוצה היא ${domainLabel} עם ממוצע ${avgLabel}.`,

      mainGap: ({ domainLabel = '', avgLabel = '—' }) =>
        `${domainLabel} הוא כרגע הדומיין הקבוצתי החלש ביותר עם ממוצע ${avgLabel}.`,

      depth: ({ eligiblePlayersCount = 0, playersCount = 0, eligiblePct = 0 }) =>
        `${eligiblePlayersCount} מתוך ${playersCount} שחקנים עומדים בתנאי הסף, שהם ${eligiblePct}% מהסגל.`,

      topAbilities: ({ itemsText = '' }) => itemsText,
      bottomAbilities: ({ itemsText = '' }) => itemsText,
      missingPlayers: ({ itemsText = '' }) => itemsText,
    },

    coverage: {
      developmentReady: 'דומיין ההתפתחות מתועד.',
      developmentMissing: 'דומיין ההתפתחות עדיין חסר.',
      playerDomainCoverage: ({ coveragePct = 0, domainLabel = '' }) =>
        `כיסוי של ${coveragePct}% בדומיין ${domainLabel}.`,
      teamDomainCoverage: ({ documentedPct = 0, domainLabel = '' }) =>
        `${documentedPct}% מהשחקנים הזכאים מתועדים בדומיין ${domainLabel}.`,
    },
  },

  balanceLabels: {
    unknown: 'לא ידוע',
    balanced: 'מאוזן',
    moderate: 'עם פערים מתונים',
    unbalanced: 'לא מאוזן',
  },

  colors: {
    readinessReady: 'success',
    readinessMissing: 'warning',

    strengthHigh: 'success',
    strengthMid: 'primary',
    strengthLow: 'warning',
    strengthVeryLow: 'danger',
    neutral: 'neutral',

    balanceGood: 'success',
    balanceMid: 'warning',
    balanceBad: 'danger',

    coverageHigh: 'success',
    coverageMid: 'primary',
    coverageLow: 'warning',
  },

  priorities: {
    readiness: 100,

    strongestDomain: 90,
    weakestDomain: 89,
    balance: 88,
    teamDepth: 88,

    topAbilities: 87,
    bottomAbilities: 86,
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

export function getDomainLabel(domainId, fallback = '') {
  return (
    ABILITIES_INSIGHTS_LABELS?.domainLabels?.[domainId] ||
    fallback ||
    domainId ||
    ''
  )
}

export function getBalanceLabel(gap) {
  const n = Number(gap)

  if (!Number.isFinite(n)) {
    return ABILITIES_INSIGHTS_LABELS.balanceLabels.unknown
  }

  if (n <= 0.6) {
    return ABILITIES_INSIGHTS_LABELS.balanceLabels.balanced
  }

  if (n <= 1.2) {
    return ABILITIES_INSIGHTS_LABELS.balanceLabels.moderate
  }

  return ABILITIES_INSIGHTS_LABELS.balanceLabels.unbalanced
}

export function getScoreColor(score) {
  const n = Number(score)

  if (!Number.isFinite(n)) {
    return ABILITIES_INSIGHTS_LABELS.colors.neutral
  }

  if (n >= 4) {
    return ABILITIES_INSIGHTS_LABELS.colors.strengthHigh
  }

  if (n >= 3) {
    return ABILITIES_INSIGHTS_LABELS.colors.strengthMid
  }

  if (n >= 2) {
    return ABILITIES_INSIGHTS_LABELS.colors.strengthLow
  }

  return ABILITIES_INSIGHTS_LABELS.colors.strengthVeryLow
}

export function getCoverageColor(pct) {
  const n = Number(pct)

  if (!Number.isFinite(n)) {
    return ABILITIES_INSIGHTS_LABELS.colors.coverageLow
  }

  if (n >= 80) {
    return ABILITIES_INSIGHTS_LABELS.colors.coverageHigh
  }

  if (n >= 60) {
    return ABILITIES_INSIGHTS_LABELS.colors.coverageMid
  }

  return ABILITIES_INSIGHTS_LABELS.colors.coverageLow
}
