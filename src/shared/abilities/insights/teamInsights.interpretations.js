import { TEAM_INSIGHTS_RULES } from './teamInsights.rules.js'
import { TEAM_INSIGHT_STATUS_META, TEAM_INSIGHTS_LABELS } from './teamInsights.labels.js'

function pickBand(value, bands = []) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'noData'

  for (const band of bands) {
    if (n >= Number(band?.min)) return band.id
  }

  return 'noData'
}

function buildInterpretationResult(metricKey, statusId) {
  const status = TEAM_INSIGHT_STATUS_META?.[statusId] || TEAM_INSIGHT_STATUS_META.noData
  const labels = TEAM_INSIGHTS_LABELS?.[metricKey] || {}
  const interpretationText = labels?.interpretations?.[statusId] || ''

  return {
    id: status.id,
    label: status.label,
    text: interpretationText,
    tone: status.id,
    color: status.color,
    idIcon: status.idIcon,
  }
}

export function resolveTeamLevelInterpretation(metric = {}, rules = TEAM_INSIGHTS_RULES) {
  if (!Number.isFinite(metric?.avg) || Number(metric?.usedCount || 0) < Number(rules?.minUsedCountForLevelInsight || 0)) {
    return buildInterpretationResult('level', 'noData')
  }

  const statusId = pickBand(metric.avg, rules?.level?.bands || [])
  return buildInterpretationResult('level', statusId)
}

export function resolveTeamPotentialInterpretation(metric = {}, rules = TEAM_INSIGHTS_RULES) {
  if (!Number.isFinite(metric?.avg) || Number(metric?.usedCount || 0) < Number(rules?.minUsedCountForPotentialInsight || 0)) {
    return buildInterpretationResult('potential', 'noData')
  }

  const statusId = pickBand(metric.avg, rules?.potential?.bands || [])
  return buildInterpretationResult('potential', statusId)
}

export function resolvePotentialGapInterpretation(metric = {}, rules = TEAM_INSIGHTS_RULES) {
  if (!Number.isFinite(metric?.value) || Number(metric?.usedCount || 0) < Number(rules?.minUsedCountForPotentialInsight || 0)) {
    return buildInterpretationResult('potentialGap', 'noData')
  }

  const statusId = pickBand(metric.value, rules?.potentialGap?.bands || [])
  return buildInterpretationResult('potentialGap', statusId)
}

function resolveTopContributorsStatus(list = [], rulesSection = {}) {
  if (!Array.isArray(list) || list.length < 3) return 'noData'

  const top5 = list.slice(0, 5)
  const totalTop5 = top5.reduce((sum, item) => sum + Number(item?.contribution || 0), 0)
  const top1 = Number(top5?.[0]?.contribution || 0)
  const sharePct = totalTop5 > 0 ? Math.round((top1 / totalTop5) * 100) : 0

  if (sharePct >= Number(rulesSection?.dominantSharePct || 45)) return 'critical'
  if (sharePct >= Number(rulesSection?.balancedSharePct || 28)) return 'weak'
  if (sharePct > 0) return 'stable'
  return 'noData'
}

export function resolveTopAbilityContributorsInterpretation(list = [], rules = TEAM_INSIGHTS_RULES) {
  const statusId = resolveTopContributorsStatus(list, rules?.topAbilityContributors || {})
  return buildInterpretationResult('topAbilityContributors', statusId)
}

export function resolveTopPotentialContributorsInterpretation(list = [], rules = TEAM_INSIGHTS_RULES) {
  const statusId = resolveTopContributorsStatus(list, rules?.topPotentialContributors || {})
  return buildInterpretationResult('topPotentialContributors', statusId)
}

export function resolveMatrixInterpretation(matrix = {}, rules = TEAM_INSIGHTS_RULES) {
  const eligible = Number(matrix?.eligiblePlayersCount || 0)

  if (eligible < Number(rules?.minPlayersForMatrix || 0)) {
    return buildInterpretationResult('matrix', 'noData')
  }

  const counts = matrix?.counts || {}
  const highHigh = Number(counts?.highAbilityHighPotential || 0)
  const highLow = Number(counts?.highAbilityLowPotential || 0)
  const lowHigh = Number(counts?.lowAbilityHighPotential || 0)
  const lowLow = Number(counts?.lowAbilityLowPotential || 0)

  if (highHigh >= 4 && lowHigh >= 3) return buildInterpretationResult('matrix', 'elite')
  if (lowHigh >= Math.max(highHigh, highLow)) return buildInterpretationResult('matrix', 'upside')
  if (highHigh + highLow >= lowHigh + lowLow) return buildInterpretationResult('matrix', 'stable')
  if (lowLow > highHigh + lowHigh) return buildInterpretationResult('matrix', 'critical')
  return buildInterpretationResult('matrix', 'weak')
}

export function resolveStrongestDomainInterpretation(metric = {}, rules = TEAM_INSIGHTS_RULES) {
  if (!Number.isFinite(metric?.avg) || Number(metric?.ratedPlayersCount || 0) < Number(rules?.minPlayersForDomainInsight || 0)) {
    return buildInterpretationResult('strongestDomain', 'noData')
  }

  const avg = Number(metric.avg)
  const cfg = rules?.strongestDomain || {}

  if (avg >= Number(cfg?.eliteMin || 4.2)) return buildInterpretationResult('strongestDomain', 'elite')
  if (avg >= Number(cfg?.strongMin || 3.6)) return buildInterpretationResult('strongestDomain', 'upside')
  if (avg >= Number(cfg?.stableMin || 3.0)) return buildInterpretationResult('strongestDomain', 'stable')
  if (avg >= 2.0) return buildInterpretationResult('strongestDomain', 'weak')
  return buildInterpretationResult('strongestDomain', 'critical')
}

export function resolveBiggestPotentialGapDomainInterpretation(metric = {}, rules = TEAM_INSIGHTS_RULES) {
  if (
    !Number.isFinite(metric?.gap) ||
    Number(metric?.ratedPlayersCount || 0) < Number(rules?.minRatedPlayersForDomainGap || 0)
  ) {
    return buildInterpretationResult('biggestPotentialGapDomain', 'noData')
  }

  const gap = Number(metric.gap)
  const cfg = rules?.biggestPotentialGapDomain || {}

  if (gap >= Number(cfg?.highGapMin || 0.7)) return buildInterpretationResult('biggestPotentialGapDomain', 'elite')
  if (gap >= Number(cfg?.midGapMin || 0.35)) return buildInterpretationResult('biggestPotentialGapDomain', 'upside')
  if (gap >= Number(cfg?.lowGapMin || 0.1)) return buildInterpretationResult('biggestPotentialGapDomain', 'stable')
  if (gap > 0) return buildInterpretationResult('biggestPotentialGapDomain', 'weak')
  return buildInterpretationResult('biggestPotentialGapDomain', 'critical')
}
