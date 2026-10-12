// src/features/playersDatabase/services/audit/repair/repairStatsFinding.test.js

import { repairStatsFinding } from './repairStatsFinding.js'
import { repairLeagueFinding } from './repairLeagueFinding.js'
import { readStatsAuditActual } from '../stats/readActual.js'
import { writeStatsPlayerSeasons } from '../../write/stats/writeStatsPlayerSeasons.js'
import { writeStatsPlayerSearchIndexes } from '../../write/stats/writeStatsPlayerSearchIndexes.js'
import { writeStatsLeagueProjection } from '../../write/stats/writeStatsLeagueProjection.js'

jest.mock('../stats/readActual.js', () => ({ readStatsAuditActual: jest.fn() }))
jest.mock('./repairLeagueFinding.js', () => ({ repairLeagueFinding: jest.fn() }))
jest.mock('../../write/stats/writeStatsPlayerSeasons.js', () => ({ writeStatsPlayerSeasons: jest.fn() }))
jest.mock('../../write/stats/writeStatsPlayerSearchIndexes.js', () => ({ writeStatsPlayerSearchIndexes: jest.fn() }))
jest.mock('../../write/stats/writeStatsLeagueProjection.js', () => ({ writeStatsLeagueProjection: jest.fn() }))

const seasonId = '2026_2027'
const teamId = 'club-1_2011_1'
const teamSeasonDocumentId = `${teamId}__${seasonId}`
const playerId = 'player__2011__90000'
const otherPlayerId = 'player__2011__90001'
const scope = { type: 'player', leagueId: 'league-1', teamId, seasonId, playerId }
const playerSeasonId = id => `playerSeason__${id}__${seasonId}`
const searchIndexId = id => `playerSeason__${id}__${teamSeasonDocumentId}`
const writers = [writeStatsPlayerSeasons, writeStatsPlayerSearchIndexes, writeStatsLeagueProjection, repairLeagueFinding]
const sourceTime = { seconds: 100, nanoseconds: 0 }

const sources = () => ({
  teamSeason: {
    identity: {
      teamSeasonDocumentId,
      teamId,
      seasonId,
      seasonKey: '26/27',
      seasonStatus: 'active',
      clubId: 'club-1',
      leagueId: 'league-1',
      birthYear: 2011,
      teamSlot: 1,
      ageGroupId: 'u15',
    },
    competitionSnapshot: { clubLevel: 2, clubStrengthLevel: 3 },
    roster: {
      playersById: {
        [playerId]: { fullName: 'שחקן א', rosterStatus: 'active' },
        [otherPlayerId]: { fullName: 'שחקן ב', rosterStatus: 'active' },
      },
    },
    stats: {
      playersById: {
        [playerId]: { statsStatus: 'loaded', playerStats: { games: 10, goals: 4 } },
        [otherPlayerId]: { statsStatus: 'loaded', playerStats: { games: 10, goals: 9 } },
      },
      statsLoadState: { status: 'loaded' },
      updatedAt: sourceTime,
    },
    scouting: {
      playersById: {
        [playerId]: {
          primary: { profileId: 'striker' },
          professionalProfileIds: ['striker'],
          evidence: { engineVersion: 'saved-version', projected: { goals: 8 } },
        },
      },
    },
    teamTaskSignals: { offense: true, defense: false, updatedAt: sourceTime },
  },
  league: {
    id: 'league-1',
    leagueId: 'league-1',
    level: 2,
    seasonsById: {
      [seasonId]: {
        seasonStatus: 'active',
        table: { teamsById: { [teamId]: { clubId: 'club-1' } } },
        updatedAt: { seconds: 90, nanoseconds: 0 },
      },
    },
  },
  playerRootsById: {},
  playerSeasonsById: {},
  playerSearchIndexesById: {},
  leaguesCenter: {},
  clubsCenter: {},
})

beforeEach(() => {
  jest.clearAllMocks()
  readStatsAuditActual.mockResolvedValue(sources())
  writers.forEach(writer => writer.mockResolvedValue({ written: true }))
})

test('recreates only the selected Player Season from fresh canonical data without a Player Root', async () => {
  await repairStatsFinding({
    scope,
    finding: {
      type: 'missing_document', target: 'playerSeason', documentId: playerSeasonId(playerId), field: 'document',
      expected: { stats: { goals: 999 } },
    },
  })

  expect(readStatsAuditActual).toHaveBeenCalledWith({
    leagueId: scope.leagueId, teamId, seasonId, scopedPlayerIds: [playerId],
  })
  const state = writeStatsPlayerSeasons.mock.calls[0][0].approvedState
  expect(state.updatedAt).toEqual(sourceTime)
  expect(state.playerSeasonPlans).toHaveLength(1)
  expect(state.playerSeasonPlans[0]).toMatchObject({
    playerId, documentId: playerSeasonId(playerId), exists: false, teamExists: false,
    projection: {
      teamId,
      team: {
        stats: { playerStats: { goals: 4 } },
        scouting: { evidence: { engineVersion: 'saved-version' } },
        updatedAt: sourceTime,
      },
    },
  })
  expect(state).not.toHaveProperty('playerRootPlans')
  writers.filter(writer => writer !== writeStatsPlayerSeasons).forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test('adds the selected team context without treating an existing Player Season as a new document', async () => {
  const actual = sources()
  actual.playerSeasonsById[playerId] = { teamsById: { otherTeam: { manual: { playerUrl: 'keep' } } } }
  readStatsAuditActual.mockResolvedValue(actual)

  await repairStatsFinding({
    scope,
    finding: {
      type: 'projection_mismatch', target: 'playerSeason', documentId: playerSeasonId(playerId),
      field: `teamsById.${teamId}.stats`,
    },
  })

  expect(writeStatsPlayerSeasons.mock.calls[0][0].approvedState.playerSeasonPlans[0]).toMatchObject({
    exists: true, teamExists: false,
  })
  expect(actual.playerSeasonsById[playerId].teamsById.otherTeam.manual.playerUrl).toBe('keep')
})

test('team-scope repair rebuilds only the player SearchIndex identified by the finding', async () => {
  await repairStatsFinding({
    scope: { ...scope, type: 'team', playerId: '' },
    finding: {
      type: 'projection_mismatch', target: 'playerSearchIndex', documentId: searchIndexId(otherPlayerId), field: 'stats',
    },
  })

  const plans = writeStatsPlayerSearchIndexes.mock.calls[0][0].approvedState.playerSearchIndexPlans
  expect(plans).toHaveLength(1)
  expect(plans[0]).toMatchObject({
    playerId: otherPlayerId,
    projection: { documentId: searchIndexId(otherPlayerId), stats: { actual: { goals: 9 } } },
  })
  writers.filter(writer => writer !== writeStatsPlayerSearchIndexes).forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test('blocks a finding for another player in player scope before any writer', async () => {
  await expect(repairStatsFinding({
    scope,
    finding: { type: 'missing_document', target: 'playerSearchIndex', documentId: searchIndexId(otherPlayerId), field: 'document' },
  })).rejects.toThrow('השחקן שבממצא')
  writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test('repairs only League stats metadata from Team Season', async () => {
  await repairStatsFinding({
    scope,
    finding: { type: 'projection_mismatch', target: 'leagueMetadata', documentId: scope.leagueId, field: 'stats' },
  })

  expect(writeStatsLeagueProjection).toHaveBeenCalledWith({
    approvedState: {
      leagueProjection: {
        leagueId: scope.leagueId,
        teamId,
        seasonId,
        patch: {
          stats: { hasStats: true, statsComplete: true },
          scouting: {
            playersWithScoutProfileCount: 1,
            teamTaskSignals: { offense: true, defense: false, updatedAt: sourceTime },
          },
          updatedAt: sourceTime,
        },
      },
    },
  })
  writers.filter(writer => writer !== writeStatsLeagueProjection).forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test.each([
  ['leaguesCenter', 'all', 'projection_mismatch', 'documentationState'],
  ['clubsCenter', seasonId, 'projection_mismatch', 'transfers'],
  ['leaguesCenter', 'all', 'missing_projection', 'team'],
  ['clubsCenter', seasonId, 'missing_projection', 'team'],
])('delegates %s %s %s to complete canonical Center reconstruction', async (target, documentId, type, field) => {
  const finding = { target, documentId, type, field }
  await repairStatsFinding({ scope, finding })

  expect(repairLeagueFinding).toHaveBeenCalledWith({ scope: { ...scope, type: 'league' }, finding })
  writers.filter(writer => writer !== repairLeagueFinding).forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test.each(['teamSeason', 'league'])('blocks a missing canonical %s instead of creating it', async missing => {
  const actual = sources()
  actual[missing] = null
  readStatsAuditActual.mockResolvedValue(actual)
  await expect(repairStatsFinding({
    scope,
    finding: { type: 'missing_document', target: 'playerSeason', documentId: playerSeasonId(playerId), field: 'document' },
  })).rejects.toThrow('קנוני')
  writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test('blocks a team relation that has disappeared from canonical League', async () => {
  const actual = sources()
  actual.league.seasonsById[seasonId].table.teamsById = {}
  readStatsAuditActual.mockResolvedValue(actual)
  await expect(repairStatsFinding({
    scope,
    finding: { type: 'projection_mismatch', target: 'leagueMetadata', documentId: scope.leagueId, field: 'stats' },
  })).rejects.toThrow('בטבלת הליגה')
  writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test('blocks conflicting canonical season statuses before any writer', async () => {
  const actual = sources()
  actual.league.seasonsById[seasonId].seasonStatus = 'completed'
  readStatsAuditActual.mockResolvedValue(actual)
  await expect(repairStatsFinding({
    scope,
    finding: { type: 'projection_mismatch', target: 'leaguesCenter', documentId: 'all', field: 'documentationState' },
  })).rejects.toThrow('מצב עונת הקבוצה')
  writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
})

test.each([
  ['playerId', otherPlayerId],
  ['seasonId', '2025_2026'],
  ['playerSeasonDocumentId', playerSeasonId(otherPlayerId)],
])('blocks existing Player Season with conflicting identity.%s without overwriting other team contexts', async (field, value) => {
  const actual = sources()
  actual.playerSeasonsById[playerId] = {
    identity: { [field]: value },
    teamsById: { otherTeam: { manual: { playerUrl: 'keep' } } },
  }
  readStatsAuditActual.mockResolvedValue(actual)
  await expect(repairStatsFinding({
    scope,
    finding: {
      type: 'projection_mismatch', target: 'playerSeason', documentId: playerSeasonId(playerId),
      field: `teamsById.${teamId}.stats`,
    },
  })).rejects.toThrow('זהות Player Season')
  writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
  expect(actual.playerSeasonsById[playerId].teamsById.otherTeam.manual.playerUrl).toBe('keep')
})

test.each([
  { target: 'playerRoot', field: 'document', documentId: playerId },
  { target: 'teamSeason', field: 'stats', documentId: teamSeasonDocumentId },
  { target: 'counterpartTeamSeason', field: 'movement', documentId: 'other' },
  { target: 'clubsCenter', field: 'clubsById.other.teamsById.other.transfers', documentId: seasonId },
  { target: 'leagueMetadata', field: 'stats', documentId: 'other-league' },
])('rejects unsupported or unrelated finding $target / $field', async finding => {
  await expect(repairStatsFinding({ scope, finding: { type: 'projection_mismatch', ...finding } })).rejects.toThrow()
  expect(readStatsAuditActual).not.toHaveBeenCalled()
  writers.forEach(writer => expect(writer).not.toHaveBeenCalled())
})
