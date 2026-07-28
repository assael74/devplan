// src/features/playersDatabase/model/teamPerformance.viewModel.js

const clean = value => String(value || '').trim()

const toNullableNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeMetric = ({ rate, level } = {}) => ({
  rate: toNullableNumber(rate),
  level: clean(level) || 'unavailable',
})

export const buildTeamPerformanceSideViewModel = (side = {}) => ({
  priority: normalizeMetric({
    rate: side.scoutPriorityRate,
    level: side.priorityLevel,
  }),
  quality: {
    rate: toNullableNumber(side.qualityRate),
  },
  target: normalizeMetric({
    rate: side.targetRate,
    level: side.targetLevel,
  }),
  ranking: normalizeMetric({
    rate: side.rankingRate,
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
