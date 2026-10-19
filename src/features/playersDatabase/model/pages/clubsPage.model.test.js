// src/features/playersDatabase/model/pages/clubsPage.model.test.js

import {
  buildClubsPageRows,
  filterClubsPageRows,
} from './clubsPage.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { buildClubDirectoryProjection } from '../../domain/projections/club/clubDirectory.projection.js'
import { buildAllClubIntelligencesFromCanonicalSources } from '../../domain/clubIntelligence/clubIntelligence.canonical.js'
import { buildTeamSignalSummary, hasActiveTeamSignals, TEAM_SIGNAL_FAMILIES } from '../../domain/signals/teamSignalSummary.js'

const baseClub = {
  clubId: 'club-a',
  name: 'מועדון א',
  shortName: 'מ. א',
  clubLevel: 3,
  clubStrengthLevel: 3.5,
}

const buildIntelligence = ({ club = baseClub, current = [], previous = [] } = {}) => ({
  club,
  birthYearTeams: [{
    birthYear: 2012,
    seasons: {
      current: { teams: current },
      previous: { teams: previous },
    },
  }],
})

test('direction filters require active current summaries and preserve the direction facts', () => {
  const summary = buildTeamSignalSummary({ familiesById: {
    'future-competition': { level: 1, availability: 'available' },
    'club-gap': { level: 1, availability: 'available' },
  } })
  const team = {
    teamId: 'club-a_2012_1', teamSlot: 1, ageGroupId: 'u15',
    league: { leagueLevel: 2 }, teamSignalSummary: summary,
    futureCompetition: { direction: 'up', availability: { availability: 'available' } },
  }
  const groupsFor = current => buildClubsPageRows({
    intelligencesByClubId: buildIntelligences([buildIntelligence({ current })]),
  })
  const groups = groupsFor([team])
  expect(filterClubsPageRows({ groups, leaguePathDirections: ['up'], leagueLevelDirections: ['above'] })).toHaveLength(1)
  expect(filterClubsPageRows({ groups, leaguePathDirections: ['down'] })).toEqual([])
  expect(filterClubsPageRows({ groups, leagueLevelDirections: ['below'] })).toEqual([])
  const missing = groupsFor([{ ...team, teamSignalSummary: null, teamTaskSignals: { offense: true } }])
  expect(filterClubsPageRows({ groups: missing, leaguePathDirections: ['up'] })).toEqual([])
  const stale = groupsFor([{ ...team, teamSignalSummary: { ...summary, calibrationVersion: 'old' } }])
  expect(filterClubsPageRows({ groups: stale, leagueLevelDirections: ['above'] })).toEqual([])
  const secondary = groupsFor([{ ...team, teamSlot: 2 }])
  expect(filterClubsPageRows({ groups: secondary, leaguePathDirections: ['up'] })).toEqual([])
})

test.each(TEAM_SIGNAL_FAMILIES)('$id activates the signals-only filter without old task flags', ({ id }) => {
  const summary = buildTeamSignalSummary({ familiesById: { [id]: { level: 2, availability: 'available' } } })
  expect(hasActiveTeamSignals(summary)).toBe(true)
  expect(hasActiveTeamSignals(null)).toBe(false)
})

test('a historical club-gap signal does not imply a current league-level mismatch', () => {
  const summary = buildTeamSignalSummary({ familiesById: { 'club-gap': { level: 2, availability: 'partial' } } })
  const groups = buildClubsPageRows({ intelligencesByClubId: buildIntelligences([buildIntelligence({
    current: [{ teamId: 'club-a_2012_1', teamSlot: 1, league: { leagueLevel: 3.5 }, teamSignalSummary: summary }],
  })]) })
  expect(filterClubsPageRows({ groups, leagueLevelDirections: ['below'] })).toEqual([])
})

const buildIntelligences = values => new Map(
  values.map(intelligence => [intelligence.club.clubId, intelligence])
)

describe('Clubs page rows', () => {
  test('uses the saved display name in the club row even when official, short and seasonal names differ', () => {
    const directory = {
      clubsById: {
        'club-a': buildClubDirectoryProjection({ profile: {
          names: { official: 'שם רשמי', display: 'שם לתצוגה', short: 'שם מקוצר' },
          aliases: ['שם מהטבלה'],
        } }),
      },
    }
    const intelligencesByClubId = buildAllClubIntelligencesFromCanonicalSources({
      directory,
      centers: [{ document: { clubsById: { 'club-a': { displayName: 'שם עונתי ישן' } } } }],
    })
    const [row] = buildClubsPageRows({ intelligencesByClubId })
    expect(row.club.name).toBe('שם לתצוגה')
    expect(row.club.shortName).toBe('שם מקוצר')
  })

  test('shows a seeded Club even before any team season has been loaded', () => {
    const groups = buildClubsPageRows({
      intelligencesByClubId: buildIntelligences([buildIntelligence()]),
    })

    expect(filterClubsPageRows({ groups })).toEqual([
      {
        club: baseClub,
        intelligence: buildIntelligence(),
        teams: [],
      },
    ])
  })

  test('hides a base Club only when a team-specific filter is selected', () => {
    const groups = buildClubsPageRows({
      intelligencesByClubId: buildIntelligences([buildIntelligence()]),
    })

    expect(filterClubsPageRows({ groups, ageGroupId: 'u15' })).toEqual([])
  })

  test('uses a current primary team, not a second team, for a league-level filter', () => {
    const groups = buildClubsPageRows({
      intelligencesByClubId: buildIntelligences([buildIntelligence({
        current: [
          { teamId: 'club-a_2012_1', teamSlot: 1, ageGroupId: 'u15', league: { leagueLevel: 1 } },
          { teamId: 'club-a_2012_2', teamSlot: 2, ageGroupId: 'u15', league: { leagueLevel: 2 } },
        ],
        previous: [
          { teamId: 'club-a_2011_1', teamSlot: 1, ageGroupId: 'u15', league: { leagueLevel: 2 } },
        ],
      })]),
    })

    expect(filterClubsPageRows({ groups, leagueLevel: '2' })).toEqual([])
    expect(filterClubsPageRows({ groups, leagueLevel: '1' })[0].teams.map(team => team.teamId))
      .toEqual(['club-a_2012_1'])
  })

  test('uses previous entries only when the previous season is selected', () => {
    const intelligencesByClubId = buildIntelligences([buildIntelligence({
      current: [{ teamId: 'club-a_2012_1', seasonKey: '26/27' }],
      previous: [{ teamId: 'club-a_2012_1', seasonKey: '25/26' }],
    })])

    expect(buildClubsPageRows({ intelligencesByClubId, seasonView: 'current' })[0].teams[0].seasonKey)
      .toBe('26/27')
    expect(buildClubsPageRows({ intelligencesByClubId, seasonView: 'previous' })[0].teams[0].seasonKey)
      .toBe('25/26')
  })

  test('uses the explicit clubs catalog order rather than Firestore input order', () => {
    const [first, second] = PLAYERS_DATABASE_CLUBS_CATALOG
    const groups = buildClubsPageRows({
      intelligencesByClubId: buildIntelligences([
        buildIntelligence({ club: { ...second, clubId: second.id } }),
        buildIntelligence({ club: { ...first, clubId: first.id } }),
      ]),
    })

    expect(groups.map(group => group.club.clubId)).toEqual([first.id, second.id])
  })
})
