// src/shared/scouting/teams/teamScout.performance.test.js

import { buildTeamScoutLeagueModel } from './teamScout.builder.js'
import { buildTeamScoutPriorityBreakdown } from './teamScout.performance.js'
import {
  resolveTeamScoutPriorityLevel,
  resolveTeamScoutPriorityScoreLevel,
  resolveTeamScoutAnomalyLevel,
} from './teamScout.model.js'

test.each([null, undefined, '', NaN])('missing metric %p stays unavailable', value => {
  expect(resolveTeamScoutPriorityLevel(value)).toBe('unavailable')
  expect(resolveTeamScoutPriorityScoreLevel(value)).toBe('unavailable')
  expect(resolveTeamScoutAnomalyLevel(value)).toBe('unavailable')
})

test('a measured zero remains a valid low result', () => {
  expect(resolveTeamScoutPriorityLevel(0)).toBe('low')
  expect(resolveTeamScoutPriorityScoreLevel(0)).toBe('low')
  expect(resolveTeamScoutAnomalyLevel(0)).toBe('below')
})

const buildDefense = goalsAgainst => buildTeamScoutLeagueModel({
  leagueLevel: 1,
  leagueNumGames: 30,
  rows: [
    { teamId: 'a', position: 1, gamesPlayed: 5, goalsFor: 0, goalsAgainst },
    { teamId: 'b', position: 2, gamesPlayed: 5, goalsFor: 5, goalsAgainst: 5 },
  ],
}).rows.find(row => row.teamId === 'a')

test('the 84 score retains the precise weighted contributions and rounding', () => {
  const result = buildTeamScoutPriorityBreakdown({ qualityRate: 79, targetRate: 139, rankingRate: 180 })
  expect(result.components.map(component => component.points)).toEqual([47.4, 23.25, 13.5])
  expect(result.total).toBe(84.15)
  expect(result.score).toBe(84)
  expect(result.capped).toBe(false)
})

test('the breakdown records an applied quality cap and preserves missing values', () => {
  const result = buildTeamScoutPriorityBreakdown({ qualityRate: 64, targetRate: 200, rankingRate: 200 })
  expect(result.total).toBe(78.4)
  expect(result.roundedScore).toBe(78)
  expect(result.score).toBe(69)
  expect(result.capped).toBe(true)
  expect(buildTeamScoutPriorityBreakdown({ qualityRate: 79, targetRate: null, rankingRate: 180 })).toBeNull()
})

test('extracting a breakdown preserves the original engine rounding at a floating point boundary', () => {
  const result = buildTeamScoutPriorityBreakdown({ qualityRate: 67, targetRate: 75, rankingRate: 104 })
  expect(result.score).toBe(60)
})

test('zero conceded goals produce a finite positive defensive priority', () => {
  const team = buildDefense(0)

  expect(team.defense.targetRate).toBe(200)
  expect(Number.isFinite(team.defense.scoutPriorityScore)).toBe(true)
  expect(['positive', 'high', 'elite']).toContain(team.defense.priorityLevel)
  expect(team.defense.scoutPriorityScore).toBeGreaterThanOrEqual(
    buildDefense(1).defense.scoutPriorityScore
  )
  expect(team.offense.targetRate).toBe(0)
  expect(team.offense.priorityLevel).toBe('low')
})
