import { buildExpectedRosterClubsV2 } from './buildExpectedClubs.js'

const teamRoot = ({ teamId, clubId }) => ({
  birthTeamDocumentId: teamId,
  clubId,
  birthTeamSlot: 1,
})
const teamSeason = ({ teamId, leagueId, movementId = '' }) => ({
  birthTeamDocumentId: teamId,
  seasonKey: '26_27',
  seasonId: '26_27',
  leagueId,
  ageGroupId: 'u15',
  birthYear: 2012,
  teamPlayers: [],
  playersCount: 0,
  transfersIn: movementId ? [{ movementId, playerId: 'p1' }] : [],
  transfersOut: [],
  pendingPlayers: [],
})
const league = id => ({ id, leagueId: id, ageGroupId: 'u15', level: 2, current: { seasonKey: '26_27', tableRank: [] } })

describe('buildExpectedRosterClubsV2', () => {
  test('includes local Club and only counterpart canonical season tied to the expected movement', () => {
    const rows = buildExpectedRosterClubsV2({
      canonical: {
        birthTeamDocumentId: 'team-a',
        seasonKey: '26_27',
        teamRoot: teamRoot({ teamId: 'team-a', clubId: 'club-a' }),
        teamSeason: teamSeason({ teamId: 'team-a', leagueId: 'league-a' }),
        league: league('league-a'),
      },
      expectedCounterparts: [{
        movementId: 'm1',
        target: { birthTeamDocumentId: 'team-b', seasonKey: '26_27', side: 'transfersIn' },
      }],
      counterpartCanonical: [
        {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          teamRoot: teamRoot({ teamId: 'team-b', clubId: 'club-b' }),
          teamSeason: teamSeason({ teamId: 'team-b', leagueId: 'league-b', movementId: 'm1' }),
          league: league('league-b'),
        },
        {
          birthTeamDocumentId: 'team-b',
          seasonKey: '25_26',
          teamRoot: teamRoot({ teamId: 'team-b', clubId: 'club-b' }),
          teamSeason: { ...teamSeason({ teamId: 'team-b', leagueId: 'league-b' }), seasonKey: '25_26' },
          league: league('league-b'),
        },
      ],
    })

    expect(rows.map(row => row.clubId).sort()).toEqual(['club-a', 'club-b'])
    expect(rows.filter(row => row.clubId === 'club-b')).toHaveLength(1)
  })
  test('does not include a counterpart Club from another season even with the same movementId', () => {
    const rows = buildExpectedRosterClubsV2({
      canonical: {
        birthTeamDocumentId: 'team-a',
        seasonKey: '26_27',
        teamRoot: teamRoot({ teamId: 'team-a', clubId: 'club-a' }),
        teamSeason: teamSeason({ teamId: 'team-a', leagueId: 'league-a' }),
        league: league('league-a'),
      },
      expectedCounterparts: [{
        movementId: 'm1',
        target: {
          birthTeamDocumentId: 'team-b',
          seasonKey: '26_27',
          side: 'transfersIn',
        },
      }],
      counterpartCanonical: [{
        birthTeamDocumentId: 'team-b',
        seasonKey: '25_26',
        teamRoot: teamRoot({ teamId: 'team-b', clubId: 'club-b' }),
        teamSeason: {
          ...teamSeason({
            teamId: 'team-b',
            leagueId: 'league-b',
            movementId: 'm1',
          }),
          seasonKey: '25_26',
          seasonId: '25_26',
        },
        league: league('league-b'),
      }],
    })

    expect(rows.map(row => row.clubId)).toEqual(['club-a'])
  })

})
