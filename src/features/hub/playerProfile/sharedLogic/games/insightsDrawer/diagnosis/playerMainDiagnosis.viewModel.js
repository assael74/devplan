// playerProfile/sharedLogic/games/insightsDrawer/diagnosis/playerMainDiagnosis.viewModel.js

import {
  formatNumber,
  formatPercent,
  normalizeJoyColor,
} from '../cards/playerCards.shared.js'

const EMPTY = '—'

const toNum = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const hasValue = (value) => {
  return value !== undefined && value !== null && value !== ''
}

const getRangeLabel = (range = []) => {
  if (!Array.isArray(range) || range.length < 2) return EMPTY

  const min = Number(range[0])
  const max = Number(range[1])

  if (!Number.isFinite(min) || !Number.isFinite(max)) return EMPTY

  return `${min}%–${max}%`
}

const getBrief = (insights, key) => {
  return insights?.briefs?.[key] || insights?.sections?.[key] || null
}

const getPrimaryItem = (brief) => {
  const items = Array.isArray(brief?.items) ? brief.items : []

  return (
    items.find((item) => item?.id === 'action_focus') ||
    items[0] ||
    null
  )
}

const resolveRole = (insights = {}) => {
  const role =
    insights?.targets?.role ||
    insights?.games?.targets?.role ||
    {}

  return {
    id: role?.id || role?.value || '',
    label: role?.label || 'לא הוגדר מעמד',
    icon: role?.idIcon || role?.iconId || 'squad',
    color: role?.color || 'neutral',
    weight: toNum(role?.weight, 0),
    isDefined: Boolean(role?.id || role?.value),
  }
}

const resolveUsage = (insights = {}) => {
  return (
    insights?.games?.usage ||
    insights?.summary?.usage ||
    {}
  )
}

const resolveRoleTarget = (insights = {}) => {
  return (
    insights?.targets?.roleTarget ||
    insights?.games?.targets?.roleTarget ||
    {}
  )
}

const resolveReliability = (insights = {}) => {
  return (
    insights?.reliability ||
    insights?.games?.reliability ||
    {}
  )
}

const resolveMinutesColor = ({
  minutesPct,
  targetRange,
}) => {
  const min = toNum(targetRange?.[0], null)
  const max = toNum(targetRange?.[1], null)
  const value = toNum(minutesPct, null)

  if (!Number.isFinite(value)) return 'neutral'
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 'neutral'

  if (value >= min && value <= max) return 'success'
  if (value < min * 0.7) return 'danger'
  if (value < min) return 'warning'

  return 'primary'
}

const resolveStartsColor = (startsPct) => {
  const value = toNum(startsPct, 0)

  if (value >= 60) return 'success'
  if (value >= 30) return 'warning'
  if (value > 0) return 'neutral'

  return 'neutral'
}

const resolveMainStatus = ({
  usageBrief,
}) => {
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

const buildDiagnosisText = ({
  role,
  status,
  usageBrief,
}) => {
  const usageItem = getPrimaryItem(usageBrief)

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

const buildActionText = ({
  reliability,
}) => {
  if (reliability?.caution) {
    return 'יש לפרש בזהירות: מדגם הדקות עדיין לא מספיק חזק.'
  }

  return 'המשך בדיקה באזור הבא: האם השחקן באמת קיבל הזדמנות מספקת.'
}

const buildMetric = ({
  id,
  label,
  value,
  sub,
  icon,
  color,
  tooltip = null,
}) => {
  return {
    id,
    label,
    value: hasValue(value) ? value : EMPTY,
    sub: sub || '',
    icon: icon || 'info',
    color: normalizeJoyColor(color),
    tooltip,
  }
}

const buildMetrics = ({
  usage,
  roleTarget,
  reliability,
}) => {
  const minutesPct = toNum(usage?.minutesPct, 0)
  const minutesRange = roleTarget?.minutesRange
  const startsPct = toNum(usage?.startsPctFromTeamGames, 0)

  return [
    buildMetric({
      id: 'minutesPct',
      label: 'דקות',
      value: formatPercent(minutesPct),
      sub: `יעד ${getRangeLabel(minutesRange)}`,
      icon: 'time',
      color: resolveMinutesColor({
        minutesPct,
        targetRange: minutesRange,
      }),
    }),
    buildMetric({
      id: 'startsPct',
      label: 'פתיחות',
      value: formatPercent(startsPct),
      sub: `${formatNumber(usage?.starts)} פתיחות מתוך ${formatNumber(
        usage?.teamGamesTotal
      )}`,
      icon: 'lineup',
      color: resolveStartsColor(startsPct),
    }),
    buildMetric({
      id: 'gamesIncluded',
      label: 'שותף',
      value: `${formatNumber(usage?.gamesIncluded)}/${formatNumber(
        usage?.teamGamesTotal
      )}`,
      sub: 'משחקי ליגה',
      icon: 'game',
      color: 'neutral',
    }),
    buildMetric({
      id: 'reliability',
      label: 'מהימנות',
      value: reliability?.label || 'לא ידוע',
      sub: reliability?.caution ? 'יש לפרש בזהירות' : 'מדגם תקין',
      icon: reliability?.caution ? 'info' : 'verified',
      color: reliability?.tone || 'neutral',
    }),
  ]
}

const buildSummaryFacts = ({
  usage,
}) => {
  const minutesPct = toNum(usage?.minutesPct, 0)
  const startsPct = toNum(usage?.startsPctFromTeamGames, 0)

  return [
    {
      id: 'minutesPct',
      label: 'דקות',
      value: formatPercent(minutesPct),
      icon: 'time',
    },
    {
      id: 'startsPct',
      label: 'פתיחות',
      value: formatPercent(startsPct),
      icon: 'lineup',
    },
  ]
}

const buildReliabilitySummary = ({
  reliability,
}) => {
  return {
    id: reliability?.id || '',
    label: reliability?.label || 'לא ידוע',
    tone: normalizeJoyColor(reliability?.tone),
    icon: reliability?.caution ? 'info' : 'verified',
    caution: Boolean(reliability?.caution),
  }
}

export function buildPlayerMainDiagnosisViewModel(insights = {}) {
  const role = resolveRole(insights)
  const usage = resolveUsage(insights)
  const roleTarget = resolveRoleTarget(insights)
  const reliability = resolveReliability(insights)

  const usageBrief = getBrief(insights, 'usage')
  const roleFitBrief = getBrief(insights, 'roleFit')

  const status = resolveMainStatus({
    usageBrief: roleFitBrief || usageBrief,
  })

  const text = buildDiagnosisText({
    role,
    status,
    usageBrief: roleFitBrief || usageBrief,
  })

  const actionText = buildActionText({
    reliability,
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

    diagnosis: {
      id: status.id,
      title: status.title,
      text,
      actionText,
      tone: normalizeJoyColor(status.tone),
      icon: status.icon,
    },

    summaryFacts: buildSummaryFacts({
      usage,
    }),

    reliability: buildReliabilitySummary({
      reliability,
    }),

    metrics: buildMetrics({
      usage,
      roleTarget,
      reliability,
    }),

    debug: {
      roleId: role.id,
      statusId: status.id,
      usageCoreIssue: usageBrief?.meta?.coreIssue || null,
      roleFitCoreIssue: roleFitBrief?.meta?.coreIssue || null,
      reliability: reliability?.id || null,
    },
  }
}
