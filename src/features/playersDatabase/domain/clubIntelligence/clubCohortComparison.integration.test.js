// src/features/playersDatabase/domain/clubIntelligence/clubCohortComparison.integration.test.js

import { adaptClubCohortComparison } from './clubCohortComparison.adapter.js'
import { buildTeamInsightsPresentation } from '../../ui/pages/teamPage/information/model/teamInsights.presentation.js'

const seasonId = '2026_2027'
const setup = () => {
  const centerTeams = {}
  const teamSeasonsById = {}
  const leagueTeams = {}
  ;[2012, 2011, 2010, 2009].forEach(year => {
    const teamId = `club_${year}_1`
    centerTeams[teamId] = { birthYear: year, teamSlot: 1, leagueId: 'league' }
    leagueTeams[teamId] = {
      officialTable: { teamGamePlayed: 8, points: year === 2012 ? 24 : 12 },
      performance: { offense: { priorityLevel: 'positive', scoutPriorityScore: 65 }, defense: { priorityLevel: 'neutral', scoutPriorityScore: 58 } },
    }
    const roster = {}
    const scouting = {}
    for (let index = 0; index < 20; index += 1) {
      roster[`p${index}`] = { rosterStatus: 'regular' }
      scouting[`p${index}`] = { professionalProfileIds: year === 2012 && index < 4 ? ['clear_scorer', 'killer_efficiency'] : [] }
    }
    roster.left = { rosterStatus: 'left' }
    roster.younger = { rosterStatus: 'youngerAgeGroup' }
    teamSeasonsById[teamId] = {
      identity: { teamId, clubId: 'club', seasonId },
      roster: { playersById: roster }, scouting: { playersById: scouting },
      stats: {
        statsLoadState: { status: 'loaded' },
        playersById: Object.fromEntries(Object.keys(scouting).map(id => [id, { statsStatus: 'loaded' }])),
      },
    }
  })
  const previousSeasonId = '2025_2026'
  const historicalTeams = JSON.parse(JSON.stringify(teamSeasonsById))
  Object.values(historicalTeams).forEach(season => {
    season.identity.seasonId = previousSeasonId
    Object.values(season.scouting.playersById).forEach(player => { player.professionalProfileIds = [] })
  })
  const historicalLeagueTeams = JSON.parse(JSON.stringify(leagueTeams))
  Object.values(historicalLeagueTeams).forEach(team => { team.officialTable.points = 12 })
  return {
    clubId: 'club', seasonId,
    center: { seasonId, clubsById: { club: { teamsById: centerTeams } } },
    leaguesById: { league: { level: 1, seasonsById: {
      [seasonId]: { seasonStatus: 'active', table: { teamsById: leagueTeams } },
      [previousSeasonId]: { seasonStatus: 'completed', table: { teamsById: historicalLeagueTeams } },
    } } },
    teamSeasonsById,
    history: [{
      seasonId: previousSeasonId,
      center: { seasonId: previousSeasonId, clubsById: { club: { teamsById: centerTeams } } },
      teamSeasonsById: historicalTeams,
    }],
  }
}
const view = {
  team: { birthTeamId: 'club_2012_1', clubId: 'club', birthTeamSlot: 1 },
  selectedSeasonOption: { seasonId },
}
const present = input => buildTeamInsightsPresentation({
  view, clubIntelligence: { cohortComparison: adaptClubCohortComparison(input) },
})

test('connects official league and unique current-roster profile counts to the overview insight', () => {
  const result = present(setup())
  expect(result.clubComparison.target).toMatchObject({
    rosterCount: 20, professionalCount: 4, professionalRate: 20, underuseRate: 0,
    offenseScore: 65, defenseScore: 58,
    signalLevel: 2, status: 'multiple', families: ['performance', 'squad'],
  })
  expect(result.signalSummaries['club-gap']).toContain('אחוז הצלחה מעל')
  expect(result.signalSummaries['club-gap']).toContain('פרופילים מקצועיים מעל')
  expect(result.signalReliability['club-gap']).toContain('6/6')
  expect(result.clubComparison.target.metrics.successRate).toMatchObject({ reference: 50, peerCount: 4, cohortCount: 4 })
  expect(result.clubComparison.historyText).toContain('25/26')
  expect(result.clubComparison.referenceRows).toHaveLength(4)
})

test.each(['missing-scout', 'unloaded', 'wrong-season', 'wrong-team', 'wrong-club', 'read-failed'])('does not infer zero profiles from %s', condition => {
  const input = setup()
  const season = input.teamSeasonsById.club_2012_1
  if (condition === 'missing-scout') delete season.scouting.playersById.p0
  if (condition === 'unloaded') season.stats.statsLoadState.status = 'missing'
  if (condition === 'wrong-season') season.identity.seasonId = '2025_2026'
  if (condition === 'wrong-team') season.identity.teamId = 'another'
  if (condition === 'wrong-club') season.identity.clubId = 'another'
  if (condition === 'read-failed') input.teamSeasonsById.club_2012_1 = null
  const result = present(input)
  expect(result.clubComparison.target).toMatchObject({ professionalRate: null, status: 'single', availability: 'partial' })
  expect(result.signalReliability['club-gap']).toContain('נתוני הסגל או הפרופילים אינם מלאים')
})

test('official league load failure leaves explicit missing performance and competition data', () => {
  const input = setup()
  input.leaguesById.league = null
  const result = present(input)
  expect(result.clubComparison.target).toMatchObject({ leagueLevel: null, games: null, status: 'limited', availability: 'unavailable' })
  expect(result.signalSummaries['club-gap']).not.toContain('אינו חריג')
})

test('does not reuse a comparison from another season', () => {
  const input = setup()
  const result = buildTeamInsightsPresentation({
    view: { ...view, selectedSeasonOption: { seasonId: '2025_2026' } },
    clubIntelligence: { cohortComparison: adaptClubCohortComparison(input) },
  })
  expect(result.clubComparison.target).toBe(null)
  expect(result.clubComparison.status).toBe('limited')
})

test('roster-only players remain in the denominator without blocking canonical profile counts', () => {
  const input = setup()
  const season = input.teamSeasonsById.club_2012_1
  season.roster.playersById.unplayed = { rosterStatus: 'regular' }
  const target = present(input).clubComparison.target
  expect(target).toMatchObject({ rosterCount: 21, analyzedCount: 20, professionalCount: 4, profilesAvailable: true })
  expect(target.professionalRate).toBeCloseTo(4 / 21 * 100)
})

test('current cohorts never substitute for missing historical data', () => {
  const input = setup()
  input.history = []
  input.unavailableSeasonIds = ['2025_2026']
  const result = present(input)
  expect(result.clubComparison.target).toMatchObject({ status: 'limited', signalLevel: 0 })
  expect(result.clubComparison.target.metrics.successRate).toMatchObject({ reference: null, cohortCount: 0 })
  expect(result.signalReliability['club-gap']).toContain('טעינת עונות 25/26 נכשלה')
  expect(result.clubComparison.historyText).toContain('אין נתוני עונות קודמות')
})
