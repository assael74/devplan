// src/features/playersDatabase/services/audit/league/buildExpected.test.js

import {
  buildEmptyCompetitionSnapshot,
  buildExpectedLeagueAudit,
  buildMissingLeagueExpected,
  collectLeagueSeasonClubIds,
} from './buildExpected.js'

const buildLeague = ({ tableState = 'LOADED', teamsById } = {}) => ({
  leagueId: 'league-1',
  names: { display: 'League 1' },
  region: 'center',
  ageGroupId: 'u15',
  ageGroupLabel: 'U15',
  level: 2,
  seasonsById: {
    '2026_2027': {
      seasonKey: '26/27',
      seasonStatus: 'active',
      birthYear: 2012,
      seasonUrl: 'https://league.example',
      tableImportedAt: 'imported-at',
      competitionRules: { configured: true },
      table: {
        tableState,
        teamsById: teamsById === undefined ? {
          club_2012_1: {
            clubId: 'club',
            teamSlot: 1,
            clubLevel: 99,
            teamUrl: 'https://team.example',
            officialTable: {
              rank: 1,
              points: 10,
              goalsFor: 8,
              goalsAgainst: 2,
              teamGamePlayed: 4,
            },
          },
        } : teamsById,
      },
    },
  },
})

const clubProfilesById = {
  club: {
    id: 'club',
    names: {
      official: 'Official Club',
      display: 'Display Club',
      short: 'Short Club',
    },
    clubLevel: 3,
    clubStrengthLevel: 5,
  },
}

const teamSeason = {
  id: 'club_2012_1__2026_2027',
  identity: {
    teamId: 'club_2012_1',
    leagueId: 'league-1',
    seasonId: '2026_2027',
  },
  roster: {
    playersById: { player_1: { fullName: 'Player' } },
  },
  stats: {
    statsLoadState: { status: 'loaded' },
  },
  teamTaskSignals: {
    offense: true,
    defense: false,
    updatedAt: 'signals-updated',
  },
}

test('builds the complete LeaguesCenter season payload shape accepted by the writer', () => {
  const expected = buildExpectedLeagueAudit({
    league: buildLeague(),
    seasonId: '2026_2027',
    clubProfilesById,
    teamSeasons: [teamSeason],
  })

  expect(expected.leaguesCenter.season).toEqual({
    seasonKey: '26/27',
    seasonStatus: 'active',
    birthYear: 2012,
    seasonUrl: 'https://league.example',
    hasCompetitionRules: true,
    tableState: 'LOADED',
    tableImportedAt: 'imported-at',
    teamsById: {
      club_2012_1: {
        clubId: 'club',
        teamSlot: 1,
        documentationState: 'STATS_LOADED',
        documentationStateUpdatedAt: null,
        teamTaskSignals: {
          offense: true,
          defense: false,
          updatedAt: 'signals-updated',
        },
      },
    },
    updatedAt: null,
  })
})

test('builds ClubProfile and League owned ClubsCenter fields plus Team Season state inputs', () => {
  const expected = buildExpectedLeagueAudit({
    league: buildLeague(),
    seasonId: '2026_2027',
    clubProfilesById,
    teamSeasons: [teamSeason],
  })

  expect(expected.clubsCenter.clubsById.club).toMatchObject({
    clubProfileAvailable: true,
    displayName: 'Display Club',
    shortName: 'Short Club',
    clubLevel: 3,
    clubStrengthLevel: 5,
  })
  expect(expected.clubsCenter.clubsById.club.teamsById.club_2012_1).toMatchObject({
    teamSeasonDocumentId: 'club_2012_1__2026_2027',
    birthYear: 2012,
    ageGroupId: 'u15',
    teamSlot: 1,
    leagueId: 'league-1',
    documentationState: 'STATS_LOADED',
    documentationStateUpdatedAt: null,
    teamTaskSignals: {
      offense: true,
      defense: false,
      updatedAt: 'signals-updated',
    },
    performance: {
      tableRank: 1,
      points: 10,
      teamGamePlayed: 4,
    },
    updatedAt: null,
  })
  expect(expected.clubsCenter.clubsById.club.teamsById.club_2012_1.transfers)
    .toMatchObject({ coverageStatus: 'NOT_LOADED', pending: { total: 0 } })
  expect(expected.clubsCenter.clubsById.club.teamsById.club_2012_1.competitionProjection)
    .toHaveProperty('effective')
})

test('builds the full competitionSnapshot writer payload only for an existing Team Season', () => {
  const expected = buildExpectedLeagueAudit({
    league: buildLeague(),
    seasonId: '2026_2027',
    clubProfilesById,
    teamSeasons: [teamSeason],
  })

  expect(expected.teamSeasonCompetitionSnapshots).toEqual([{
    teamId: 'club_2012_1',
    clubId: 'club',
    teamSeasonDocumentId: 'club_2012_1__2026_2027',
    clubProfileAvailable: true,
    expectedFields: {
      teamUrl: 'https://team.example',
      clubLevel: 3,
      clubStrengthLevel: 5,
      officialTable: {
        rank: 1,
        points: 10,
        goalsFor: 8,
        goalsAgainst: 2,
        teamGamePlayed: 4,
      },
      updatedAt: null,
    },
  }])

  const withoutTeamSeason = buildExpectedLeagueAudit({
    league: buildLeague(),
    seasonId: '2026_2027',
    clubProfilesById,
    teamSeasons: [],
  })
  expect(withoutTeamSeason.teamSeasonCompetitionSnapshots).toEqual([])
})

test('clear keeps the season in Centers with NOT_LOADED and no team projections', () => {
  const expected = buildExpectedLeagueAudit({
    league: buildLeague({ tableState: 'NOT_LOADED', teamsById: {} }),
    seasonId: '2026_2027',
    clubProfilesById: {},
    teamSeasons: [teamSeason],
  })

  expect(expected.seasonExists).toBe(true)
  expect(expected.leaguesCenter.season).toMatchObject({
    seasonKey: '26/27',
    seasonStatus: 'active',
    tableState: 'NOT_LOADED',
    tableImportedAt: 'imported-at',
    teamsById: {},
  })
  expect(expected.clubsCenter).toMatchObject({
    seasonId: '2026_2027',
    seasonKey: '26/27',
    seasonStatus: 'active',
    clubsById: {},
  })
})

test('deleted season expected state does not depend on deleted seasonKey or seasonStatus', () => {
  const league = buildLeague()
  delete league.seasonsById['2026_2027']

  expect(buildExpectedLeagueAudit({
    league,
    seasonId: '2026_2027',
    teamSeasons: [teamSeason],
  })).toMatchObject({
    leagueExists: true,
    seasonExists: false,
    leaguesCenter: { season: null },
    clubsCenter: { league: null, clubsById: {} },
    teamSeasonCompetitionSnapshots: [],
  })
})

test('reports a missing ClubProfile dependency without trusting the League clubLevel snapshot', () => {
  const expected = buildExpectedLeagueAudit({
    league: buildLeague(),
    seasonId: '2026_2027',
    clubProfilesById: {},
    teamSeasons: [teamSeason],
  })

  expect(expected.missingCanonicalDependencies).toEqual([
    expect.objectContaining({
      type: 'missing_canonical_dependency',
      target: 'clubProfile',
      documentId: 'club',
    }),
  ])
  expect(expected.teamSeasonCompetitionSnapshots[0].expectedFields).toEqual({
    teamUrl: 'https://team.example',
    officialTable: expect.any(Object),
    updatedAt: null,
  })
})

test('collects unique ClubProfile ids and represents missing League as projection absence', () => {
  expect(collectLeagueSeasonClubIds({
    league: buildLeague(),
    seasonId: '2026_2027',
  })).toEqual(['club'])

  expect(buildMissingLeagueExpected({
    leagueId: 'league-1',
    seasonId: '2026_2027',
  })).toMatchObject({
    leagueExists: false,
    seasonExists: false,
    leaguesCenter: { identity: null, season: null },
    clubsCenter: { league: null, clubsById: {} },
  })
})

test('empty competition snapshot matches the full Team Season writer contract shape', () => {
  expect(buildEmptyCompetitionSnapshot()).toEqual({
    teamUrl: '',
    clubLevel: null,
    clubStrengthLevel: null,
    officialTable: {
      rank: null,
      points: null,
      goalsFor: null,
      goalsAgainst: null,
      teamGamePlayed: null,
    },
    updatedAt: null,
  })
})
