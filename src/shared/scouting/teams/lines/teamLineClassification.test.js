// src/shared/scouting/teams/lines/teamLineClassification.test.js

import { buildTeamPlayerLineClassificationEvaluation } from './teamLineClassification.js'

const player = ({ games, goals, minutes = 600 } = {}) => ({
  playerStats: {
    games,
    goals,
    minutes,
    starts: 8,
    substitutedOut: 0,
    teamMinutes: 720,
    teamGames: 8,
  },
})

const evaluate = ({ games, goals, seasonStatus = 'active' }) => (
  buildTeamPlayerLineClassificationEvaluation({
    player: player({ games, goals }),
    team: { teamGamePlayed: 8 },
    season: { seasonStatus, leagueTotalRound: 30 },
  })
)

test('requires eight actual appearances before applying projected goals', () => {
  const result = evaluate({ games: 7, goals: 4 })

  expect(result.reasonCode).toBe('insufficient_games')
  expect(result.classification).toBeNull()
})

test('classifies from the scout goal projection after eight appearances', () => {
  const scorer = evaluate({ games: 8, goals: 4 })
  const midfielder = evaluate({ games: 8, goals: 2 })

  expect(scorer.classification.line).toBe('ATTACK')
  expect(scorer.classificationGoals).toBe(15)
  expect(midfielder.classification.line).toBe('MIDFIELD')
  expect(midfielder.classification.position).toBe('ATTACKING_MIDFIELDER')
  expect(midfielder.classificationGoals).toBe(7.5)
})

test('uses actual goals after the season is completed', () => {
  const result = evaluate({ games: 8, goals: 4, seasonStatus: 'completed' })

  expect(result.goalsProjected).toBe(false)
  expect(result.classificationGoals).toBe(4)
  expect(result.classification.line).toBe('DEFENSE')
})
