import {
  buildClubsPageRows,
  filterClubsPageRows,
} from './clubsPage.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'

const baseClub = {
  clubId: 'club-a',
  name: 'מועדון א',
  shortName: 'מ. א',
  clubLevel: 3,
  clubStrengthLevel: 3.5,
  ageGroups: [],
}

describe('Clubs page rows', () => {
  test('shows a seeded Club even before any team season has been loaded', () => {
    const groups = buildClubsPageRows({
      clubsMasterDoc: { clubs: [baseClub] },
    })

    expect(filterClubsPageRows({ groups })).toEqual([
      {
        club: baseClub,
        intelligence: null,
        previousTeams: [],
        teams: [],
      },
    ])
  })

  test('hides a base Club only when a team-specific filter is selected', () => {
    const groups = buildClubsPageRows({
      clubsMasterDoc: { clubs: [baseClub] },
    })

    expect(filterClubsPageRows({ groups, ageGroupId: 'u15' })).toEqual([])
  })

  test('uses a current primary team, not a second team, for a league-level filter', () => {
    const groups = buildClubsPageRows({
      clubsMasterDoc: {
        clubs: [{
          ...baseClub,
          ageGroups: [{
            ageGroupId: 'u15',
            current: [
              { teamId: 'club-a_2012_1', league: { leagueLevel: 1 } },
              { teamId: 'club-a_2012_2', league: { leagueLevel: 2 } },
            ],
            previous: [
              { teamId: 'club-a_2011_1', league: { leagueLevel: 2 } },
            ],
          }],
        }],
      },
    })

    expect(filterClubsPageRows({ groups, leagueLevel: '2' })).toEqual([])
    expect(filterClubsPageRows({ groups, leagueLevel: '1' })[0].teams.map(team => team.teamId))
      .toEqual(['club-a_2012_1'])
  })

  test('uses previous entries only when the previous season is selected', () => {
    const clubsMasterDoc = {
      clubs: [{
        ...baseClub,
        ageGroups: [{
          ageGroupId: 'u15',
          current: [{ teamId: 'club-a_2012_1', seasonKey: '26/27' }],
          previous: [{ teamId: 'club-a_2012_1', seasonKey: '25/26' }],
        }],
      }],
    }

    expect(buildClubsPageRows({ clubsMasterDoc, seasonView: 'current' })[0].teams[0].seasonKey)
      .toBe('26/27')
    expect(buildClubsPageRows({ clubsMasterDoc, seasonView: 'previous' })[0].teams[0].seasonKey)
      .toBe('25/26')
  })

  test('uses the explicit clubs catalog order rather than Firestore input order', () => {
    const [first, second] = PLAYERS_DATABASE_CLUBS_CATALOG
    const groups = buildClubsPageRows({
      clubsMasterDoc: {
        clubs: [
          { ...second, clubId: second.id, ageGroups: [] },
          { ...first, clubId: first.id, ageGroups: [] },
        ],
      },
    })

    expect(groups.map(group => group.club.clubId)).toEqual([first.id, second.id])
  })
})
