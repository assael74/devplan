// src/features/playersDatabase/model/league/page/leagueWorkKpis.model.test.js

import { buildTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'
import { buildLeagueStatsStatus } from './leagueStatsStatus.model.js'
import { buildLeagueWorkKpis } from './leagueWorkKpis.model.js'

const team = (overrides = {}) => ({
  attackPriority: 'neutral',
  defensePriority: 'low',
  hasStats: false,
  ...overrides,
})

const stats = (current, atLoad, complete = true) => ({
  hasStats: true,
  statsStatus: buildLeagueStatsStatus({
    stats: { hasStats: true, statsComplete: complete, teamGamePlayedAtLoad: atLoad },
    teamGamePlayed: current,
  }),
})

const signals = familiesById => buildTeamSignalSummary({
  computedAt: '2026-10-19T00:00:00.000Z',
  familiesById,
})
const family = level => ({ level, availability: 'available' })

test('strong count drill-down separates exact counts and their marked subsets', () => {
  const teams = [
    team({ teamSignalSummary: signals({ performance: family(2) }) }),
    team({ teamSignalSummary: signals({ performance: family(2), 'club-gap': family(2) }), showInvestigationIndicator: true }),
    team({ teamSignalSummary: signals({ performance: family(2), 'club-gap': family(2), 'roster-balance': family(2) }) }),
    team({ teamSignalSummary: signals({ performance: family(1) }) }),
  ]
  const { teamsByFilter } = buildLeagueWorkKpis({ teams })
  expect(teamsByFilter.strong1).toEqual([teams[0]])
  expect(teamsByFilter.strong2).toEqual([teams[1]])
  expect(teamsByFilter.strong3Plus).toEqual([teams[2]])
  expect(teamsByFilter.strong1Marked).toEqual([])
  expect(teamsByFilter.strong2Marked).toEqual([teams[1]])
  expect(teamsByFilter.strong3PlusMarked).toEqual([])
  expect(teamsByFilter.strong2Marked[0]).toBe(teams[1])
  expect(teamsByFilter.strongMin1).toEqual(teams.slice(0, 3))
  expect(teamsByFilter.strongMin2).toEqual([teams[1], teams[2]])
  expect(teamsByFilter.strongMin3).toEqual([teams[2]])
  expect(teamsByFilter.strongMin1Pending).toEqual([teams[0], teams[2]])
  expect(teamsByFilter.strongMin2Pending).toEqual([teams[2]])
  expect(teamsByFilter.strongMin3Pending).toEqual([teams[2]])
})

const loadTeams = [
  team(),
  team({ attackPriority: 'positive' }),
  team({ defensePriority: 'positive', ...stats(8, 6) }),
  team({ attackPriority: 'high', defensePriority: 'elite', ...stats(7, 8) }),
  team({ attackPriority: 'elite', ...stats(8, 8) }),
  team({ defensePriority: 'high', ...stats(8, null) }),
  team({ attackPriority: 'positive', ...stats(0, 0, false) }),
]

test.each([1, 2])('center statistics drill-down includes all incomplete teams regardless of priority at level %s', leagueLevel => {
  const teams = [
    team(),
    team({ attackPriority: 'positive' }),
    team({ hasStats: true, statsComplete: false }),
    team({ hasStats: true, statsComplete: true }),
  ]
  const { teamsByFilter } = buildLeagueWorkKpis({ teams, leagueLevel })
  expect(teamsByFilter.incompleteStats).toEqual(teams.slice(0, 3))
  expect(teamsByFilter.incompleteStats[0]).toBe(teams[0])
  expect(teamsByFilter.missingStats).toEqual(leagueLevel === 1 ? teams.slice(0, 2) : [teams[1]])
})

test.each([1, '1'])('level %s includes every team regardless of priority', leagueLevel => {
  expect(buildLeagueWorkKpis({ teams: loadTeams, leagueLevel })).toMatchObject({
    teamsCount: 7,
    loading: {
      allTeamsRequired: true,
      targetsCount: 7,
      missingStatsCount: 2,
      gamesGapCount: 2,
      unknownGapCount: 1,
    },
  })
})

test.each([2, 3, 4, '2', null, undefined])('level %s requires positive or higher on either side', leagueLevel => {
  expect(buildLeagueWorkKpis({ teams: loadTeams, leagueLevel }).loading).toEqual({
    allTeamsRequired: false,
    targetsCount: 6,
    missingStatsCount: 1,
    gamesGapCount: 2,
    unknownGapCount: 1,
  })
})

test('level 1 also includes teams with unavailable priorities', () => {
  const teams = [team({ attackPriority: 'unavailable', defensePriority: 'unavailable' })]
  expect(buildLeagueWorkKpis({ teams, leagueLevel: 1 }).loading.missingStatsCount).toBe(1)
  expect(buildLeagueWorkKpis({ teams, leagueLevel: 2 }).loading.targetsCount).toBe(0)
})

test('current priority determines eligibility again whenever the rows change', () => {
  expect(buildLeagueWorkKpis({ teams: [team()], leagueLevel: 2 }).loading.missingStatsCount).toBe(0)
  expect(buildLeagueWorkKpis({
    teams: [team({ defensePriority: 'positive' })], leagueLevel: 2,
  }).loading.missingStatsCount).toBe(1)
})

test('loaded Stats without a comparison basis are unknown, not missing or current', () => {
  expect(buildLeagueWorkKpis({
    teams: [team({ hasStats: true })], leagueLevel: 1,
  }).loading).toMatchObject({ missingStatsCount: 0, gamesGapCount: 0, unknownGapCount: 1 })
})

test('zero games and partial loaded Stats with a zero gap are not counted as missing', () => {
  expect(buildLeagueWorkKpis({
    teams: [team(stats(0, 0)), team(stats(8, 8, false))], leagueLevel: 1,
  }).loading).toMatchObject({ missingStatsCount: 0, gamesGapCount: 0, unknownGapCount: 0 })
})

test('research counts teams once, separates strong from watch only, and uses the manual investigation mark', () => {
  const teams = [
    team({ teamSignalSummary: signals({ performance: family(2), 'roster-balance': family(2), 'club-gap': family(1) }) }),
    team({ teamSignalSummary: signals({ performance: family(1), 'club-gap': family(1) }), showInvestigationIndicator: true }),
    team({ teamSignalSummary: signals({ performance: family(2) }), showInvestigationIndicator: true }),
    team({ teamSignalSummary: signals({ performance: family(1) }) }),
    team({ teamSignalSummary: signals({ performance: family(0) }) }),
    team(),
  ]
  for (const leagueLevel of [1, 2]) {
    expect(buildLeagueWorkKpis({ teams, leagueLevel }).research).toEqual({
      strongCount: 2, watchOnlyCount: 2, unmarkedCount: 2,
    })
  }
})

test('unknown families and incompatible summary versions are not active signals', () => {
  const current = signals({ performance: family(2) })
  const teams = [
    team({ teamSignalSummary: signals({}) }),
    team({ teamSignalSummary: { ...current, modelVersion: 'old' } }),
    team({ teamSignalSummary: { ...current, calibrationVersion: 'old' } }),
  ]
  expect(buildLeagueWorkKpis({ teams }).research).toEqual({
    strongCount: 0, watchOnlyCount: 0, unmarkedCount: 0,
  })
})

test('empty tables have zero counts without mutating input rows', () => {
  expect(buildLeagueWorkKpis()).toMatchObject({
    teamsCount: 0,
    loading: { targetsCount: 0, missingStatsCount: 0, gamesGapCount: 0, unknownGapCount: 0 },
    research: { strongCount: 0, watchOnlyCount: 0, unmarkedCount: 0 },
  })
  const before = JSON.stringify(loadTeams)
  buildLeagueWorkKpis({ teams: loadTeams, leagueLevel: 1 })
  expect(JSON.stringify(loadTeams)).toBe(before)
})

test.each([1, 2])('loading filters contain exactly the teams counted by each KPI at level %s', leagueLevel => {
  const kpis = buildLeagueWorkKpis({ teams: loadTeams, leagueLevel })
  const { teamsByFilter, loading } = kpis
  expect(teamsByFilter.all).toBe(loadTeams)
  expect(teamsByFilter.missingStats).toEqual(leagueLevel === 1 ? loadTeams.slice(0, 2) : [loadTeams[1]])
  expect(teamsByFilter.gamesGap).toEqual([loadTeams[2], loadTeams[3]])
  expect(teamsByFilter.unknownGap).toEqual([loadTeams[5]])
  expect(teamsByFilter.missingStats).toHaveLength(loading.missingStatsCount)
  expect(teamsByFilter.gamesGap).toHaveLength(loading.gamesGapCount)
  expect(teamsByFilter.unknownGap).toHaveLength(loading.unknownGapCount)
  expect(teamsByFilter.gamesGap[0]).toBe(loadTeams[2])
})

test('research filters preserve team objects, exclude unavailable signals, and can overlap for unmarked investigation', () => {
  const teams = [
    team({ id: 'strong', favorite: true, teamSignalSummary: signals({ performance: family(2) }) }),
    team({ id: 'watch', teamSignalSummary: signals({ performance: family(1) }), showInvestigationIndicator: true }),
    team({ id: 'unknown' }),
  ]
  const { research, teamsByFilter } = buildLeagueWorkKpis({ teams, leagueLevel: 2 })
  expect(teamsByFilter.strongSignals).toEqual([teams[0]])
  expect(teamsByFilter.watchSignals).toEqual([teams[1]])
  expect(teamsByFilter.unmarkedInvestigation).toEqual([teams[0]])
  expect(teamsByFilter.strongSignals).toHaveLength(research.strongCount)
  expect(teamsByFilter.watchSignals).toHaveLength(research.watchOnlyCount)
  expect(teamsByFilter.unmarkedInvestigation).toHaveLength(research.unmarkedCount)
  expect(teamsByFilter.strongSignals[0]).toBe(teams[0])
  expect(teamsByFilter.strongSignals[0].favorite).toBe(true)
})

test('research work drill-down includes only the exact pending, marked or missing-information group', () => {
  const teams = [
    team({ id: 'strong', favorite: true, teamSignalSummary: signals({ performance: family(2) }) }),
    team({ id: 'watch', teamSignalSummary: signals({ performance: family(1) }) }),
    team({ id: 'marked', teamSignalSummary: signals({ performance: family(2) }), showInvestigationIndicator: true }),
    team({ id: 'missing' }),
  ]
  const { teamsByFilter } = buildLeagueWorkKpis({ teams, leagueLevel: 2 })
  expect(teamsByFilter.pendingStrong).toEqual([teams[0]])
  expect(teamsByFilter.pendingWatch).toEqual([teams[1]])
  expect(teamsByFilter.markedInvestigation).toEqual([teams[2]])
  expect(teamsByFilter.missingSignalInformation).toEqual([teams[3]])
  expect(teamsByFilter.pendingStrong[0]).toBe(teams[0])
  expect(teamsByFilter.all).toBe(teams)
})
