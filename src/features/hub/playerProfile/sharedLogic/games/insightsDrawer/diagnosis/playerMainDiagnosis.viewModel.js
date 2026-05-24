// playerProfile/sharedLogic/games/insightsDrawer/diagnosis/playerMainDiagnosis.viewModel.js

import {
  getBrief,
  getPrimaryItem,
  resolveInsightModel,
  resolveInsightProfile,
  resolvePerformance,
  resolveReliability,
  resolveRole,
  resolveRoleTarget,
  resolveUsage,
} from './playerMainDiagnosis.resolvers.js'

import {
  buildMetrics,
  buildReliabilitySummary,
  buildSummaryFacts,
  formatNumber,
  formatSigned,
  normalizeJoyColor,
} from './playerMainDiagnosis.metrics.js'

const resolveUsageStatus = ({ usageBrief }) => {
  const usageIssue = usageBrief?.meta?.coreIssue || ''

  const isUnder =
    usageIssue === 'under_usage' ||
    usageIssue === 'strong_under_role' ||
    usageIssue === 'under_role'

  const isOver =
    usageIssue === 'over_usage' ||
    usageIssue === 'above_role'

  const isFit =
    usageIssue === 'role_fit' ||
    usageIssue === 'trusted_role'

  if (isUnder) {
    return {
      id: 'under_role',
      title: 'פער מול המעמד',
      tone: 'warning',
      icon: 'warning',
    }
  }

  if (isOver) {
    return {
      id: 'above_role',
      title: 'מעל המעמד',
      tone: 'primary',
      icon: 'trend',
    }
  }

  if (isFit) {
    return {
      id: 'role_fit',
      title: 'תואם מעמד',
      tone: 'success',
      icon: 'verified',
    }
  }

  return {
    id: 'watch',
    title: 'דורש המשך מעקב',
    tone: 'neutral',
    icon: 'info',
  }
}

const resolveScoringStatus = ({ performance }) => {
  const rating = Number(performance?.rating)
  const impact = Number(performance?.impact)

  if (Number.isFinite(rating) && Number.isFinite(impact)) {
    if (rating >= 6.15 && impact > 0) {
      return {
        id: 'positive_value',
        title: 'מספק ערך',
        tone: 'success',
        icon: 'verified',
      }
    }

    if (rating < 5.9 && impact < 0) {
      return {
        id: 'negative_value',
        title: 'פוגע בערך',
        tone: 'danger',
        icon: 'warning',
      }
    }

    if (rating >= 6 && impact <= 0) {
      return {
        id: 'efficient_low_volume',
        title: 'יעיל אבל השפעה מוגבלת',
        tone: 'primary',
        icon: 'score',
      }
    }

    if (rating < 6 && impact >= 0) {
      return {
        id: 'volume_without_efficiency',
        title: 'השפעה קיימת, יעילות גבולית',
        tone: 'warning',
        icon: 'trend',
      }
    }
  }

  return null
}

const resolveMainStatus = ({ usageBrief, performance, insightProfile }) => {
  if (insightProfile?.id) {
    return {
      id: insightProfile.id,
      title: insightProfile.label,
      tone: insightProfile.tone,
      icon: insightProfile.icon,
      profile: insightProfile,
    }
  }

  return (
    resolveScoringStatus({ performance }) ||
    resolveUsageStatus({ usageBrief })
  )
}

const buildDiagnosisText = ({ role, status, usageBrief, performance,}) => {
  const usageItem = getPrimaryItem(usageBrief)
  const rating = Number(performance?.rating)
  const impact = Number(performance?.impact)

  if (status?.profile?.description) {
    return status.profile.description
  }

  if (status.id === 'positive_value') {
    return `מדד היעילות עומד על ${formatNumber(rating, 2)} ומדד ההשפעה המצטבר הוא ${formatSigned(impact, 2)}. השחקן מספק ערך חיובי ביחס לציפייה.`
  }

  if (status.id === 'negative_value') {
    return `מדד היעילות עומד על ${formatNumber(rating, 2)} ומדד ההשפעה המצטבר הוא ${formatSigned(impact, 2)}. נדרש לבדוק את ההתאמה בין הדקות, התפקיד והתרומה בפועל.`
  }

  if (status.id === 'efficient_low_volume') {
    return 'מדד היעילות חיובי, אבל מדד ההשפעה המצטבר עדיין לא מייצר ערך משמעותי. הכיוון הוא טוב, צריך לבדוק נפח דקות.'
  }

  if (status.id === 'volume_without_efficiency') {
    return 'השחקן צובר השפעה, אבל מדד היעילות גבולי. צריך לבדוק האם הנפח מוצדק ביחס לתפוקה.'
  }

  if (status.id === 'role_fit') {
    return `נפח השימוש תואם את מעמד "${role.label}" שהוגדר לשחקן.`
  }

  if (status.id === 'under_role') {
    return `נפח השימוש נמוך ביחס למעמד "${role.label}" שהוגדר לשחקן.`
  }

  if (status.id === 'above_role') {
    return `נפח השימוש גבוה מהמעמד "${role.label}" שהוגדר לשחקן.`
  }

  return (
    usageItem?.text ||
    'אין עדיין אבחנה מספיק חזקה לגבי התאמת השימוש למעמד השחקן.'
  )
}

const buildActionText = ({ reliability, performance, insightProfile }) => {
  if (reliability?.caution) {
    return 'יש לפרש בזהירות: מדגם הדקות עדיין לא מספיק חזק.'
  }

  if (insightProfile?.coachText) {
    return insightProfile.coachText
  }

  if (Number(performance?.rating) < 6) {
    return 'המשך בדיקה: לפרק את הדלתאות ולזהות מה מוריד את מדד היעילות.'
  }

  if (Number(performance?.impact) < 0) {
    return 'המשך בדיקה: לבדוק באילו משחקים נוצר הנזק המצטבר.'
  }

  return 'המשך בדיקה: האם השחקן מקבל מספיק דקות כדי להפוך יעילות להשפעה מצטברת.'
}

export function buildPlayerMainDiagnosisViewModel(insights = {}) {
  const role = resolveRole(insights)
  const usage = resolveUsage(insights)
  const roleTarget = resolveRoleTarget(insights)
  const reliability = resolveReliability(insights)
  const performance = resolvePerformance(insights)

  const insightModel = resolveInsightModel(insights)
  const insightProfile = resolveInsightProfile(insights)

  const usageBrief = getBrief(insights, 'usage')
  const roleFitBrief = getBrief(insights, 'roleFit')

  const status = resolveMainStatus({
    usageBrief: roleFitBrief || usageBrief,
    performance,
    insightProfile,
  })

  const text = buildDiagnosisText({
    role,
    status,
    usageBrief: roleFitBrief || usageBrief,
    performance,
  })

  const actionText = buildActionText({
    reliability,
    performance,
    insightProfile,
  })

  return {
    id: 'mainDiagnosis',

    role: {
      id: role.id,
      label: role.label,
      icon: role.icon,
      color: role.color,
      isDefined: role.isDefined,
    },

    insightModel,
    insightProfile,

    diagnosis: {
      id: status.id,
      title: status.title,
      text,
      actionText,
      tone: normalizeJoyColor(status.tone),
      icon: status.icon,
    },

    performance,

    summaryFacts: buildSummaryFacts({
      usage,
      performance,
    }),

    reliability: buildReliabilitySummary({
      reliability,
    }),

    metrics: buildMetrics({
      usage,
      roleTarget,
      reliability,
      performance,
    }),

    debug: {
      roleId: role.id,
      statusId: status.id,
      insightId: insightModel?.insightId || null,
      insightLabel: insightModel?.insightLabel || null,
      usageCoreIssue: usageBrief?.meta?.coreIssue || null,
      roleFitCoreIssue: roleFitBrief?.meta?.coreIssue || null,
      reliability: reliability?.id || null,
      rating: performance?.rating ?? null,
      impact: performance?.impact ?? null,
    },
  }
}
