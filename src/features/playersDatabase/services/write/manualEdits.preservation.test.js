// src/features/playersDatabase/services/write/manualEdits.preservation.test.js

import { updateClubUrl } from './club/edits/updateClubUrl.js'
import {
  updateLeagueCompetitionRules,
} from './league/edits/updateLeagueCompetitionRules.js'
import { updateLeagueSeasonUrl } from './league/edits/updateLeagueSeasonUrl.js'
import { updateTeamSeasonUrl } from './league/edits/updateTeamSeasonUrl.js'
import {
  updatePlayerAgent,
  updatePlayerNotes,
  updatePlayerRole,
} from './player/edits/updatePlayerRootManual.js'
import {
  updatePlayerSeasonGoalDistribution,
  updatePlayerSeasonUrl,
} from './roster/edits/updatePlayerSeasonManual.js'
import {
  executeManualEdit,
  readManualEditDocument,
  readManualEditRefs,
} from './shared/manualEdit.write.js'

const mockSnapshots = {}
const mockIndexRefs = []

const snapshot = (data, exists = true) => ({
  exists: () => exists,
  data: () => data,
})

jest.mock('./shared/manualEdit.write.js', () => ({
  executeManualEdit: jest.fn(),
  manualEditRef: (collectionKey, documentId) => ({
    path: `${collectionKey}/${documentId}`,
  }),
  readManualEditDocument: jest.fn(),
  readManualEditRefs: jest.fn(),
  requireManualEditDocument: value => {
    if (!value || !value.exists()) throw new Error('missing document')
    return value.data()
  },
}))

const patchFor = (result, path) => (
  result.changes.find(change => change.ref.path === path)?.patch
)

beforeEach(() => {
  Object.keys(mockSnapshots).forEach(key => delete mockSnapshots[key])
  mockIndexRefs.splice(0)
  executeManualEdit.mockImplementation(async ({ refs, build }) => ({
    completed: true,
    refs,
    changes: build({
      get: ref => mockSnapshots[ref.path],
      updatedAt: 'updated-time',
    }),
  }))
  readManualEditDocument.mockImplementation(async ref => mockSnapshots[ref.path])
  readManualEditRefs.mockImplementation(async () => mockIndexRefs)
})

test('Club URL edit preserves the canonical profile and directory entry fields', async () => {
  mockSnapshots['clubProfiles/club-a'] = snapshot({
    clubId: 'club-a',
    clubUrl: 'https://old.test',
    names: { display: 'Club A' },
    aliases: ['A'],
    clubLevel: 2,
  })
  mockSnapshots['clubsDirectory/all'] = snapshot({
    clubsById: {
      'club-a': {
        clubUrl: 'https://old.test',
        names: { display: 'Club A' },
        searchAliases: ['Club A'],
        clubLevel: 2,
      },
    },
  })

  const result = await updateClubUrl({
    clubId: 'club-a',
    clubUrl: 'https://new.test',
  })
  const directoryPatch = patchFor(result, 'clubsDirectory/all')

  expect(patchFor(result, 'clubProfiles/club-a')).toEqual({
    clubUrl: 'https://new.test',
  })
  expect(directoryPatch['clubsById.club-a']).toEqual(expect.objectContaining({
    clubUrl: 'https://new.test',
    names: { display: 'Club A' },
    searchAliases: ['Club A'],
    clubLevel: 2,
  }))
})

test('League URL and rules edits preserve official table and unrelated season fields', async () => {
  const leagueSeason = {
    seasonUrl: 'https://old.test/league',
    seasonKey: '26/27',
    birthYear: 2011,
    competitionRules: { configured: false },
    table: { tableState: 'LOADED', teamsById: {} },
    performanceCalculation: { engineVersion: 'engine-1' },
  }
  const centerSeason = {
    seasonUrl: 'https://old.test/league',
    seasonKey: '26/27',
    teamsById: { keep: { teamId: 'keep' } },
    hasCompetitionRules: false,
  }
  mockSnapshots['leagues/league-a'] = snapshot({
    leagueId: 'league-a',
    seasonsById: { '2026_2027': leagueSeason },
  })
  mockSnapshots['leaguesCenter/all'] = snapshot({
    leaguesById: {
      'league-a': { seasonsById: { '2026_2027': centerSeason } },
    },
  })
  mockSnapshots['clubsCenter/2026_2027'] = snapshot({ clubsById: {} })

  const urlResult = await updateLeagueSeasonUrl({
    leagueId: 'league-a',
    seasonId: '2026_2027',
    seasonUrl: 'https://new.test/league',
  })
  const urlSeason = patchFor(urlResult, 'leagues/league-a')['seasonsById.2026_2027']

  expect(urlSeason).toEqual(expect.objectContaining({
    seasonUrl: 'https://new.test/league',
    table: leagueSeason.table,
    competitionRules: leagueSeason.competitionRules,
    performanceCalculation: leagueSeason.performanceCalculation,
  }))

  const rules = {
    configured: true,
    promotion: { enabled: true, directPlaces: [1], playoffPlaces: [] },
    relegation: { enabled: false, directPlaces: [], playoffPlaces: [] },
  }
  const rulesResult = await updateLeagueCompetitionRules({
    leagueId: 'league-a',
    seasonId: '2026_2027',
    competitionRules: rules,
  })
  const rulesSeason = patchFor(rulesResult, 'leagues/league-a')['seasonsById.2026_2027']
  const rulesCenter = patchFor(rulesResult, 'leaguesCenter/all')
    ['leaguesById.league-a.seasonsById.2026_2027']

  expect(rulesSeason.table).toBe(leagueSeason.table)
  expect(rulesSeason.performanceCalculation).toBe(leagueSeason.performanceCalculation)
  expect(rulesCenter.teamsById).toBe(centerSeason.teamsById)
  expect(rulesCenter.hasCompetitionRules).toBe(true)
})

test('Team URL edit preserves League performance, Team Season state and SearchIndex fields', async () => {
  const indexRef = { path: 'playerSearchIndexes/index-a' }
  mockIndexRefs.push(indexRef)
  mockSnapshots['leagues/league-a'] = snapshot({
    leagueId: 'league-a',
    seasonsById: {
      '2026_2027': {
        table: {
          teamsById: {
            'club-a_2011_1': {
              clubId: 'club-a',
              teamUrl: 'https://old.test/team',
              officialTable: { rank: 1, points: 20 },
              performance: { offense: { rank: 2 } },
              roster: { playersCount: 18 },
            },
          },
        },
      },
    },
  })
  mockSnapshots['teamSeasons/club-a_2011_1__2026_2027'] = snapshot({
    identity: {
      teamSeasonDocumentId: 'club-a_2011_1__2026_2027',
      teamId: 'club-a_2011_1',
      seasonId: '2026_2027',
    },
    competitionSnapshot: {
      teamUrl: 'https://old.test/team',
      officialTable: { rank: 1 },
      clubLevel: 2,
    },
    roster: { playersById: { keep: {} } },
    stats: { statsLoadState: { status: 'loaded' } },
  })
  mockSnapshots[indexRef.path] = snapshot({
    playerId: 'player-a',
    seasonId: '2026_2027',
    team: {
      teamId: 'club-a_2011_1',
      teamUrl: 'https://old.test/team',
      name: 'Team A',
      officialTable: { rank: 1 },
    },
    player: { fullName: 'Player A' },
  })

  const result = await updateTeamSeasonUrl({
    leagueId: 'league-a',
    teamId: 'club-a_2011_1',
    teamSeasonDocumentId: 'club-a_2011_1__2026_2027',
    seasonId: '2026_2027',
    teamUrl: 'https://new.test/team',
  })
  const leagueTeam = patchFor(result, 'leagues/league-a')
    ['seasonsById.2026_2027.table.teamsById.club-a_2011_1']
  const teamSeasonPatch = patchFor(
    result,
    'teamSeasons/club-a_2011_1__2026_2027',
  )
  const indexPatch = patchFor(result, indexRef.path)

  expect(leagueTeam).toEqual(expect.objectContaining({
    teamUrl: 'https://new.test/team',
    officialTable: { rank: 1, points: 20 },
    performance: { offense: { rank: 2 } },
    roster: { playersCount: 18 },
  }))
  expect(teamSeasonPatch.competitionSnapshot).toEqual(expect.objectContaining({
    teamUrl: 'https://new.test/team',
    officialTable: { rank: 1 },
    clubLevel: 2,
  }))
  expect(indexPatch.team).toEqual(expect.objectContaining({
    teamUrl: 'https://new.test/team',
    name: 'Team A',
    officialTable: { rank: 1 },
  }))
})

test('Player Root edits preserve fields outside notes, agent and professional role', async () => {
  const indexRef = { path: 'playerSearchIndexes/index-a' }
  mockIndexRefs.push(indexRef)
  mockSnapshots['playerRoots/player-a'] = snapshot({
    identity: { playerId: 'player-a' },
    notes: 'old note',
    agent: { status: 'unknown', phones: '', keep: 'agent-extra' },
    primaryPosition: 'CB',
    positionLayer: 'defense',
    tracking: { followed: true },
    seasonRefsById: { '2026_2027': { keep: true } },
  })
  mockSnapshots[indexRef.path] = snapshot({
    playerId: 'player-a',
    references: { teamSeasonDocumentId: 'team-a__2026_2027' },
    player: {
      fullName: 'Player A',
      notes: 'old note',
      primaryPosition: 'CB',
      positionLayer: 'defense',
      statsStatus: 'loaded',
    },
  })
  mockSnapshots['teamSeasons/team-a__2026_2027'] = snapshot({
    scouting: {
      playersById: {
        'player-a': {
          primaryPosition: 'CB',
          positionLayer: 'defense',
          professionalProfileIds: ['profile-a'],
          playerStats: { goals: 3 },
        },
      },
    },
  })

  const notesResult = await updatePlayerNotes({ playerId: 'player-a', notes: 'new note' })
  const agentResult = await updatePlayerAgent({
    playerId: 'player-a',
    agent: { status: 'yes', phones: '050' },
  })
  const roleResult = await updatePlayerRole({
    playerId: 'player-a',
    primaryPosition: 'DM',
    positionLayer: 'midfield',
  })

  expect(patchFor(notesResult, 'playerRoots/player-a')).toEqual({ notes: 'new note' })
  expect(patchFor(agentResult, 'playerRoots/player-a')).toEqual({
    agent: { status: 'yes', phones: '050', updatedAt: 'updated-time' },
  })
  expect(patchFor(roleResult, indexRef.path).player).toEqual(expect.objectContaining({
    fullName: 'Player A',
    statsStatus: 'loaded',
    primaryPosition: 'DM',
    positionLayer: 'midfield',
  }))
  expect(patchFor(roleResult, 'teamSeasons/team-a__2026_2027')
    ['scouting.playersById.player-a']).toEqual(expect.objectContaining({
    professionalProfileIds: ['profile-a'],
    playerStats: { goals: 3 },
    primaryPosition: 'DM',
    positionLayer: 'midfield',
  }))
})

test('Player Season edits preserve roster, Stats, Movement and neighboring manual fields', async () => {
  const teamSeasonId = 'team-a__2026_2027'
  const playerSeasonId = 'playerSeason__player-a__2026_2027'
  const searchIndexId = 'playerSeason__player-a__team-a__2026_2027'
  mockSnapshots[`teamSeasons/${teamSeasonId}`] = snapshot({
    identity: {
      teamSeasonDocumentId: teamSeasonId,
      teamId: 'team-a',
      seasonId: '2026_2027',
    },
    roster: { playersById: { 'player-a': { fullName: 'Player A' } } },
    stats: {
      playersById: {
        'player-a': { playerStats: { games: 10, goals: 4 } },
      },
    },
    movement: { transfersInById: { keep: { movementId: 'keep' } } },
    manual: {
      playersById: {
        'player-a': {
          playerUrl: 'https://old.test/player',
          note: 'keep',
          goalDistribution: { scoringGames: 1, distributionPct: 10 },
        },
      },
    },
  })
  mockSnapshots[`playerSeasons/${playerSeasonId}`] = snapshot({
    identity: { playerId: 'player-a', seasonId: '2026_2027' },
    teamsById: {
      'team-a': {
        roster: { status: 'regular' },
        stats: { goals: 4 },
        manual: {
          playerUrl: 'https://old.test/player',
          note: 'keep',
          goalDistribution: { scoringGames: 1, distributionPct: 10 },
        },
      },
    },
  })
  mockSnapshots[`playerSearchIndexes/${searchIndexId}`] = snapshot({
    playerId: 'player-a',
    seasonId: '2026_2027',
    references: { teamSeasonDocumentId: teamSeasonId },
    player: {
      fullName: 'Player A',
      playerUrl: 'https://old.test/player',
      statsStatus: 'loaded',
    },
  })
  const input = {
    playerId: 'player-a',
    teamId: 'team-a',
    teamSeasonDocumentId: teamSeasonId,
    seasonId: '2026_2027',
  }

  const urlResult = await updatePlayerSeasonUrl({
    ...input,
    playerUrl: 'https://new.test/player',
  })
  const distributionResult = await updatePlayerSeasonGoalDistribution({
    ...input,
    scoringGames: 2,
  })
  const teamUrlPatch = patchFor(urlResult, `teamSeasons/${teamSeasonId}`)
  const playerUrlPatch = patchFor(urlResult, `playerSeasons/${playerSeasonId}`)
  const distributionPatch = patchFor(
    distributionResult,
    `teamSeasons/${teamSeasonId}`,
  )

  expect(teamUrlPatch.manual.playersById['player-a']).toEqual(expect.objectContaining({
    playerUrl: 'https://new.test/player',
    note: 'keep',
    goalDistribution: { scoringGames: 1, distributionPct: 10 },
  }))
  expect(playerUrlPatch.teamsById['team-a']).toEqual(expect.objectContaining({
    roster: { status: 'regular' },
    stats: { goals: 4 },
  }))
  expect(playerUrlPatch.teamsById['team-a'].manual).toEqual(expect.objectContaining({
    playerUrl: 'https://new.test/player',
    note: 'keep',
  }))
  expect(distributionPatch.manual.playersById['player-a']).toEqual(expect.objectContaining({
    playerUrl: 'https://old.test/player',
    note: 'keep',
    goalDistribution: expect.objectContaining({ scoringGames: 2, distributionPct: 20 }),
  }))
})
