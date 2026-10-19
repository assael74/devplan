// src/features/playersDatabase/services/audit/league/compare.test.js

import {
  buildExpectedLeagueAudit,
  buildMissingLeagueExpected,
} from './buildExpected.js'
import { compareLeagueAudit } from './compare.js'

const league = {
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
      seasonUrl: 'league-url',
      tableImportedAt: 'imported-at',
      competitionRules: { configured: true },
      updatedAt: 'snapshot-at',
      table: {
        tableState: 'LOADED',
        teamsById: {
          club_2012_1: {
            clubId: 'club',
            teamSlot: 1,
            clubLevel: 99,
            teamUrl: 'team-url',
            officialTable: {
              rank: 1,
              points: 10,
              goalsFor: 8,
              goalsAgainst: 2,
              teamGamePlayed: 4,
            },
          },
        },
      },
    },
  },
}

const clubProfilesById = {
  club: {
    id: 'club',
    names: { display: 'Club Display', short: 'Club Short' },
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
  roster: { playersById: { player_1: {} } },
  stats: { statsLoadState: { status: 'loaded' } },
  teamTaskSignals: {
    offense: true,
    defense: false,
    updatedAt: 'signals-at',
  },
}

const expected = buildExpectedLeagueAudit({
  league,
  seasonId: '2026_2027',
  clubProfilesById,
  teamSeasons: [teamSeason],
})

const clone = value => JSON.parse(JSON.stringify(value))

const cleanActual = () => ({
  leaguesCenter: {
    leaguesById: {
      'league-1': {
        identity: clone(expected.leaguesCenter.identity),
        seasonsById: {
          '2026_2027': clone(expected.leaguesCenter.season),
        },
      },
    },
  },
  clubsCenter: {
    seasonId: '2026_2027',
    seasonKey: '26/27',
    seasonStatus: 'active',
    leaguesById: {
      'league-1': clone(expected.clubsCenter.league),
    },
    clubsById: {
      club: {
        displayName: 'Club Display',
        shortName: 'Club Short',
        clubLevel: 3,
        clubStrengthLevel: 5,
        teamsById: {
          club_2012_1: {
            ...expected.clubsCenter.clubsById.club.teamsById.club_2012_1,
          },
        },
      },
    },
  },
  teamSeasons: [{
    ...teamSeason,
    competitionSnapshot: {
      ...clone(expected.teamSeasonCompetitionSnapshots[0].expectedFields),
      updatedAt: 'snapshot-at',
    },
  }],
})

test('accepts clean League Load projections and ignores non-auditable ClubsCenter derived fields', () => {
  expect(compareLeagueAudit({ expected, actual: cleanActual() })).toEqual([])
})

test.each(['2026-10-11T03:39:28.862Z', 'older-write', null])(
  'ignores operational timestamp-only differences in League Center and competition snapshots: %s',
  updatedAt => {
    const actual = cleanActual()
    actual.leaguesCenter.leaguesById['league-1'].seasonsById['2026_2027'].updatedAt = updatedAt
    actual.teamSeasons[0].competitionSnapshot.updatedAt = updatedAt

    expect(compareLeagueAudit({ expected, actual })).toEqual([])
  }
)

test('still detects changed season and competition data when operational timestamps differ', () => {
  const actual = cleanActual()
  const season = actual.leaguesCenter.leaguesById['league-1'].seasonsById['2026_2027']
  season.updatedAt = 'later-stats-write'
  season.seasonStatus = 'completed'
  actual.teamSeasons[0].competitionSnapshot.updatedAt = 'later-roster-write'
  actual.teamSeasons[0].competitionSnapshot.officialTable.points = 99

  expect(compareLeagueAudit({ expected, actual })).toEqual([
    expect.objectContaining({ target: 'leaguesCenter', type: 'projection_mismatch' }),
    expect.objectContaining({ target: 'teamSeasonCompetitionSnapshots', type: 'projection_mismatch' }),
  ])
})

test('ignores retained legacy task timestamps when auditing current projection fields', () => {
  const actual = cleanActual()
  actual.leaguesCenter.leaguesById['league-1'].seasonsById['2026_2027']
    .teamsById.club_2012_1.teamTaskSignals = { offense: true, updatedAt: 'stale-signal' }

  expect(compareLeagueAudit({ expected, actual })).toEqual([])
})

test('detects Team Season-owned documentation state mismatches in both Centers', () => {
  const actual = cleanActual()
  actual.leaguesCenter.leaguesById['league-1'].seasonsById['2026_2027'].teamsById.club_2012_1 = {
    ...actual.leaguesCenter.leaguesById['league-1'].seasonsById['2026_2027'].teamsById.club_2012_1,
    documentationState: 'NO_ROSTER',
  }
  actual.clubsCenter.clubsById.club.teamsById.club_2012_1 = {
    ...actual.clubsCenter.clubsById.club.teamsById.club_2012_1,
    documentationState: 'NO_ROSTER',
    teamTaskSignals: { offense: false, defense: false, updatedAt: 'different' },
  }

  expect(compareLeagueAudit({ expected, actual })).toEqual(expect.arrayContaining([
    expect.objectContaining({ target: 'leaguesCenter', type: 'projection_mismatch' }),
    expect.objectContaining({ target: 'clubsCenter', type: 'projection_mismatch' }),
  ]))
})

test('Team Season missing during League Load is not a finding', () => {
  const withoutTeamSeason = buildExpectedLeagueAudit({
    league,
    seasonId: '2026_2027',
    clubProfilesById,
    teamSeasons: [],
  })
  const actual = cleanActual()
  actual.leaguesCenter.leaguesById['league-1'].seasonsById['2026_2027'] = withoutTeamSeason.leaguesCenter.season
  actual.clubsCenter.clubsById.club.teamsById.club_2012_1 = {
    ...withoutTeamSeason.clubsCenter.clubsById.club.teamsById.club_2012_1,
  }
  actual.teamSeasons = []

  expect(compareLeagueAudit({ expected: withoutTeamSeason, actual })).toEqual([])
})

test('detects ClubProfile-owned projection mismatch independently from League snapshot', () => {
  const actual = cleanActual()
  actual.clubsCenter.clubsById.club.clubStrengthLevel = 9
  actual.teamSeasons[0].competitionSnapshot.clubStrengthLevel = 9

  expect(compareLeagueAudit({ expected, actual })).toEqual(expect.arrayContaining([
    expect.objectContaining({
      type: 'projection_mismatch',
      target: 'clubsCenter',
      field: 'clubsById.club.profile',
    }),
    expect.objectContaining({
      type: 'projection_mismatch',
      target: 'teamSeasonCompetitionSnapshots',
      documentId: 'club_2012_1__2026_2027',
    }),
  ]))
})

test('missing League with no matching projections is clean and stale projections are reported', () => {
  const missingExpected = buildMissingLeagueExpected({
    leagueId: 'league-1',
    seasonId: '2026_2027',
  })

  expect(compareLeagueAudit({
    expected: missingExpected,
    actual: {
      leaguesCenter: { leaguesById: { 'other-league': {} } },
      clubsCenter: { leaguesById: {}, clubsById: {} },
      teamSeasons: [],
    },
  })).toEqual([])

  const findings = compareLeagueAudit({
    expected: missingExpected,
    actual: {
      leaguesCenter: {
        leaguesById: { 'league-1': { identity: { leagueName: 'stale' } } },
      },
      clubsCenter: {
        leaguesById: { 'league-1': { displayName: 'stale' } },
        clubsById: {
          old: {
            teamsById: {
              old_team: { leagueId: 'league-1' },
            },
          },
        },
      },
      teamSeasons: [{
        id: 'old_team__2026_2027',
        identity: { teamId: 'old_team', leagueId: 'league-1', seasonId: '2026_2027' },
        competitionSnapshot: {
          teamUrl: 'stale',
          clubLevel: 2,
          clubStrengthLevel: 3,
          officialTable: { rank: 1 },
          updatedAt: 'stale',
        },
      }],
    },
  })

  expect(findings).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'stale_projection', target: 'leaguesCenter' }),
    expect.objectContaining({ type: 'stale_projection', target: 'clubsCenter' }),
    expect.objectContaining({ type: 'stale_projection', target: 'teamSeasonCompetitionSnapshots' }),
  ]))
})

test('detects the same teamId under a stale clubId', () => {
  const actual = cleanActual()
  actual.clubsCenter.clubsById.old_club = {
    teamsById: {
      club_2012_1: {
        ...expected.clubsCenter.clubsById.club.teamsById.club_2012_1,
      },
    },
  }

  expect(compareLeagueAudit({ expected, actual })).toEqual(expect.arrayContaining([
    expect.objectContaining({
      type: 'stale_projection',
      target: 'clubsCenter',
      field: 'clubsById.old_club.teamsById.club_2012_1',
    }),
  ]))
})

test('League Teams Clear keeps Centers season, removes teams and requires full empty snapshots', () => {
  const clearedLeague = JSON.parse(JSON.stringify(league))
  clearedLeague.seasonsById['2026_2027'].table = {
    tableState: 'NOT_LOADED',
    teamsById: {},
  }
  clearedLeague.seasonsById['2026_2027'].updatedAt = 'cleared-at'
  const clearedExpected = buildExpectedLeagueAudit({
    league: clearedLeague,
    seasonId: '2026_2027',
    clubProfilesById: {},
    teamSeasons: [teamSeason],
  })
  const actual = {
    leaguesCenter: {
      leaguesById: {
        'league-1': {
          identity: clearedExpected.leaguesCenter.identity,
          seasonsById: { '2026_2027': clearedExpected.leaguesCenter.season },
        },
      },
    },
    clubsCenter: {
      seasonId: '2026_2027',
      seasonKey: '26/27',
      seasonStatus: 'active',
      leaguesById: { 'league-1': clearedExpected.clubsCenter.league },
      clubsById: {},
    },
    teamSeasons: [{
      ...teamSeason,
      competitionSnapshot: {
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
        updatedAt: 'different-operational-timestamp',
      },
    }],
  }

  expect(compareLeagueAudit({ expected: clearedExpected, actual })).toEqual([])

  actual.teamSeasons[0].competitionSnapshot.teamUrl = 'stale'
  expect(compareLeagueAudit({ expected: clearedExpected, actual })).toEqual(expect.arrayContaining([
    expect.objectContaining({
      type: 'stale_projection',
      target: 'teamSeasonCompetitionSnapshots',
    }),
  ]))
})

test('League Season Delete removes both Centers metadata and requires empty snapshots without season display facts', () => {
  const deletedLeague = JSON.parse(JSON.stringify(league))
  delete deletedLeague.seasonsById['2026_2027']
  deletedLeague.timestamps = { updatedAt: 'deleted-at' }
  const deletedExpected = buildExpectedLeagueAudit({
    league: deletedLeague,
    seasonId: '2026_2027',
    teamSeasons: [teamSeason],
  })

  const actual = {
    leaguesCenter: {
      leaguesById: {
        'league-1': {
          identity: deletedExpected.leaguesCenter.identity,
          seasonsById: {},
        },
      },
    },
    clubsCenter: {
      seasonId: '2026_2027',
      seasonKey: 'legacy-value-is-irrelevant',
      seasonStatus: 'legacy-value-is-irrelevant',
      leaguesById: {},
      clubsById: {},
    },
    teamSeasons: [{
      ...teamSeason,
      competitionSnapshot: {
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
        updatedAt: 'deleted-at',
      },
    }],
  }

  expect(compareLeagueAudit({ expected: deletedExpected, actual })).toEqual([])
})

test('missing Center is reported only when canonical state requires that projection', () => {
  expect(compareLeagueAudit({
    expected,
    actual: {
      leaguesCenter: null,
      clubsCenter: null,
      teamSeasons: [teamSeason],
    },
  })).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'missing_projection', target: 'leaguesCenter' }),
    expect.objectContaining({ type: 'missing_projection', target: 'clubsCenter' }),
  ]))
})
