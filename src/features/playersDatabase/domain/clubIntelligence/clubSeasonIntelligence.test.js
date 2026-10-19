// src/features/playersDatabase/domain/clubIntelligence/clubSeasonIntelligence.test.js

import { buildClubSeasonIntelligence } from './clubIntelligence.canonical.js'
import { buildTeamSignalRegistry, buildClubTeamSignalStates } from '../../model/team/signals/teamSignalSources.model.js'
import { buildTeamSignals } from '../../model/team/signals/teamSignals.model.js'

const clubId = 'club'
const seasonId = '2026_2027'
const previousId = '2025_2026'
const profile = { clubId, names: { display: 'מועדון' }, clubLevel: 2 }

const setup = () => {
  const leagues = [2013, 2012, 2011].map(birthYear => {
    const teamId = `${clubId}_${birthYear}_1`
    const row = points => ({
      clubId,
      teamSlot: 1,
      officialTable: { rank: 1, points, teamGamePlayed: 8, goalsFor: 16, goalsAgainst: 8 },
      performance: {},
    })
    const season = (seasonKey, points) => ({
      seasonKey,
      birthYear,
      seasonStatus: 'active',
      leagueTotalRound: 10,
      competitionRules: { promotion: { directPlaces: [1] }, relegation: { directPlaces: [4] } },
      table: { teamsById: {
        [teamId]: row(points),
        other1: { ...row(18), clubId: 'other', officialTable: { rank: 2, points: 18, teamGamePlayed: 8 } },
        other2: { ...row(6), clubId: 'other', officialTable: { rank: 3, points: 6, teamGamePlayed: 8 } },
        other3: { ...row(0), clubId: 'other', officialTable: { rank: 4, points: 0, teamGamePlayed: 8 } },
      } },
    })
    return {
      leagueId: `league_${birthYear}`,
      names: { display: `ליגה ${birthYear}` },
      ageGroupId: `u${2027 - birthYear}`,
      level: 2,
      seasonsById: { [seasonId]: season('26/27', 24), [previousId]: season('25/26', 12) },
    }
  })
  const registry = buildTeamSignalRegistry({ leagues })
  const sources = {
    current: { seasonId, center: registry[seasonId], teamSeasonsById: {} },
    history: [{ seasonId: previousId, center: registry[previousId], teamSeasonsById: {} }],
    leaguesById: Object.fromEntries(leagues.map(league => [league.leagueId, league])),
    unavailableSeasonIds: [],
  }
  return { leagues, sources }
}

test('read identity and canonical write identity produce the same seasonal club model', () => {
  const { sources } = setup()
  const read = buildClubSeasonIntelligence({ clubId, directoryEntry: profile, seasonKey: '26/27', sources })
  const write = buildClubSeasonIntelligence({ clubId, profile, sources })
  expect(read).toEqual(write)
  expect(read.signalCoverage.futureLeaguePath).toMatchObject({ status: 'full', reasons: [] })
  expect(read.signalCoverage.futureLeaguePath.coveredFocusAgeGroups.map(group => group.ageGroupId))
    .toEqual(['u14', 'u15'])
  expect(read.cohortComparison.referenceRows).toHaveLength(3)
  expect(read.cohortComparison.referenceRows.every(row => row.seasonId === previousId)).toBe(true)
  expect(read.birthYearTeams.every(group => group.seasons.previous.teams.length === 0)).toBe(true)
})

test('canonical refresh and display produce identical competition and club-gap families', () => {
  const { leagues, sources } = setup()
  const intelligence = buildClubSeasonIntelligence({ clubId, directoryEntry: profile, sources })
  const states = buildClubTeamSignalStates({ clubId, profilesById: { [clubId]: profile }, leagues })
  const teams = intelligence.birthYearTeams.flatMap(group => group.seasons.current.teams)
  for (const team of teams.filter(item => ['u14', 'u15'].includes(item.ageGroupId))) {
    const displayed = buildTeamSignals({
      view: { team, selectedSeasonOption: { seasonId } },
      clubIntelligence: intelligence,
    })
    const saved = states.find(state => state.teamId === team.teamId && state.seasonId === seasonId)
    expect(saved.teamSeasonDocumentId).toBe('')
    expect(saved.state.summary.familiesById['future-competition'])
      .toEqual(displayed.summary.familiesById['future-competition'])
    expect(saved.state.summary.familiesById['future-competition'])
      .toEqual({ level: 1, availability: 'available' })
    expect(saved.state.summary.familiesById['club-gap'])
      .toEqual(displayed.summary.familiesById['club-gap'])
  }
})

test('unavailable history stays explicit without blocking current forecasts or inventing roster coverage', () => {
  const { sources } = setup()
  sources.history = []
  sources.unavailableSeasonIds = [previousId]
  const result = buildClubSeasonIntelligence({ clubId, profile, sources })
  expect(result.cohortComparison.unavailableSeasonIds).toEqual([previousId])
  expect(result.cohortComparison.referenceRows).toEqual([])
  expect(result.signalCoverage.futureLeaguePath.status).toBe('full')
  expect(result.signalCoverage.squadTask.status).toBe('none')
  expect(result.cohortComparison.rows[0].metrics.leagueLevel).toMatchObject({
    availability: 'unavailable', reference: null,
  })
})

test('the shared builder preserves season-key fallback and does not modify its sources', () => {
  const { sources } = setup()
  delete sources.current.center.seasonKey
  const before = JSON.parse(JSON.stringify(sources))
  const result = buildClubSeasonIntelligence({ clubId, profile, seasonKey: '26/27', sources })
  expect(sources).toEqual(before)
  expect(result.birthYearTeams[0].seasons.current.teams[0].seasonKey).toBe('26/27')
  expect(buildClubSeasonIntelligence({ clubId, profile }).birthYearTeams).toEqual([])
})
