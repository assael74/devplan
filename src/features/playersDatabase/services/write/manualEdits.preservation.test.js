// src/features/playersDatabase/services/write/manualEdits.preservation.test.js

import { updateClubUrl } from './club/edits/updateClubUrl.js'
import { buildPlayerSeasonProjection } from '../../domain/stats/statsProjection.builder.js'
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

const applyPatch = (document, patch = {}) => {
  const result = JSON.parse(JSON.stringify(document))
  Object.entries(patch).forEach(([field, value]) => {
    const keys = field.split('.')
    const lastKey = keys.pop()
    const parent = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, result)
    parent[lastKey] = value
  })
  return result
}

const seedRoleProjectionSources = ({ loadedStats = true, teamIds = ['team-a'] } = {}) => {
  const playerId = 'player__2012__229642'
  const seasonId = '2025_2026'
  const leagueId = 'league-a'
  const playerSeasonDocumentId = `playerSeason__${playerId}__${seasonId}`
  const playerRoot = {
    identity: { playerId },
    primaryPosition: 'CB',
    positionLayer: 'defense',
    notes: 'keep root note',
  }
  const league = {
    id: leagueId,
    seasonsById: {
      [seasonId]: {
        seasonKey: '25/26',
        seasonStatus: 'completed',
        gameDurationMinutes: 80,
        table: { teamsById: {} },
      },
    },
  }
  const playerSeason = {
    identity: { playerId, seasonId },
    teamsById: { unrelated: { manual: { note: 'keep other team' } } },
  }
  const leaguesCenter = {
    leaguesById: {
      [leagueId]: {
        seasonsById: {
          [seasonId]: {
            seasonUrl: 'https://league.test/season',
            teamsById: { unrelated: { teamTaskSignals: { offense: false } } },
          },
        },
      },
    },
  }
  const clubsCenter = {
    clubsById: {
      unrelated: { teamsById: { unrelated: { rosterPlayersCount: 19 } } },
    },
  }

  teamIds.forEach((teamId, index) => {
    const clubId = `club-${index}`
    const teamSeasonDocumentId = `${teamId}__${seasonId}`
    const indexRef = { path: `playerSearchIndexes/${teamId}-role` }
    const teamSeason = {
      identity: {
        teamSeasonDocumentId,
        teamId,
        clubId,
        seasonId,
        leagueId,
        seasonKey: '25/26',
        seasonStatus: 'completed',
      },
      competitionSnapshot: { officialTable: { teamGamePlayed: 24 } },
      roster: {
        playersById: { [playerId]: { playerId, rosterStatus: 'regular' } },
      },
      stats: {
        playersById: {
          [playerId]: {
            statsStatus: loadedStats ? 'loaded' : 'not_loaded',
            playerStats: { games: 21, goals: 0, minutes: 1412, starts: 18, teamGamePlayed: 24 },
            lineClassification: { line: 'DEFENSE' },
          },
        },
      },
      scouting: {
        updatedAt: 'old-scouting-time',
        playersById: {
          [playerId]: {
            primaryPosition: 'CB',
            positionLayer: 'defense',
            professionalProfileIds: ['profile-a'],
            evidence: { capturedAt: 'source-evidence-time', projected: { goals: 3 } },
            updatedAt: 'old-scouting-time',
          },
        },
      },
    }
    const teamRow = {
      clubId,
      officialTable: { teamGamePlayed: 24, goalsFor: 40, goalsAgainst: 20 },
      performance: {
        offense: { priorityLevel: 'elite' },
        defense: { priorityLevel: 'high' },
      },
      scouting: { teamTaskSignals: { offense: false, defense: false, updatedAt: 'old-time' } },
    }
    league.seasonsById[seasonId].table.teamsById[teamId] = teamRow
    playerSeason.teamsById[teamId] = {
      teamSeasonDocumentId,
      stats: { custom: 'keep stats', lineClassification: { line: 'DEFENSE' } },
      scouting: { professionalProfileIds: ['stale'], updatedAt: 'stale-time' },
      manual: { playerUrl: 'https://player.test/profile', note: 'keep manual' },
      movementsById: { move: { direction: 'in' } },
    }
    const centerTeam = {
      teamId,
      teamTaskSignals: { offense: false, defense: false, updatedAt: 'old-time' },
      documentationStateUpdatedAt: 'documentation-time',
      rosterPlayersCount: 18,
      transfers: { totalIn: 2, updatedAt: 'movement-time' },
    }
    leaguesCenter.leaguesById[leagueId].seasonsById[seasonId].teamsById[teamId] = centerTeam
    clubsCenter.clubsById[clubId] = {
      displayName: `Club ${index}`,
      teamsById: { [teamId]: { ...centerTeam, officialTable: teamRow.officialTable } },
    }
    mockIndexRefs.push(indexRef)
    mockSnapshots[indexRef.path] = snapshot({
      playerId,
      references: { teamSeasonDocumentId, playerSeasonDocumentId },
      player: { primaryPosition: 'CB', positionLayer: 'defense' },
      scoutEvidence: { capturedAt: 'source-evidence-time' },
    })
    mockSnapshots[`teamSeasons/${teamSeasonDocumentId}`] = snapshot(teamSeason)
  })
  mockSnapshots[`playerRoots/${playerId}`] = snapshot(playerRoot)
  mockSnapshots[`playerSeasons/${playerSeasonDocumentId}`] = snapshot(playerSeason)
  mockSnapshots[`leagues/${leagueId}`] = snapshot(league)
  mockSnapshots['leaguesCenter/all'] = snapshot(leaguesCenter)
  mockSnapshots[`clubsCenter/${seasonId}`] = snapshot(clubsCenter)
  return { playerId, seasonId, leagueId, playerSeasonDocumentId, league, playerSeason }
}

beforeEach(() => {
  jest.clearAllMocks()
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
      leagueId: 'league-a',
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
    leagueId: 'league-a',
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

test('Team URL edit rejects a mismatched season document id', async () => {
  await expect(updateTeamSeasonUrl({
    leagueId: 'league-a',
    teamId: 'team-a',
    teamSeasonDocumentId: 'another-team__2026_2027',
    seasonId: '2026_2027',
    teamUrl: 'https://new.test/team',
  })).rejects.toThrow('מזהה עונת הקבוצה סותר')
  expect(executeManualEdit).not.toHaveBeenCalled()
})

test('Team URL edit leaves another league search index untouched', async () => {
  const otherIndexRef = { path: 'playerSearchIndexes/other-league' }
  mockIndexRefs.push(otherIndexRef)
  mockSnapshots['leagues/league-a'] = snapshot({
    leagueId: 'league-a',
    seasonsById: {
      '2026_2027': {
        table: { teamsById: { 'team-a': { teamUrl: 'https://old.test/team' } } },
      },
    },
  })
  mockSnapshots['teamSeasons/team-a__2026_2027'] = snapshot({}, false)
  mockSnapshots[otherIndexRef.path] = snapshot({
    playerId: 'player-a',
    leagueId: 'league-b',
    seasonId: '2026_2027',
    team: { teamId: 'team-a', teamUrl: 'https://other.test/team' },
  })

  const result = await updateTeamSeasonUrl({
    leagueId: 'league-a',
    teamId: 'team-a',
    teamSeasonDocumentId: 'team-a__2026_2027',
    seasonId: '2026_2027',
    teamUrl: 'https://new.test/team',
  })
  expect(patchFor(result, otherIndexRef.path)).toBeUndefined()
  expect(patchFor(result, 'leagues/league-a')).toBeDefined()
})

test('Team URL edit refuses an existing Team Season from another league', async () => {
  mockSnapshots['leagues/league-a'] = snapshot({
    leagueId: 'league-a',
    seasonsById: {
      '2026_2027': {
        table: { teamsById: { 'team-a': { teamUrl: 'https://old.test/team' } } },
      },
    },
  })
  mockSnapshots['teamSeasons/team-a__2026_2027'] = snapshot({
    identity: {
      teamSeasonDocumentId: 'team-a__2026_2027',
      teamId: 'team-a',
      seasonId: '2026_2027',
      leagueId: 'league-b',
    },
  })

  await expect(updateTeamSeasonUrl({
    leagueId: 'league-a',
    teamId: 'team-a',
    teamSeasonDocumentId: 'team-a__2026_2027',
    seasonId: '2026_2027',
    teamUrl: 'https://new.test/team',
  })).rejects.toThrow('זהות עונת הקבוצה סותרת')
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
    identity: { teamId: 'team-a', seasonId: '2026_2027' },
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

test('Explicit role edit creates Player Root from canonical roster without requiring scouting', async () => {
  const indexRef = { path: 'playerSearchIndexes/roster-only' }
  mockIndexRefs.push(indexRef)
  mockSnapshots['playerRoots/player__2012__12345'] = snapshot({}, false)
  mockSnapshots[indexRef.path] = snapshot({
    playerId: 'player__2012__12345',
    references: { teamSeasonDocumentId: 'team-a__2026_2027' },
    player: { primaryPosition: '', positionLayer: '' },
  })
  mockSnapshots['teamSeasons/team-a__2026_2027'] = snapshot({
    identity: { seasonId: '2026_2027', seasonKey: '26/27', seasonStatus: 'active' },
    roster: {
      playersById: {
        'player__2012__12345': {
          externalPlayerId: '12345',
          fullName: 'שחקן',
          normalizedName: 'שחקן',
        },
      },
    },
    scouting: { playersById: {} },
  })

  const result = await updatePlayerRole({
    playerId: 'player__2012__12345',
    primaryPosition: 'CB',
    positionLayer: 'defense',
  })
  const rootChange = result.changes.find(change => (
    change.ref.path === 'playerRoots/player__2012__12345'
  ))
  expect(rootChange.document.identity.externalPlayerId).toBe('12345')
  expect(rootChange.document.primaryPosition).toBe('CB')
  expect(rootChange.document.seasonRefsById['2026_2027'].seasonKey).toBe('26/27')
  expect(patchFor(result, 'teamSeasons/team-a__2026_2027')).toBeUndefined()
  expect(patchFor(result, indexRef.path).player.primaryPosition).toBe('CB')
})

test('Player role edit rebuilds classification, Team Balance and Player Season projection', async () => {
  const playerId = 'player__2012__229642'
  const teamId = 'team-a'
  const seasonId = '2025_2026'
  const teamSeasonDocumentId = `${teamId}__${seasonId}`
  const playerSeasonDocumentId = `playerSeason__${playerId}__${seasonId}`
  const indexRef = { path: 'playerSearchIndexes/player-role' }
  mockIndexRefs.push(indexRef)
  mockSnapshots[`playerRoots/${playerId}`] = snapshot({
    identity: { playerId },
    primaryPosition: 'CB',
    positionLayer: 'defense',
  })
  mockSnapshots[indexRef.path] = snapshot({
    playerId,
    references: { teamSeasonDocumentId, playerSeasonDocumentId },
    player: { primaryPosition: 'CB', positionLayer: 'defense' },
  })
  mockSnapshots[`teamSeasons/${teamSeasonDocumentId}`] = snapshot({
    identity: {
      teamSeasonDocumentId,
      teamId,
      clubId: 'club-a',
      seasonId,
      seasonKey: '25/26',
      seasonStatus: 'completed',
      leagueId: 'league-a',
    },
    competitionSnapshot: {
      officialTable: { teamGamePlayed: 24 },
    },
    roster: {
      playersById: {
        [playerId]: { playerId, rosterStatus: 'regular' },
      },
    },
    stats: {
      playersById: {
        [playerId]: {
          statsStatus: 'loaded',
          playerStats: {
            games: 21,
            goals: 0,
            minutes: 1412,
            starts: 18,
            teamGamePlayed: 24,
          },
          lineClassification: { line: 'DEFENSE' },
        },
      },
    },
    scouting: {
      playersById: {
        [playerId]: {
          primaryPosition: 'CB',
          positionLayer: 'defense',
          professionalProfileIds: [],
        },
      },
    },
  })
  mockSnapshots['leagues/league-a'] = snapshot({
    id: 'league-a',
    seasonsById: {
      [seasonId]: {
        seasonKey: '25/26',
        seasonStatus: 'completed',
        gameDurationMinutes: 80,
        table: {
          teamsById: {
            [teamId]: {
              clubId: 'club-a',
              officialTable: {
                teamGamePlayed: 24,
                goalsFor: 40,
                goalsAgainst: 20,
              },
              performance: {
                offense: { priorityLevel: 'elite' },
                defense: { priorityLevel: 'high' },
              },
            },
          },
        },
      },
    },
  })
  mockSnapshots[`playerSeasons/${playerSeasonDocumentId}`] = snapshot({
    teamsById: {
      [teamId]: {
        teamSeasonDocumentId,
        stats: { lineClassification: { line: 'DEFENSE' } },
      },
    },
  })
  mockSnapshots['leaguesCenter/all'] = snapshot({
    leaguesById: {
      'league-a': { seasonsById: { [seasonId]: { teamsById: { [teamId]: {} } } } },
    },
  })
  mockSnapshots[`clubsCenter/${seasonId}`] = snapshot({
    clubsById: { 'club-a': { teamsById: { [teamId]: {} } } },
  })

  const result = await updatePlayerRole({
    playerId,
    primaryPosition: 'GK',
    positionLayer: 'goalkeeper',
  })
  const teamSeasonPatch = patchFor(result, `teamSeasons/${teamSeasonDocumentId}`)
  const playerSeasonPatch = patchFor(result, `playerSeasons/${playerSeasonDocumentId}`)

  expect(teamSeasonPatch[`stats.playersById.${playerId}`].lineClassification.line).toBe('')
  expect(teamSeasonPatch['stats.teamBalance'].lineStructure.goalkeeperPlayersCount).toBe(1)
  expect(playerSeasonPatch[`teamsById.${teamId}`].stats.lineClassification.line).toBe('')
  expect(patchFor(result, 'leagues/league-a')[
    `seasonsById.${seasonId}.table.teamsById.${teamId}.scouting.teamTaskSignals`
  ]).toEqual({ offense: true, defense: true, updatedAt: 'updated-time' })
})

test('Role edit propagates canonical scouting without loaded Stats and preserves source evidence', async () => {
  const { playerId, seasonId, league, playerSeasonDocumentId, playerSeason } = seedRoleProjectionSources({
    loadedStats: false,
  })
  const teamId = 'team-a'
  const teamSeasonPath = `teamSeasons/${teamId}__${seasonId}`
  const result = await updatePlayerRole({
    playerId,
    primaryPosition: 'DM',
    positionLayer: 'midfield',
  })
  const nextTeamSeason = applyPatch(mockSnapshots[teamSeasonPath].data(), patchFor(result, teamSeasonPath))
  const nextPlayerSeason = applyPatch(playerSeason, patchFor(result, `playerSeasons/${playerSeasonDocumentId}`))
  const expected = buildPlayerSeasonProjection({
    playerId,
    teamSeason: nextTeamSeason,
    league,
    seasonId,
    updatedAt: 'updated-time',
  })

  expect(nextPlayerSeason.teamsById[teamId].scouting).toEqual(expected.team.scouting)
  expect(nextPlayerSeason.teamsById[teamId].scouting.updatedAt).toBe('updated-time')
  expect(nextPlayerSeason.teamsById[teamId].scouting.evidence.capturedAt).toBe('source-evidence-time')
  expect(nextPlayerSeason.teamsById[teamId].scouting).not.toHaveProperty('primaryPosition')
  expect(nextPlayerSeason.teamsById[teamId].scouting).not.toHaveProperty('positionLayer')
  expect(nextPlayerSeason.teamsById[teamId].stats).toEqual(playerSeason.teamsById[teamId].stats)
  expect(nextPlayerSeason.teamsById[teamId].manual).toEqual(playerSeason.teamsById[teamId].manual)
  expect(nextPlayerSeason.teamsById[teamId].movementsById).toEqual(playerSeason.teamsById[teamId].movementsById)
  expect(nextPlayerSeason.teamsById.unrelated).toEqual(playerSeason.teamsById.unrelated)
  expect(patchFor(result, 'leaguesCenter/all')).toBeUndefined()
  expect(patchFor(result, `clubsCenter/${seasonId}`)).toBeUndefined()
  expect(patchFor(result, 'playerSearchIndexes/team-a-role')).not.toHaveProperty('scoutEvidence')
})

test('Role edit syncs changed task flags and their timestamp to both Centers without touching adjacent fields', async () => {
  const { playerId, seasonId, leagueId } = seedRoleProjectionSources()
  const result = await updatePlayerRole({
    playerId,
    primaryPosition: 'GK',
    positionLayer: 'goalkeeper',
  })
  const leaguePath = `leagues/${leagueId}`
  const league = applyPatch(mockSnapshots[leaguePath].data(), patchFor(result, leaguePath))
  const expected = league.seasonsById[seasonId].table.teamsById['team-a'].scouting.teamTaskSignals
  const leaguesCenter = applyPatch(mockSnapshots['leaguesCenter/all'].data(), patchFor(result, 'leaguesCenter/all'))
  const clubsCenterPath = `clubsCenter/${seasonId}`
  const clubsCenter = applyPatch(mockSnapshots[clubsCenterPath].data(), patchFor(result, clubsCenterPath))
  const leagueTeam = leaguesCenter.leaguesById[leagueId].seasonsById[seasonId].teamsById['team-a']
  const clubTeam = clubsCenter.clubsById['club-0'].teamsById['team-a']

  expect(expected).toEqual({ offense: true, defense: true, updatedAt: 'updated-time' })
  expect(leagueTeam.teamTaskSignals).toEqual(expected)
  expect(clubTeam.teamTaskSignals).toEqual(expected)
  const centerTeams = [leagueTeam, clubTeam]
  centerTeams.forEach(team => {
    expect(team.documentationStateUpdatedAt).toBe('documentation-time')
    expect(team.rosterPlayersCount).toBe(18)
    expect(team.transfers).toEqual({ totalIn: 2, updatedAt: 'movement-time' })
  })
  expect(clubTeam.officialTable).toEqual({ teamGamePlayed: 24, goalsFor: 40, goalsAgainst: 20 })
  expect(executeManualEdit).toHaveBeenCalledTimes(1)
  expect(result.refs.map(ref => ref.path)).toEqual(expect.arrayContaining([
    `playerRoots/${playerId}`,
    `teamSeasons/team-a__${seasonId}`,
    `playerSeasons/playerSeason__${playerId}__${seasonId}`,
    'leaguesCenter/all',
    clubsCenterPath,
  ]))
})

test('Role edit combines two team updates into each shared Center and Player Season', async () => {
  const teamIds = ['team-a', 'team-b']
  const { playerId, seasonId, leagueId, playerSeasonDocumentId, playerSeason } = seedRoleProjectionSources({ teamIds })
  const result = await updatePlayerRole({
    playerId,
    primaryPosition: 'GK',
    positionLayer: 'goalkeeper',
  })
  const paths = ['leaguesCenter/all', `clubsCenter/${seasonId}`, `playerSeasons/${playerSeasonDocumentId}`]
  paths.forEach(path => {
    expect(result.changes.filter(change => change.ref.path === path)).toHaveLength(1)
  })
  const leaguesCenter = applyPatch(mockSnapshots[paths[0]].data(), patchFor(result, paths[0]))
  const clubsCenter = applyPatch(mockSnapshots[paths[1]].data(), patchFor(result, paths[1]))
  const nextPlayerSeason = applyPatch(playerSeason, patchFor(result, paths[2]))
  teamIds.forEach((teamId, index) => {
    const leagueSignals = leaguesCenter.leaguesById[leagueId].seasonsById[seasonId].teamsById[teamId].teamTaskSignals
    const clubSignals = clubsCenter.clubsById[`club-${index}`].teamsById[teamId].teamTaskSignals
    expect(leagueSignals).toEqual({ offense: true, defense: true, updatedAt: 'updated-time' })
    expect(clubSignals).toEqual(leagueSignals)
    expect(nextPlayerSeason.teamsById[teamId].scouting.updatedAt).toBe('updated-time')
    expect(nextPlayerSeason.teamsById[teamId].stats.custom).toBe('keep stats')
  })
  expect(clubsCenter.clubsById.unrelated).toEqual(mockSnapshots[paths[1]].data().clubsById.unrelated)
  expect(nextPlayerSeason.teamsById.unrelated).toEqual(playerSeason.teamsById.unrelated)
})

test('Re-saving the same role keeps timestamp-only task and scouting updates aligned', async () => {
  const { playerId, seasonId, leagueId, playerSeasonDocumentId } = seedRoleProjectionSources()
  const oldSignals = { offense: true, defense: true, updatedAt: 'old-time' }
  mockSnapshots[`leagues/${leagueId}`].data().seasonsById[seasonId].table.teamsById['team-a']
    .scouting.teamTaskSignals = oldSignals
  mockSnapshots['leaguesCenter/all'].data().leaguesById[leagueId].seasonsById[seasonId].teamsById['team-a']
    .teamTaskSignals = oldSignals
  mockSnapshots[`clubsCenter/${seasonId}`].data().clubsById['club-0'].teamsById['team-a']
    .teamTaskSignals = oldSignals
  const result = await updatePlayerRole({
    playerId,
    primaryPosition: 'CB',
    positionLayer: 'defense',
  })
  const expected = { ...oldSignals, updatedAt: 'updated-time' }
  const leaguesCenter = applyPatch(mockSnapshots['leaguesCenter/all'].data(), patchFor(result, 'leaguesCenter/all'))
  const clubsCenterPath = `clubsCenter/${seasonId}`
  const clubsCenter = applyPatch(mockSnapshots[clubsCenterPath].data(), patchFor(result, clubsCenterPath))
  const playerSeasonPath = `playerSeasons/${playerSeasonDocumentId}`
  const playerSeason = applyPatch(mockSnapshots[playerSeasonPath].data(), patchFor(result, playerSeasonPath))

  expect(patchFor(result, `playerRoots/${playerId}`)).toBeUndefined()
  expect(leaguesCenter.leaguesById[leagueId].seasonsById[seasonId].teamsById['team-a'].teamTaskSignals).toEqual(expected)
  expect(clubsCenter.clubsById['club-0'].teamsById['team-a'].teamTaskSignals).toEqual(expected)
  expect(playerSeason.teamsById['team-a'].scouting.updatedAt).toBe('updated-time')
  expect(playerSeason.teamsById['team-a'].scouting.evidence.capturedAt).toBe('source-evidence-time')
})

test.each(['leaguesCenter', 'clubsCenter'])('Role edit rejects a missing %s team before completing the write plan', async target => {
  const { playerId, seasonId, leagueId } = seedRoleProjectionSources()
  if (target === 'leaguesCenter') {
    delete mockSnapshots['leaguesCenter/all'].data().leaguesById[leagueId].seasonsById[seasonId].teamsById['team-a']
  } else {
    delete mockSnapshots[`clubsCenter/${seasonId}`].data().clubsById['club-0'].teamsById['team-a']
  }
  const before = Object.fromEntries(Object.entries(mockSnapshots).map(([path, value]) => [path, value.data()]))
  const serializedBefore = JSON.stringify(before)

  await expect(updatePlayerRole({
    playerId,
    primaryPosition: 'GK',
    positionLayer: 'goalkeeper',
  })).rejects.toThrow()

  expect(executeManualEdit).toHaveBeenCalledTimes(1)
  const after = Object.fromEntries(Object.entries(mockSnapshots).map(([path, value]) => [path, value.data()]))
  expect(JSON.stringify(after)).toBe(serializedBefore)
})

test('Explicit note edit creates a missing Player Root from canonical roster', async () => {
  const indexRef = { path: 'playerSearchIndexes/roster-only' }
  mockIndexRefs.push(indexRef)
  mockSnapshots['playerRoots/player__2012__12345'] = snapshot({}, false)
  mockSnapshots[indexRef.path] = snapshot({
    playerId: 'player__2012__12345',
    references: { teamSeasonDocumentId: 'team-a__2026_2027' },
    player: { notes: '' },
  })
  mockSnapshots['teamSeasons/team-a__2026_2027'] = snapshot({
    identity: { seasonId: '2026_2027', seasonKey: '26/27', seasonStatus: 'active' },
    roster: {
      playersById: {
        'player__2012__12345': {
          externalPlayerId: '12345',
          fullName: 'שחקן',
          normalizedName: 'שחקן',
        },
      },
    },
  })

  const result = await updatePlayerNotes({
    playerId: 'player__2012__12345',
    notes: 'הערה חדשה',
  })
  const rootChange = result.changes.find(change => (
    change.ref.path === 'playerRoots/player__2012__12345'
  ))
  expect(rootChange.document.notes).toBe('הערה חדשה')
  expect(patchFor(result, indexRef.path).player.notes).toBe('הערה חדשה')
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

test('Goal distribution re-syncs Player Season when canonical value is unchanged', async () => {
  const teamSeasonDocumentId = 'team-a__2026_2027'
  const searchIndexId = 'playerSeason__player-a__team-a__2026_2027'
  mockSnapshots[`teamSeasons/${teamSeasonDocumentId}`] = snapshot({
    identity: { teamSeasonDocumentId, teamId: 'team-a', seasonId: '2026_2027' },
    roster: { playersById: { 'player-a': {} } },
    stats: { playersById: { 'player-a': { playerStats: { games: 10, goals: 4 } } } },
    manual: { playersById: { 'player-a': { goalDistribution: { scoringGames: 2, distributionPct: 20 } } } },
  })
  mockSnapshots['playerSeasons/playerSeason__player-a__2026_2027'] = snapshot({
    identity: { playerId: 'player-a', seasonId: '2026_2027' },
    teamsById: { 'team-a': { manual: { goalDistribution: { scoringGames: 1, distributionPct: 10 } } } },
  })
  mockSnapshots[`playerSearchIndexes/${searchIndexId}`] = snapshot({
    playerId: 'player-a',
    seasonId: '2026_2027',
    references: { teamSeasonDocumentId },
  })

  const result = await updatePlayerSeasonGoalDistribution({
    playerId: 'player-a',
    teamId: 'team-a',
    teamSeasonDocumentId,
    seasonId: '2026_2027',
    scoringGames: 2,
  })
  expect(patchFor(result, `teamSeasons/${teamSeasonDocumentId}`)).toBeUndefined()
  expect(patchFor(result, 'playerSeasons/playerSeason__player-a__2026_2027'))
    .toBeDefined()
})
