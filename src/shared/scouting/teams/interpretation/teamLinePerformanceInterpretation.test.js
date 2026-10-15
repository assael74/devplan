// src/shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.test.js

import {
  buildTeamLinePerformanceInterpretation,
  buildTeamTaskSignals,
} from './teamLinePerformanceInterpretation.js'

test('missing line classification requests review without a recruitment task', () => {
  const interpretation = buildTeamLinePerformanceInterpretation({
    offense: { priorityLevel: 'low' },
    defense: { priorityLevel: 'low' },
    lineupBenchmark: {
      availability: 'available',
      metrics: {
        attack: { actual: 0, state: 'below_reference' },
        defense: { actual: 0, state: 'below_reference' },
      },
    },
    classificationCoverageBenchmark: { state: 'typical' },
  })

  expect(interpretation.offense.finding).toBe('ATTACK_CLASSIFICATION_MISSING')
  expect(interpretation.defense.finding).toBe('DEFENSE_CLASSIFICATION_MISSING')
  expect(interpretation.offense.actions).toEqual({ teamNeed: null, marketOpportunity: null })
  expect(interpretation.defense.actions).toEqual({ teamNeed: null, marketOpportunity: null })
  expect(buildTeamTaskSignals({
    offenseFinding: interpretation.offense.finding,
    defenseFinding: interpretation.defense.finding,
  })).toEqual({ offense: false, defense: false })
})
