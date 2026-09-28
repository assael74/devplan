jest.mock('../../../domain/statsV2/teamSeasonStats.builder.js', () => ({
  buildStatsScoutedPlayer: jest.fn(({ player }) => ({ ...player })),
}))

import { buildStatsScoutedPlayer } from '../../../domain/statsV2/teamSeasonStats.builder.js'
import { buildExpectedStatsPlayerDocumentsV2 } from './buildExpectedPlayerDocuments.js'

const canonical = {
  birthTeamDocumentId: 'team-1',
  seasonKey: '26_27',
  leagueId: 'league-1',
  teamRoot: {
    id: 'team-1',
    clubId: 'club-1',
    displayName: 'Team One',
    birthYear: 2012,
  },
  teamSeason: {
    seasonKey: '26_27',
    seasonId: '28',
    ageGroupId: 'u15',
    leagueId: 'league-1',
    teamPlayers: [{
      playerId: 'p1',
      externalPlayerId: 'p1',
      playerDocumentId: 'player-2012-p1',
      fullName: 'Player One',
      birthYear: 2012,
      scoutProfiles: [],
    }],
  },
  league: {
    id: 'league-1',
    leagueName: 'League One',
    ageGroupId: 'u15',
    ageGroupLabel: 'נערים ג',
    level: 2,
    current: {
      seasonKey: '26_27',
      seasonStatus: 'active',
      tableRank: [],
    },
    history: [],
  },
  club: {
    id: 'club-1',
    clubId: 'club-1',
    name: 'Club One',
    clubLevel: 1,
  },
}

describe('buildExpectedStatsPlayerDocumentsV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    buildStatsScoutedPlayer.mockImplementation(({ player }) => ({ ...player }))
  })

  test('uses canonical team, Club and League context', () => {
    const [row] = buildExpectedStatsPlayerDocumentsV2({
      canonical,
      existingPlayerDocumentIds: new Set(['player-2012-p1']),
    })

    expect(row.seasonRow).toEqual(expect.objectContaining({
      teamId: 'team-1',
      teamName: 'Team One',
      clubId: 'club-1',
      clubName: 'Club One',
      clubLevel: 1,
      ageGroupId: 'u15',
      ageGroupLabel: 'נערים ג',
      leagueId: 'league-1',
      leagueName: 'League One',
      leagueLevel: 2,
      seasonKey: '26_27',
      birthYear: 2012,
    }))
  })

  test('does not expect a missing Player Document without scouting', () => {
    expect(buildExpectedStatsPlayerDocumentsV2({
      canonical,
      existingPlayerDocumentIds: new Set(),
    })).toEqual([])
  })

  test('expects a missing Player Document when scouting is derived by projection', () => {
    buildStatsScoutedPlayer.mockImplementation(({ player }) => ({
      ...player,
      scoutProfiles: [{ profileId: 'derived-profile' }],
    }))

    const rawPlayer = canonical.teamSeason.teamPlayers[0]
    expect(rawPlayer.scoutProfiles).toEqual([])

    const rows = buildExpectedStatsPlayerDocumentsV2({
      canonical,
      existingPlayerDocumentIds: new Set(),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0].player.scoutProfiles).toEqual([
      { profileId: 'derived-profile' },
    ])
  })
})
