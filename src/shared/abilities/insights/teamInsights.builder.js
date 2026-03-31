import { fmtScore } from '../abilities.utils.js'
import { TEAM_INSIGHTS_RULES } from './teamInsights.rules.js'
import { TEAM_INSIGHTS_LABELS } from './teamInsights.labels.js'
import { buildTeamInsightsMetrics } from './teamInsights.metrics.js'
import {
  resolveBiggestPotentialGapDomainInterpretation,
  resolveMatrixInterpretation,
  resolvePotentialGapInterpretation,
  resolveStrongestDomainInterpretation,
  resolveTeamLevelInterpretation,
  resolveTeamPotentialInterpretation,
  resolveTopAbilityContributorsInterpretation,
  resolveTopPotentialContributorsInterpretation,
} from './teamInsights.interpretations.js'

function buildInsight({
  id,
  kind,
  title,
  value,
  valueLabel,
  shortText,
  longText,
  interpretation,
  meta = {},
}) {
  return {
    id,
    kind,
    title,
    value,
    valueLabel,
    shortText,
    longText,
    interpretation,
    color: interpretation?.color || '#6B7280',
    idIcon: interpretation?.idIcon || 'errorOutline',
    meta,
  }
}

function topRows(rows = [], limit = 5) {
  return Array.isArray(rows) ? rows.slice(0, limit) : []
}

function buildLevelInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.level
  const interpretation = resolveTeamLevelInterpretation(metrics?.teamLevel, rules)

  return buildInsight({
    id: 'team-level',
    kind: 'metric',
    title: labels.title,
    value: metrics?.teamLevel?.avg ?? null,
    valueLabel: Number.isFinite(metrics?.teamLevel?.avg)
      ? `${fmtScore(metrics.teamLevel.avg)} / 5`
      : '—',
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: {
      usedCount: metrics?.teamLevel?.usedCount || 0,
      total: metrics?.teamLevel?.total || 0,
      min: metrics?.teamLevel?.min ?? null,
      max: metrics?.teamLevel?.max ?? null,
    },
  })
}

function buildPotentialInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.potential
  const interpretation = resolveTeamPotentialInterpretation(metrics?.teamPotential, rules)

  return buildInsight({
    id: 'team-potential',
    kind: 'metric',
    title: labels.title,
    value: metrics?.teamPotential?.avg ?? null,
    valueLabel: Number.isFinite(metrics?.teamPotential?.avg)
      ? `${fmtScore(metrics.teamPotential.avg)} / 5`
      : '—',
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: {
      usedCount: metrics?.teamPotential?.usedCount || 0,
      total: metrics?.teamPotential?.total || 0,
      min: metrics?.teamPotential?.min ?? null,
      max: metrics?.teamPotential?.max ?? null,
    },
  })
}

function buildPotentialGapInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.potentialGap
  const interpretation = resolvePotentialGapInterpretation({
    value: metrics?.potentialGap?.value,
    usedCount: metrics?.teamPotential?.usedCount || 0,
  }, rules)

  return buildInsight({
    id: 'team-potential-gap',
    kind: 'gap',
    title: labels.title,
    value: metrics?.potentialGap?.value ?? null,
    valueLabel: Number.isFinite(metrics?.potentialGap?.value)
      ? `${metrics.potentialGap.value > 0 ? '+' : ''}${fmtScore(metrics.potentialGap.value)}`
      : '—',
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: {
      level: metrics?.teamLevel?.avg ?? null,
      levelPotential: metrics?.teamPotential?.avg ?? null,
    },
  })
}

function buildTopAbilityContributorsInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.topAbilityContributors
  const players = topRows(metrics?.topAbilityContributors, 5)
  const interpretation = resolveTopAbilityContributorsInterpretation(players, rules)

  return buildInsight({
    id: 'top-ability-contributors',
    kind: 'ranking',
    title: labels.title,
    value: players.length,
    valueLabel: `${players.length} שחקנים`,
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: {
      players,
    },
  })
}

function buildTopPotentialContributorsInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.topPotentialContributors
  const players = topRows(metrics?.topPotentialContributors, 5)
  const interpretation = resolveTopPotentialContributorsInterpretation(players, rules)

  return buildInsight({
    id: 'top-potential-contributors',
    kind: 'ranking',
    title: labels.title,
    value: players.length,
    valueLabel: `${players.length} שחקנים`,
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: {
      players,
    },
  })
}

function buildMatrixInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.matrix
  const matrix = metrics?.matrix || {}
  const interpretation = resolveMatrixInterpretation(matrix, rules)
  const counts = matrix?.counts || {}

  return buildInsight({
    id: 'squad-matrix',
    kind: 'distribution',
    title: labels.title,
    value: counts,
    valueLabel: `${matrix?.eligiblePlayersCount || 0} שחקנים`,
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: matrix,
  })
}

function buildStrongestDomainInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.strongestDomain
  const domain = metrics?.strongestDomain || null
  const interpretation = resolveStrongestDomainInterpretation(domain, rules)

  return buildInsight({
    id: 'team-strongest-domain',
    kind: 'domain',
    title: labels.title,
    value: domain?.avg ?? null,
    valueLabel: domain ? `${domain.domainLabel} ${fmtScore(domain.avg)}` : '—',
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: domain,
  })
}

function buildBiggestPotentialGapDomainInsight(metrics, rules) {
  const labels = TEAM_INSIGHTS_LABELS.biggestPotentialGapDomain
  const domain = metrics?.biggestPotentialGapDomain || null
  const interpretation = resolveBiggestPotentialGapDomainInterpretation(domain, rules)

  return buildInsight({
    id: 'team-biggest-potential-gap-domain',
    kind: 'domain',
    title: labels.title,
    value: domain?.gap ?? null,
    valueLabel: domain ? `${domain.domainLabel} ${fmtScore(domain.gap)}` : '—',
    shortText: labels.shortText,
    longText: labels.longText,
    interpretation,
    meta: domain,
  })
}

export function buildTeamInsights(team = {}, context = {}, customRules = {}) {
  const rules = {
    ...TEAM_INSIGHTS_RULES,
    ...(customRules || {}),
  }

  const metrics = buildTeamInsightsMetrics(team, context, rules)

  const insights = [
    buildLevelInsight(metrics, rules),
    buildPotentialInsight(metrics, rules),
    buildPotentialGapInsight(metrics, rules),
    buildTopAbilityContributorsInsight(metrics, rules),
    buildTopPotentialContributorsInsight(metrics, rules),
    buildMatrixInsight(metrics, rules),
    buildStrongestDomainInsight(metrics, rules),
    buildBiggestPotentialGapDomainInsight(metrics, rules),
  ]

  return {
    metrics,
    insights,
    meta: {
      playersCount: metrics?.meta?.playersCount || 0,
      updatedFrom: 'teamInsights.builder',
    },
  }
}
