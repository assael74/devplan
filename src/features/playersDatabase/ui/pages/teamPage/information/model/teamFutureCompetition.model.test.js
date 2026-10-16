// src/features/playersDatabase/ui/pages/teamPage/information/model/teamFutureCompetition.model.test.js

import { buildTeamInsightsPresentation } from './teamInsights.presentation.js'
import { buildOlderYearTeamRows } from './teamFutureCompetition.model.js'

test('includes all older years and all their teams in the selected-season view', () => {
  const group = birthYear => ({ birthYear, seasons: { current: { teams: [
    { teamId: `${birthYear}-2`, teamSlot: 2 },
    { teamId: `${birthYear}-1`, teamSlot: 1 },
  ] }, previous: { teams: [{ teamId: 'previous-only' }] } } })
  const { olderYearGroups } = buildTeamInsightsPresentation({
    view: { team: { birthYear: 2012 } },
    clubIntelligence: { birthYearTeams: [2013, 2010, 2012, 2008, 2011, 2009, null].map(group) },
  })
  expect(olderYearGroups.map(item => item.birthYear)).toEqual([2011, 2010, 2009, 2008])
  const rows = buildOlderYearTeamRows(olderYearGroups)
  expect(rows).toHaveLength(8)
  expect(rows.slice(0, 2).map(row => row.id)).toEqual(['2011-1', '2011-2'])
  expect(rows.some(row => row.id === 'previous-only')).toBe(false)
})

test('shows official zero values, separates missing data and preserves persisted competition status', () => {
  const rows = buildOlderYearTeamRows([{ birthYear: 2011, seasons: { current: { teams: [
    {
      teamId: 'a', performance: { tableRank: 3, teamGamePlayed: 0, points: 0 },
      competitionProjection: { effective: { status: 'CURRENT_LEVEL', projectedNextLeagueLevel: 2 } },
    },
    { teamId: 'b', competitionProjection: { effective: { status: 'PROMOTION_POSSIBLE', projectedNextLeagueLevel: 1 } } },
    { teamId: 'c' },
  ] } } }, { birthYear: 2010 }])
  expect(rows[0]).toMatchObject({ rank: 3, games: 0, points: 0, projectedLevel: null })
  expect(rows[1]).toMatchObject({ projectedLevel: 1, projection: { label: 'אפשרות לעלייה', color: 'success' } })
  expect(rows[2]).toMatchObject({ rank: null, games: null, points: null, projectedLevel: null })
  expect(rows[3]).toMatchObject({ birthYear: 2010, leagueName: 'ליגה לא ידועה' })
})

const comparisonGroups = [{ birthYear: 2011, seasons: { current: { teams: [{
  teamId: 'a', seasonId: '2026_2027', league: { leagueId: 'current', leagueLevel: 1 },
  performance: { tableRank: 9, teamGamePlayed: 9, points: 9 },
}] } } }]
const comparisonDetails = {
  leaguesById: { current: { seasonsById: { '2026_2027': { table: { teamsById: {
    a: { officialTable: { rank: 2, teamGamePlayed: 10, points: 24, goalsFor: 30, goalsAgainst: 0 } },
  } } } } } },
  previousTeamsById: {
    a: { leagueId: 'previous', performance: { tableRank: 5, teamGamePlayed: 24 } },
    unrelated: { leagueId: 'previous', performance: { tableRank: 1, teamGamePlayed: 24 } },
  },
  previousLeaguesById: { previous: { leagueLevel: 1 } },
}

test('uses the selected official league table and matches previous ranking by team identity', () => {
  expect(buildOlderYearTeamRows(comparisonGroups, comparisonDetails)[0]).toMatchObject({
    rank: 2, games: 10, points: 24, successPercent: 80,
    goalsFor: 30, goalsAgainst: 0, rankChange: 3, previousRank: 5,
  })
})

test.each([[1, -1], [2, 0], [7, 5]])('rank change from previous position %s preserves direction', (previousRank, delta) => {
  const details = { ...comparisonDetails, previousTeamsById: {
    a: { leagueId: 'previous', performance: { tableRank: previousRank, teamGamePlayed: 24 } },
  } }
  expect(buildOlderYearTeamRows(comparisonGroups, details)[0].rankChange).toBe(delta)
})

test('does not infer missing goals, zero-game success or incomparable ranking', () => {
  const noGames = [{ birthYear: 2011, seasons: { current: { teams: [{
    teamId: 'a', performance: { points: 0, teamGamePlayed: 0 },
  }] } } }]
  expect(buildOlderYearTeamRows(noGames)[0]).toMatchObject({
    successPercent: null, goalsFor: null, goalsAgainst: null, rankChange: null,
  })
  const differentLevel = { ...comparisonDetails, previousLeaguesById: { previous: { leagueLevel: 2 } } }
  expect(buildOlderYearTeamRows(comparisonGroups, differentLevel)[0].rankChange).toBeNull()
  const missingPrevious = { ...comparisonDetails, previousTeamsById: {} }
  expect(buildOlderYearTeamRows(comparisonGroups, missingPrevious)[0].rankChange).toBeNull()
})
