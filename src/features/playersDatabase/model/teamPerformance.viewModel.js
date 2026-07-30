// src/features/playersDatabase/model/teamPerformance.viewModel.js

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeMetric = ({ rate, normalized, level } = {}) => ({
  rate: toNullableNumber(rate),
  normalized: toNullableNumber(normalized),
  level: clean(level) || 'unavailable',
})

const normalizePriority = ({ score, level } = {}) => {
  const value = toNullableNumber(score)

  return {
    score: value,
    level: clean(level) || 'unavailable',
  }
}

export const buildTeamPerformanceSideViewModel = (side = {}) => ({
  priority: normalizePriority({
    score: side.scoutPriorityScore,
    level: side.priorityLevel,
  }),
  quality: {
    rate: toNullableNumber(side.qualityRate),
  },
  target: normalizeMetric({
    rate: side.targetRate,
    normalized: side.targetNormalized,
    level: side.targetLevel,
  }),
  ranking: normalizeMetric({
    rate: side.rankingRate,
    normalized: side.rankingNormalized,
    level: side.rankingLevel,
  }),
  anomaly: normalizeMetric({
    rate: side.anomalyRate,
    level: side.anomalyLevel,
  }),
  opportunityType: clean(side.opportunityType) || 'unavailable',
  rank: toNullableNumber(side.rank),
})

export const buildTeamPerformanceViewModel = (performance = {}) => ({
  offense: buildTeamPerformanceSideViewModel(performance.offense),
  defense: buildTeamPerformanceSideViewModel(performance.defense),
})
