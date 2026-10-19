// src/features/playersDatabase/model/team/teamPerformance.viewModel.test.js

import { buildTeamPerformanceSideViewModel } from './teamPerformance.viewModel.js'

test.each([null, undefined, ''])('missing performance %p is not converted to zero', value => {
  const view = buildTeamPerformanceSideViewModel({
    scoutPriorityScore: value,
    targetRate: value,
    targetNormalized: value,
    rankingRate: value,
    anomalyRate: value,
    qualityRate: value,
    rank: value,
  })

  expect(view.priority).toEqual({ score: null, level: 'unavailable' })
  expect(view.target.rate).toBeNull()
  expect(view.target.normalized).toBeNull()
  expect(view.ranking.rate).toBeNull()
  expect(view.anomaly.rate).toBeNull()
  expect(view.quality.rate).toBeNull()
  expect(view.rank).toBeNull()
})

test('a measured zero is preserved', () => {
  const view = buildTeamPerformanceSideViewModel({
    scoutPriorityScore: 0,
    priorityLevel: 'low',
    targetRate: 0,
  })

  expect(view.priority).toEqual({ score: 0, level: 'low' })
  expect(view.target.rate).toBe(0)
})
