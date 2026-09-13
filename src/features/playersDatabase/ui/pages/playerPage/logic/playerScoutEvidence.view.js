import { METRIC_LABELS, METRIC_UNITS, REASON_LABELS, REASON_SUB_LABELS } from './playerScoutView.constants.js'
import { resolveProfileLabel } from './playerScoutProfileIdentity.js'
import { clean, formatMetricValue, toNumber } from './playerScoutView.utils.js'

export const formatProfileDepth = value => {
  const number = toNumber(value)

  if (number === null) return ''

  return `עומק פרופיל ${Math.round(number)}%`
}

const formatRuleDepth = value => {
  const number = toNumber(value)

  if (number === null) return ''

  return `${number >= 0 ? '+' : ''}${Math.round(number)}% מעל הרף`
}

const formatStrengthThreshold = evidence => {
  if (!evidence) return '-'

  const metric = clean(evidence.metric)
  const threshold = evidence.threshold

  if (typeof threshold === 'number') {
    return formatMetricValue(metric, threshold)
  }

  if (threshold && typeof threshold === 'object') {
    const min = threshold.min !== undefined ? formatMetricValue(metric, threshold.min) : ''
    const max = threshold.max !== undefined ? formatMetricValue(metric, threshold.max) : ''

    if (min && max) return `${min}–${max}`
    if (min) return `מ־${min}`
    if (max) return `עד ${max}`
  }

  return '-'
}


export const buildProfileStrengthDetails = primaryProfile => {
  if (!primaryProfile) {
    return {
      measurableRuleCount: 0,
      depthPct: null,
      baseDepthPct: null,
      contextAdjustmentPct: null,
      method: '',
      rules: [],
    }
  }

  const strength = primaryProfile.profileStrength || primaryProfile.profileDepth || {}
  const depthRules = Array.isArray(primaryProfile?.profileDepth?.rules)
    ? primaryProfile.profileDepth.rules
    : []
  const evidence = Array.isArray(primaryProfile.matchEvidence) ? primaryProfile.matchEvidence : []
  const rules = depthRules.map((rule, index) => {
    const match = evidence.find(item => (
      clean(item?.reason) === clean(rule?.reason) ||
      clean(item?.metric) === clean(rule?.metric)
    )) || null
    const metric = clean(rule?.metric || match?.metric)

    return {
      id: clean(rule?.reason) || `${metric}_${index}`,
      label: METRIC_LABELS[metric] || metric || 'תנאי מקצועי',
      actual: match ? formatMetricValue(metric, match.actual) : '-',
      threshold: match ? formatStrengthThreshold(match) : '-',
      depthPct: toNumber(rule?.depthPct),
    }
  })

  return {
    measurableRuleCount: toNumber(strength.measurableRuleCount) || rules.length,
    depthPct: toNumber(strength.depthPct),
    baseDepthPct: toNumber(primaryProfile?.profileDepth?.baseDepthPct),
    contextAdjustmentPct: toNumber(primaryProfile?.profileDepth?.contextAdjustmentPct),
    method: clean(primaryProfile?.profileDepth?.method),
    rules,
  }
}

const formatRuleTarget = rule => {
  if (!rule) return ''

  const metric = clean(rule.metric)

  if (rule.op === 'gte') return `לפחות ${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'gt') return `מעל ${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'lte') return `עד ${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'lt') return `פחות מ־${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'eq') return `שווה ל־${formatMetricValue(metric, rule.value)}`
  if (rule.op === 'between') {
    return `בין ${formatMetricValue(metric, rule.min)} ל־${formatMetricValue(metric, rule.max)}`
  }
  if (rule.op === 'truthy') return 'נדרש כן'
  if (rule.op === 'falsy') return 'נדרש לא'
  if (rule.op === 'in') {
    return `אחד מתוך ${(rule.values || []).map(value => formatMetricValue(metric, value)).join(', ')}`
  }

  return ''
}

const buildDepthLabelForRule = ({ rule, value }) => {
  const current = toNumber(value)

  if (current === null) return ''

  if ((rule.op === 'gte' || rule.op === 'gt') && toNumber(rule.value)) {
    const threshold = toNumber(rule.value)
    return `${Math.round((current / threshold) * 100)}% מהרף`
  }

  if ((rule.op === 'lte' || rule.op === 'lt') && toNumber(rule.value)) {
    const threshold = toNumber(rule.value)
    return current <= threshold
      ? 'בתוך הרף'
      : `${formatMetricValue(rule.metric, current - threshold)} מעל הרף`
  }

  if (rule.op === 'between') {
    const min = toNumber(rule.min)
    const max = toNumber(rule.max)

    if (min !== null && max !== null && current >= min && current <= max) {
      return 'בתוך הטווח'
    }
  }

  if (rule.op === 'truthy' || rule.op === 'falsy' || rule.op === 'eq') {
    return 'תנאי מתקיים'
  }

  return ''
}

const getMetricSupplement = ({ metric, metrics }) => {
  const supplements = {
    goals: [
      ['goalsPerGameDuration', 'קצב למשחק'],
      ['goalsPer90', 'קצב ל־90'],
      ['goalsShareOfTeam', 'חלק משערי הקבוצה'],
    ],
    minutes: [
      ['minutesPct', 'אחוז דקות'],
      ['minutesPerGame', 'דקות למשחק'],
    ],
    minutesPct: [
      ['minutes', 'דקות'],
      ['minutesPerGame', 'דקות למשחק'],
    ],
    starts: [
      ['startsPct', 'אחוז פתיחות'],
    ],
    startsPct: [
      ['starts', 'פתיחות'],
    ],
    yellowCards: [
      ['yellowCardsPer90', 'צהובים ל־90'],
    ],
    subIn: [
      ['subInPct', 'אחוז כניסות כמחליף'],
    ],
    subOut: [
      ['subOutPct', 'אחוז יציאות בחילוף'],
    ],
  }
  const match = (supplements[metric] || []).find(([supplementMetric]) => (
    metrics?.[supplementMetric] !== null &&
    metrics?.[supplementMetric] !== undefined
  ))

  if (!match) return ''

  const [supplementMetric, label] = match

  return `${label}: ${formatMetricValue(supplementMetric, metrics[supplementMetric])}`
}

const buildEvidenceRule = evidence => {
  const threshold = evidence?.threshold

  if (evidence?.op === 'between' && threshold && typeof threshold === 'object') {
    return {
      metric: evidence.metric,
      reason: evidence.reason,
      op: evidence.op,
      min: threshold.min,
      max: threshold.max,
    }
  }

  if (evidence?.op === 'in') {
    return {
      metric: evidence.metric,
      reason: evidence.reason,
      op: evidence.op,
      values: Array.isArray(threshold) ? threshold : [],
    }
  }

  return {
    metric: evidence?.metric,
    reason: evidence?.reason,
    op: evidence?.op,
    value: threshold,
  }
}

const mergeProfileEvidence = ({ evidence, depthRule, metrics }) => {
  const rule = buildEvidenceRule(evidence)
  const metric = clean(evidence?.metric)
  const value = evidence?.actual
  const depthLabel = depthRule?.depthPct !== undefined
    ? formatRuleDepth(depthRule.depthPct)
    : buildDepthLabelForRule({ rule, value })

  return {
    id: `${metric}_${clean(evidence?.reason || metric)}`,
    metric,
    title: REASON_LABELS[evidence?.reason] || METRIC_LABELS[metric] || evidence?.reason || metric,
    subtitle: REASON_SUB_LABELS[evidence?.reason] || '',
    value: formatMetricValue(metric, value),
    metricLabel: METRIC_LABELS[metric] || metric,
    unit: METRIC_UNITS[metric] || '',
    ruleLabel: formatRuleTarget(rule),
    depthLabel,
    supplement: getMetricSupplement({ metric, metrics }),
  }
}

export const buildMainReasons = profile => {
  const metrics = profile?.metrics || {}
  const depthRules = Array.isArray(profile?.profileDepth?.rules)
    ? profile.profileDepth.rules
    : []
  const matchEvidence = Array.isArray(profile?.matchEvidence)
    ? profile.matchEvidence.filter(item => item?.matched)
    : []
  const sourceRules = matchEvidence.map(evidence => mergeProfileEvidence({
    evidence,
    depthRule: depthRules.find(item => item.metric === evidence.metric),
    metrics,
  }))

  return sourceRules.slice(0, 4).map((rule, index) => ({
    ...rule,
    id: `${rule.id}_${index}`,
    tone: index === 0 ? 'ok' : 'info',
  }))
}

const buildEvidenceCards = profile => {
  const metrics = profile?.metrics || {}
  const depthRules = Array.isArray(profile?.profileDepth?.rules)
    ? profile.profileDepth.rules
    : []
  const matchEvidence = Array.isArray(profile?.matchEvidence)
    ? profile.matchEvidence.filter(item => item?.matched)
    : []
  const sourceRules = matchEvidence.map(evidence => mergeProfileEvidence({
    evidence,
    depthRule: depthRules.find(item => item.metric === evidence.metric),
    metrics,
  }))

  return sourceRules.slice(0, 4).map((rule, index) => ({
    id: `${rule.id}_evidence_${index}`,
    title: rule.title,
    metricLabel: rule.metricLabel,
    value: rule.value,
    unit: rule.unit,
    rule: rule.ruleLabel,
    delta: rule.depthLabel,
    supplement: rule.supplement,
    subtitle: rule.subtitle,
  }))
}

export const buildWhyView = primaryProfile => {
  if (!primaryProfile) {
    return {
      profileLabel: '',
      profileDepthLabel: '',
      matchedCount: 0,
      requiredCount: 0,
      evidence: [],
    }
  }

  const matchEvidence = Array.isArray(primaryProfile?.matchEvidence)
    ? primaryProfile.matchEvidence
    : []
  const matchedEvidence = matchEvidence.filter(item => item?.matched)
  const depthPct = toNumber(primaryProfile?.profileDepth?.depthPct)

  return {
    profileLabel: resolveProfileLabel(primaryProfile),
    profileDepthLabel: depthPct === null ? '' : formatProfileDepth(depthPct),
    matchedCount: matchedEvidence.length,
    requiredCount: matchEvidence.length,
    evidence: buildEvidenceCards(primaryProfile),
  }
}

export const buildNearWhyView = nearProfile => {
  if (!nearProfile) {
    return {
      profileLabel: '',
      profileDepthLabel: '',
      matchedCount: 0,
      requiredCount: 0,
      evidence: [],
      mode: 'near',
    }
  }

  const ruleDistances = Array.isArray(nearProfile.ruleDistances)
    ? nearProfile.ruleDistances
    : []
  const distancePct = toNumber(nearProfile.distancePct)
  const evidence = ruleDistances.slice(0, 4).map((rule, index) => ({
    id: `${clean(rule.metric)}_${clean(rule.reason)}_near_${index}`,
    title: REASON_LABELS[rule.reason] || METRIC_LABELS[rule.metric] || 'תנאי מקצועי',
    metricLabel: METRIC_LABELS[rule.metric] || clean(rule.metric),
    value: formatMetricValue(rule.metric, rule.value),
    unit: METRIC_UNITS[rule.metric] || '',
    rule: formatRuleTarget(rule),
    delta: rule.matched ? 'תנאי מתקיים' : distancePct === null ? '' : `חסרים ${Math.round(distancePct)}%`,
    supplement: '',
  }))

  return {
    profileLabel: clean(nearProfile.profileLabel || nearProfile.label),
    profileDepthLabel: distancePct === null ? '' : `חסרים ${Math.round(distancePct)}%`,
    matchedCount: ruleDistances.filter(rule => rule.matched).length,
    requiredCount: ruleDistances.length,
    evidence,
    mode: 'near',
  }
}
