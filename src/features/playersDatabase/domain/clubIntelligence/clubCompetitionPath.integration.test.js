// src/features/playersDatabase/domain/clubIntelligence/clubCompetitionPath.integration.test.js

import { buildClubIntelligenceFromCanonicalSources } from './clubIntelligence.canonical.js'
import { buildTeamInsightsPresentation } from '../../ui/pages/teamPage/information/model/teamInsights.presentation.js'

const seasonId = '2026_2027'
const sourceId = 'club_2011_1'
const targetId = 'club_2012_1'
const setup = (sourcePoints = 20, targetLevel = 2) => {
  const table = Object.fromEntries([sourcePoints, 19, 5, 2].map((points, index) => [
    index === 0 ? sourceId : `other-${index}`,
    { officialTable: { rank: index + 1, points, teamGamePlayed: 8 } },
  ]))
  return {
    clubId: 'club',
    centers: [{
      season: { seasonId, seasonKey: '26/27', target: 'current' },
      document: {
        seasonId, seasonKey: '26/27',
        leaguesById: {
          younger: { leagueLevel: targetLevel, seasonStatus: 'active' },
          older: { leagueLevel: 2, seasonStatus: 'active' },
        },
        clubsById: { club: { teamsById: {
          [targetId]: { birthYear: 2012, teamSlot: 1, leagueId: 'younger', ageGroupId: 'u15' },
          [sourceId]: { birthYear: 2011, teamSlot: 1, leagueId: 'older', ageGroupId: 'u16',
            competitionProjection: { effective: { status: 'SAFE_CONFIRMED', projectedNextLeagueLevel: 2 } } },
        } } },
      },
      leagueDocumentsById: {
        older: { leagueId: 'older', level: 2, seasonsById: { [seasonId]: {
          seasonStatus: 'active', leagueTotalRound: 10, table: { teamsById: table },
          competitionRules: { promotion: { directPlaces: [1] }, relegation: { directPlaces: [4] } },
        } } },
      },
    }],
  }
}
const present = input => {
  const intelligence = buildClubIntelligenceFromCanonicalSources(input)
  return buildTeamInsightsPresentation({
    view: { team: { birthYear: 2012, birthTeamId: targetId, birthTeamSlot: 1 } },
    clubIntelligence: intelligence,
  })
}

test('recalculates stale stored forecast and connects the influencing team to the main card', () => {
  const result = present(setup())
  expect(result.futureCompetitionSignal).toMatchObject({ status: 'upside', label: 'אפשרות לעליית תחרות' })
  expect(result.signalSummaries['future-competition']).toContain('מרמה 2 לרמה 1')
  expect(result.signalSummaries['future-competition']).toContain('27/28')
  expect(result.signalReliability['future-competition']).toContain('שנתון 2011')
})

test('compares forecast to the target level rather than copying the source direction', () => {
  expect(present(setup(20, 1)).futureCompetitionSignal.status).toBe('none')
  expect(present(setup(0)).futureCompetitionSignal.status).toBe('risk')
})

test.each(['missing', 'wrong-slot', 'ambiguous', 'early', 'read-failed'])('does not signal on %s source data', condition => {
  const input = setup()
  const center = input.centers[0]
  const teams = center.document.clubsById.club.teamsById
  if (condition === 'missing') delete teams[sourceId]
  if (condition === 'wrong-slot') teams[sourceId].teamSlot = 2
  if (condition === 'ambiguous') teams.duplicate = { ...teams[sourceId] }
  if (condition === 'early') center.leagueDocumentsById.older.seasonsById[seasonId].leagueTotalRound = 30
  if (condition === 'read-failed') center.leagueDocumentsById.older = null
  expect(present(input).futureCompetitionSignal.status).toBe('limited')
})

test.each([
  [false, 10, true, false],
  [true, 30, false, true],
  [false, 30, true, true],
])('shows exact forecast blockers: rules %s, season games %s', (configured, rounds, missingRules, earlySeason) => {
  const input = setup()
  const season = input.centers[0].leagueDocumentsById.older.seasonsById[seasonId]
  season.competitionRules.configured = configured
  season.leagueTotalRound = rounds
  const result = present(input)
  const summary = result.signalSummaries['future-competition']
  expect(summary.includes('לא הוגדרו חוקי עלייה וירידה לליגה')).toBe(missingRules)
  expect(summary.includes('טרם הושלמו 50% ממשחקי העונה')).toBe(earlySeason)
  expect(result.futureCompetitionSignal.status).toBe('limited')
  expect(result.futureCompetitionSignal.summary).toBe(summary)
})
