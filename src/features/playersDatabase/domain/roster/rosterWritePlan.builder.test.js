// src/features/playersDatabase/domain/roster/rosterWritePlan.builder.test.js

import {
  buildRosterClearWritePlan,
  buildRosterLoadWritePlan,
  buildRosterMovementPlan,
  buildRosterProjectionRepairPlan,
} from './index.js'
import { buildStatsClearApprovedState } from '../stats/statsClear.builder.js'

const seasonId = '2025_2026'
const teamId = 'club-a_2010_1'
const teamSeasonDocumentId = `${teamId}__${seasonId}`
const playerId = 'player__2010__12345'
const updatedAt = '2026-10-02T10:00:00.000Z'

const team = {
  clubId: 'club-a',
  birthYear: 2010,
  teamSlot: 1,
  externalTeamId: '11111',
}

const season = {
  seasonId,
  seasonKey: '25/26',
  seasonStatus: 'active',
  ageGroupId: 'u16',
}

const league = {
  leagueId: 'league-1',
  names: { display: 'League 1' },
  region: 'north',
  ageGroupId: 'u16',
  ageGroupLabel: 'U16',
  level: 2,
  seasonsById: {
    [seasonId]: {
      ...season,
      seasonUrl: 'https://example.test/season',
      tableImportedAt: updatedAt,
      table: {
        teamsById: {
          [teamId]: {
            clubId: 'club-a',
            birthYear: 2010,
            teamSlot: 1,
            teamUrl: 'https://example.test/team',
            officialTable: {
              rank: 1,
              points: 12,
              goalsFor: 10,
              goalsAgainst: 4,
              teamGamePlayed: 5,
            },
          },
        },
      },
    },
  },
}

const clubProfile = {
  clubId: 'club-a',
  names: { display: 'Club A', short: 'A' },
  clubLevel: 2,
  clubStrengthLevel: 3,
}

const player = {
  externalPlayerId: '12345',
  fullName: 'Player One',
  normalizedName: 'player one',
  rosterStatus: 'regular',
}

const rosterImport = {
  mode: 'AUTHORITATIVE_SNAPSHOT',
  sourceSnapshotKey: 'snapshot-1',
  contentHash: 'hash-1',
}

const buildLoad = overrides => buildRosterLoadWritePlan({
  team,
  season,
  league,
  clubProfile,
  players: [player],
  rosterImport,
  movement: {},
  updatedAt,
  ...overrides,
})

describe('roster target write plan', () => {
  test('builds Player Season with catalog identity and no Player Root write', () => {
    const plan = buildLoad()

    expect(plan.canonical.teamRoot.identity).toEqual({
      teamId,
      clubId: 'club-a',
      birthYear: 2010,
      teamSlot: 1,
    })
    expect(plan.canonical.teamSeason.identity.teamSeasonDocumentId).toBe(teamSeasonDocumentId)
    expect(plan.playerSeasons).toHaveLength(1)
    expect(plan.playerSeasons[0]).toMatchObject({
      operation: 'UPSERT_TEAM',
      exists: false,
      playerId,
      teamId,
      document: {
        identity: {
          playerSeasonDocumentId: `playerSeason__${playerId}__${seasonId}`,
          playerId,
          seasonId,
        },
      },
    })
    expect(plan).not.toHaveProperty('playerRoots')
  })

  test('fills creation timestamps and derived roster identity values', () => {
    const leagueWithTeamUrl = {
      ...league,
      seasonsById: {
        [seasonId]: {
          ...league.seasonsById[seasonId],
          table: {
            ...league.seasonsById[seasonId].table,
            teamsById: {
              [teamId]: {
                ...league.seasonsById[seasonId].table.teamsById[teamId],
                teamUrl: 'https://example.test/team?team_id=1896&season_id=27',
              },
            },
          },
        },
      },
    }
    const plan = buildLoad({
      team: { ...team, externalTeamId: '' },
      league: leagueWithTeamUrl,
      players: [{ ...player, normalizedName: '' }],
    })

    expect(plan.canonical.teamRoot.timestamps.createdAt).toBe(updatedAt)
    expect(plan.canonical.teamSeason.timestamps.createdAt).toBe(updatedAt)
    expect(plan.canonical.teamSeason.identity.externalTeamId).toBe('1896')
    expect(plan.canonical.teamSeason.roster.playersById[playerId].normalizedName)
      .toBe('player one')
  })

  test('stores imported playerUrl canonically and projects it to player documents', () => {
    const playerUrl = 'https://www.football.org.il/players/player/?player_id=12345'
    const plan = buildLoad({ players: [{ ...player, playerUrl }] })

    expect(plan.canonical.teamSeason.manual.playersById[playerId]).toEqual({
      playerUrl,
      goalDistribution: {},
      updatedAt,
    })
    expect(plan.playerSeasons[0].document.teamsById[teamId].manual.playerUrl)
      .toBe(playerUrl)
    expect(plan.playerSearchIndexes.upserts[0].document.player.playerUrl)
      .toBe(playerUrl)
    expect(plan.canonical.teamSeason.roster.playersById[playerId])
      .not.toHaveProperty('playerUrl')
  })

  test('preserves existing manual URL and goal distribution when import URL is empty', () => {
    const playerUrl = 'https://www.football.org.il/players/player/?player_id=12345'
    const first = buildLoad({ players: [{ ...player, playerUrl }] })
    const existingTeamSeason = {
      ...first.canonical.teamSeason,
      manual: {
        playersById: {
          [playerId]: {
            ...first.canonical.teamSeason.manual.playersById[playerId],
            goalDistribution: { leftFoot: 2 },
          },
        },
        updatedAt,
      },
    }
    const plan = buildLoad({
      players: [{ ...player, playerUrl: '' }],
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason,
      existingPlayerSeasonsById: {
        [playerId]: first.playerSeasons[0].document,
      },
      rosterImport: {
        ...rosterImport,
        sourceSnapshotKey: 'snapshot-2',
        contentHash: 'hash-2',
      },
    })

    expect(plan.canonical.teamSeason.manual.playersById[playerId]).toMatchObject({
      playerUrl,
      goalDistribution: { leftFoot: 2 },
    })
    expect(plan.playerSeasons[0].document.teamsById[teamId].manual).toEqual({
      playerUrl,
      goalDistribution: { leftFoot: 2 },
    })
  })

  test('rebuilds only Roster projections from the current canonical Team Season', () => {
    const loadPlan = buildLoad()
    const repairPlan = buildRosterProjectionRepairPlan({
      teamId,
      seasonId,
      leagueId: 'league-1',
      existingTeamSeason: loadPlan.canonical.teamSeason,
      league,
      clubProfile,
      playerRootsById: {},
      existingPlayerSeasonsById: {},
      existingPlayerSearchIndexes: [],
      updatedAt,
    })

    expect(repairPlan).not.toHaveProperty('canonical')
    expect(repairPlan).not.toHaveProperty('counterpartWrites')
    expect(repairPlan.counterparts).toEqual([])
    expect(repairPlan.playerSeasons).toHaveLength(1)
    expect(repairPlan.playerSearchIndexes.upserts).toHaveLength(1)
    expect(repairPlan.leagueProjection.roster).toEqual({
      playersCount: 1,
      hasPlayers: true,
    })
  })

  test('rebuilds counterpart writes from canonical Movement during projection repair', () => {
    const loadPlan = buildLoad()
    const counterpartTeamSeasonDocumentId = `club-b_2010_1__${seasonId}`
    const fact = {
      movementId: 'movement-repair-1',
      playerId,
      fromTeamId: 'club-b_2010_1',
      fromTeamSeasonDocumentId: counterpartTeamSeasonDocumentId,
      fromClubId: 'club-b',
      toTeamId: teamId,
      toTeamSeasonDocumentId: teamSeasonDocumentId,
      toClubId: 'club-a',
      scope: 'external',
      levelDirection: 'lateral',
      timing: 'UNKNOWN',
      effectiveAt: null,
    }
    const repairPlan = buildRosterProjectionRepairPlan({
      teamId,
      seasonId,
      leagueId: 'league-1',
      existingTeamSeason: {
        ...loadPlan.canonical.teamSeason,
        movement: {
          transfersInById: { [fact.movementId]: fact },
          transfersOutById: {},
          pendingById: {},
        },
      },
      existingCounterpartTeamSeasonsById: {
        [counterpartTeamSeasonDocumentId]: {
          identity: { teamSeasonDocumentId: counterpartTeamSeasonDocumentId },
          movement: {},
        },
      },
      league,
      clubProfile,
      updatedAt,
    })

    expect(repairPlan.counterparts).toHaveLength(1)
    expect(repairPlan.counterparts[0]).toMatchObject({
      documentId: counterpartTeamSeasonDocumentId,
      movement: {
        transfersOutById: { [fact.movementId]: fact },
      },
    })
  })

  test('requires contentHash for every roster import', () => {
    expect(() => buildLoad({
      rosterImport: { ...rosterImport, contentHash: '' },
    })).toThrow('Missing roster contentHash')
  })

  test('blocks silent removal from an authoritative snapshot', () => {
    const first = buildLoad()
    expect(() => buildLoad({
      players: [],
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason: first.canonical.teamSeason,
      existingPlayerSeasonsById: {
        [playerId]: first.playerSeasons[0].document,
      },
      rosterImport: { ...rosterImport, sourceSnapshotKey: 'snapshot-2', contentHash: 'hash-2' },
    })).toThrow('requires an explicit pending or retained left decision')
  })

  test('allows an omitted player only when pending is explicit', () => {
    const first = buildLoad()
    const plan = buildLoad({
      players: [],
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason: first.canonical.teamSeason,
      existingPlayerSeasonsById: {
        [playerId]: first.playerSeasons[0].document,
      },
      rosterImport: { ...rosterImport, sourceSnapshotKey: 'snapshot-2', contentHash: 'hash-2' },
      movement: {
        pendingById: {
          [playerId]: { playerId },
        },
      },
    })

    expect(plan.canonical.teamSeason.roster.pendingById[playerId]).toMatchObject({ playerId })
    expect(plan.playerSeasons[0]).toMatchObject({
      operation: 'DELETE',
      playerId,
    })
  })

  test('PATCH preserves existing Movement facts', () => {
    const existingFact = {
      movementId: 'movement-1',
      playerId,
      fromTeamId: 'club-b_2010_1',
      fromTeamSeasonDocumentId: `club-b_2010_1__${seasonId}`,
      fromClubId: 'club-b',
      toTeamId: teamId,
      toTeamSeasonDocumentId: teamSeasonDocumentId,
      toClubId: 'club-a',
      scope: 'external',
      levelDirection: 'lateral',
      timing: 'UNKNOWN',
      effectiveAt: null,
    }
    const plan = buildRosterMovementPlan({
      mode: 'PATCH',
      teamId,
      teamSeasonDocumentId,
      clubId: 'club-a',
      playersById: { [playerId]: { ...player, playerId } },
      existingMovement: { transfersInById: { 'movement-1': existingFact } },
    })

    expect(plan.movement.transfersInById['movement-1']).toEqual(existingFact)
  })

  test('authoritative reload preserves Movement history and blocks conflicting reuse of movementId', () => {
    const existingFact = {
      movementId: 'movement-1',
      playerId,
      fromTeamId: 'club-b_2010_1',
      fromTeamSeasonDocumentId: `club-b_2010_1__${seasonId}`,
      fromClubId: 'club-b',
      toTeamId: teamId,
      toTeamSeasonDocumentId: teamSeasonDocumentId,
      toClubId: 'club-a',
      scope: 'external',
      levelDirection: 'lateral',
      timing: 'UNKNOWN',
      effectiveAt: null,
    }
    const base = {
      mode: 'AUTHORITATIVE_SNAPSHOT',
      teamId,
      teamSeasonDocumentId,
      clubId: 'club-a',
      playersById: { [playerId]: { ...player, playerId } },
      existingMovement: { transfersInById: { 'movement-1': existingFact } },
    }

    expect(buildRosterMovementPlan(base).movement.transfersInById['movement-1'])
      .toEqual(existingFact)
    expect(() => buildRosterMovementPlan({
      ...base,
      movement: {
        transfersInById: {
          'movement-1': { ...existingFact, levelDirection: 'down' },
        },
      },
    })).toThrow('Conflicting canonical incoming Movement fact')
  })

  test('counterpart must match an approved local Movement fact', () => {
    const fact = {
      movementId: 'movement-1',
      playerId,
      fromTeamId: 'club-b_2010_1',
      fromTeamSeasonDocumentId: `club-b_2010_1__${seasonId}`,
      fromClubId: 'club-b',
      toTeamId: teamId,
      toTeamSeasonDocumentId: teamSeasonDocumentId,
      toClubId: 'club-a',
      scope: 'external',
      levelDirection: 'lateral',
      timing: 'UNKNOWN',
      effectiveAt: null,
    }
    const counterpartDocumentId = fact.fromTeamSeasonDocumentId

    expect(() => buildRosterMovementPlan({
      movement: { transfersInById: { 'movement-1': fact } },
      teamId,
      teamSeasonDocumentId,
      clubId: 'club-a',
      playersById: { [playerId]: { ...player, playerId } },
      counterpartRequests: [{
        teamSeasonDocumentId: counterpartDocumentId,
        side: 'transfersOutById',
        fact: { ...fact, levelDirection: 'down' },
      }],
      existingCounterpartTeamSeasonsById: {
        [counterpartDocumentId]: {
          identity: { teamSeasonDocumentId: counterpartDocumentId },
          movement: {},
        },
      },
    })).toThrow('does not match approved local Movement state')
  })

  test('Roster Clear removes the local season and leaves counterparts untouched', () => {
    const first = buildLoad()
    const clear = buildRosterClearWritePlan({
      teamId,
      seasonId,
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason: first.canonical.teamSeason,
      existingPlayerSeasonsById: {
        [playerId]: first.playerSeasons[0].document,
      },
      existingPlayerSearchIndexes: first.playerSearchIndexes.upserts.map(row => ({
        id: row.documentId,
        ...row.document,
      })),
      league,
      clubProfile,
      updatedAt,
    })

    expect(clear.canonical.teamSeasonOperation).toBe('DELETE')
    expect(clear.counterparts).toEqual([])
    expect(clear.playerSeasons[0].operation).toBe('DELETE')
  })

  test('Roster Clear never expands canonical player writes from SearchIndex rows', () => {
    const first = buildLoad()
    const projectionOnlyPlayerId = 'player__2010__99999'
    const canonicalIndexRows = first.playerSearchIndexes.upserts.map(row => ({
      id: row.documentId,
      ...row.document,
    }))
    const clear = buildRosterClearWritePlan({
      teamId,
      seasonId,
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason: first.canonical.teamSeason,
      existingPlayerSeasonsById: {
        [playerId]: first.playerSeasons[0].document,
        [projectionOnlyPlayerId]: {
          id: `${projectionOnlyPlayerId}__${seasonId}`,
          identity: {
            playerSeasonDocumentId: `${projectionOnlyPlayerId}__${seasonId}`,
          },
          teamsById: { [teamId]: { teamId } },
        },
      },
      existingPlayerSearchIndexes: [
        ...canonicalIndexRows,
        {
          id: 'stale-projection-only-index',
          playerId: projectionOnlyPlayerId,
        },
      ],
      league,
      clubProfile,
      updatedAt,
    })

    expect(clear.playerSeasons.map(row => row.playerId)).toEqual([playerId])
    expect(clear.playerSearchIndexes.deletes).toContain('stale-projection-only-index')
    expect(clear.impact).toEqual(expect.objectContaining({
      players: 1,
      playerIndexes: 2,
    }))
  })

  test('Roster Clear retry cleans Player Season from its own team relation after canonical deletion', () => {
    const first = buildLoad()
    const clear = buildRosterClearWritePlan({
      teamId,
      seasonId,
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason: null,
      existingPlayerSeasonsById: {
        [playerId]: first.playerSeasons[0].document,
      },
      existingPlayerSearchIndexes: [{
        id: 'stale-projection-only-index',
        playerId: 'player__2010__99999',
      }],
      league,
      clubProfile,
      updatedAt,
    })

    expect(clear.canonical.teamSeasonOperation).toBe('NONE')
    expect(clear.playerSeasons.map(row => row.playerId)).toEqual([playerId])
    expect(clear.playerSearchIndexes.deletes).toEqual(['stale-projection-only-index'])
  })

  test('Roster Clear refuses to orphan existing Movement counterparts', () => {
    const first = buildLoad()

    expect(() => buildRosterClearWritePlan({
      teamId,
      seasonId,
      existingTeamRoot: first.canonical.teamRoot,
      existingTeamSeason: {
        ...first.canonical.teamSeason,
        movement: {
          ...first.canonical.teamSeason.movement,
          transfersInById: { movement_1: { movementId: 'movement_1' } },
        },
      },
      league,
      clubProfile,
      updatedAt,
    })).toThrow('לא ניתן למחוק סגל עם תנועות שחקנים פעילות.')
  })

  test('supports Stats Clear, roster update, Roster Clear and a fresh roster reload', () => {
    const firstLoad = buildLoad()
    const statsTeamSeason = {
      ...firstLoad.canonical.teamSeason,
      stats: {
        playersById: {
          [playerId]: { statsStatus: 'loaded', playerStats: { games: 5 } },
        },
        teamBalance: { status: 'balanced' },
        statsLoadState: { status: 'loaded' },
      },
      scouting: {
        playersById: {
          [playerId]: { professionalProfileIds: ['profile-1'] },
        },
        scoutProfilesSummary: { count: 1 },
      },
    }
    const firstSearchIndex = firstLoad.playerSearchIndexes.upserts[0]
    const statsClear = buildStatsClearApprovedState({
      leagueId: league.leagueId,
      teamId,
      seasonId,
      updatedAt,
      sources: {
        teamRoot: firstLoad.canonical.teamRoot,
        teamSeason: statsTeamSeason,
        league,
        clubProfile,
        playerRootsById: {},
        playerSeasonsById: {
          [playerId]: firstLoad.playerSeasons[0].document,
        },
        playerSearchIndexesById: {
          [playerId]: {
            id: firstSearchIndex.documentId,
            ...firstSearchIndex.document,
          },
        },
      },
    })

    const rosterUpdate = buildLoad({
      existingTeamRoot: firstLoad.canonical.teamRoot,
      existingTeamSeason: statsClear.canonicalTeamSeason,
      existingPlayerSeasonsById: {
        [playerId]: statsClear.playerSeasonPlans[0].projection,
      },
      rosterImport: {
        ...rosterImport,
        sourceSnapshotKey: 'snapshot-2',
        contentHash: 'hash-2',
      },
    })
    const rosterClear = buildRosterClearWritePlan({
      teamId,
      seasonId,
      existingTeamRoot: rosterUpdate.canonical.teamRoot,
      existingTeamSeason: rosterUpdate.canonical.teamSeason,
      existingPlayerSeasonsById: {
        [playerId]: rosterUpdate.playerSeasons[0].document,
      },
      existingPlayerSearchIndexes: rosterUpdate.playerSearchIndexes.upserts.map(row => ({
        id: row.documentId,
        ...row.document,
      })),
      league,
      clubProfile,
      updatedAt,
    })
    const reload = buildLoad({
      rosterImport: {
        ...rosterImport,
        sourceSnapshotKey: 'snapshot-3',
        contentHash: 'hash-3',
      },
    })

    expect(statsClear.canonicalTeamSeason.stats.statsLoadState.status).toBe('missing')
    expect(rosterUpdate.canonical.teamSeason.roster.playersById).toHaveProperty(playerId)
    expect(rosterClear.canonical.teamSeasonOperation).toBe('DELETE')
    expect(reload.canonical.teamSeason.identity.teamSeasonDocumentId)
      .toBe(teamSeasonDocumentId)
    expect(reload.playerSeasons[0].operation).toBe('UPSERT_TEAM')
  })
})
