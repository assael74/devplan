// src/features/playersDatabase/ui/pages/teamPage/information/model/teamRosterComparison.model.test.js

import { buildTeamRosterComparisonRows } from './teamRosterComparison.model.js'
import { buildPlayerScoutNormalization } from '@devplan/players-scout-engine/players/normalization.js'

const player = (playerId, stats = {}, extra = {}) => ({
  playerId, fullName: 'שם זהה', statsStatus: 'loaded',
  playerStats: { games: 10, teamGames: 10, teamMinutes: 800, ...stats },
  ...extra,
})
const context = teamPlayers => ({ season: { teamPlayers, seasonStatus: 'completed' } })

const activePlayer = (goals, calculation = {}) => player('a', { goals }, {
  scoutSeasonProjection: { evidence: {
    actual: { goals },
    calculationContext: { seasonStatus: 'active', teamGamePlayed: 8, leagueTotalRound: 38, ...calculation },
  } },
})

test('goals comparison uses the exact scout projection and completed-season actual goals', () => {
  const current = { season: { seasonStatus: 'active', teamPlayers: [activePlayer(7)] } }
  const [row] = buildTeamRosterComparisonRows({ current, previous: context([player('a', { goals: 9 })]) })
  const normalization = buildPlayerScoutNormalization({
    player: { goals: 7 }, team: { teamGamePlayed: 8 }, season: { seasonStatus: 'active', leagueTotalRound: 38 },
  })
  expect(row.goals).toBe(7)
  expect(row.projectedGoals).toBe(normalization.projectedStats.goals)
  expect(row.projectedGoals).toBe(33.25)
  expect(row.previous.projectedGoals).toBeNull()
  expect(row.changes.goals).toBe(24.25)
})

test('missing projection inputs do not become zero or a raw comparison', () => {
  const previous = context([player('a', { goals: 9 })])
  ;[
    player('a', { goals: 7 }),
    activePlayer(7, { teamGamePlayed: 0 }),
    activePlayer(7, { leagueTotalRound: null }),
    { ...activePlayer(7), playerStats: { goals: 8 } },
  ].forEach(candidate => {
    const current = { season: { seasonStatus: 'active', teamPlayers: [candidate] } }
    const [row] = buildTeamRosterComparisonRows({ current, previous })
    expect(row.projectedGoals).toBeNull()
    expect(row.changes.goals).toBeNull()
  })
})

test('zero is a valid projection and two active seasons compare their projections', () => {
  const activeContext = candidate => ({ season: { seasonStatus: 'active', teamPlayers: [candidate] } })
  const [row] = buildTeamRosterComparisonRows({
    current: activeContext(activePlayer(0)),
    previous: activeContext(activePlayer(2, { teamGamePlayed: 10, leagueTotalRound: 30 })),
  })
  expect(row.projectedGoals).toBe(0)
  expect(row.previous.projectedGoals).toBe(6)
  expect(row.changes.goals).toBe(-6)
})

test('matches identifiers despite row order and keeps only all current players', () => {
  const current = context([
    player('b', { minutes: 400, goals: 0 }),
    player('a', { minutes: 600, goals: 4 }, { lineClassification: { line: 'MIDFIELD' } }),
    player('new'),
  ])
  const previous = context([
    player('a', { minutes: 400, goals: 1 }, { lineClassification: { line: 'DEFENSE' } }),
    player('b', { minutes: 400, goals: 0 }),
    player('left'),
  ])
  const rows = buildTeamRosterComparisonRows({ current, previous })
  expect(rows).toHaveLength(3)
  expect(rows.find(row => row.id === 'a').changes).toEqual({
    minutes: 200, minutesRate: 25, goals: 3, line: true,
  })
  expect(rows.find(row => row.id === 'b').changes.goals).toBe(0)
  expect(rows.find(row => row.id === 'new').previous).toBeNull()
})

test('missing data, ambiguous identities and missing identifiers do not become comparisons', () => {
  const current = context([player('a'), player('', {}, { id: '' }), player('ambiguous')])
  const previous = context([
    player('a', { goals: 3 }), player('', { goals: 5 }),
    player('ambiguous', { goals: 2 }), player('ambiguous', { goals: 9 }),
  ])
  const rows = buildTeamRosterComparisonRows({ current, previous })
  expect(rows.every(row => row.changes.goals === null)).toBe(true)
  expect(rows.find(row => row.player.playerId === '').previous).toBeNull()
  expect(rows.find(row => row.id === 'ambiguous').previous).toBeNull()
  expect(buildTeamRosterComparisonRows({ current }).every(row => row.previous === null)).toBe(true)
  expect(buildTeamRosterComparisonRows({ previous })).toEqual([])
})

test('matches alternate stable identity and retains current season profile', () => {
  const current = context([player('current-id', { goals: 1 }, { externalPlayerId: 'external', profile: 'current' })])
  const previous = context([player('older-id', { goals: 3 }, { externalPlayerId: 'external', profile: 'previous' })])
  const [row] = buildTeamRosterComparisonRows({ current, previous })
  expect(row.changes.goals).toBe(-2)
  expect(row.player.profile).toBe('current')
  expect(row.previous.player.profile).toBe('previous')
})

test('shows prior scout and line from arrival history without loading a player document', () => {
  const current = context([player('arrived', { goals: 2, minutes: 400 })])
  current.season.movement = {
    transfersInById: { move: { movementId: 'move', playerId: 'arrived' } },
    arrivalHistoryById: { move: {
      sourceStatus: 'available', scoutStatus: 'available', primaryProfileId: 'clear_scorer',
      primaryProfileDepthPct: 80, professionalProfileIds: ['clear_scorer'],
      lineStatus: 'available', line: 'ATTACK',
    } },
  }
  const [row] = buildTeamRosterComparisonRows({ current, previous: context([]) })
  expect(row.previous.classification).toEqual({ line: 'ATTACK' })
  expect(row.previous.player.scoutProfiles).toEqual([{ profileId: 'clear_scorer', depthPct: 80 }])
  expect(row.changes.goals).toBeNull()
})
