// src/features/playersDatabase/domain/statsV2/statsFinalSync.projection.test.js

import {
  buildStatsPlayerSearchIndexCandidates,
  buildStatsPlayerSearchIndexStates,
} from './statsFinalSync.projection.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'
import { buildTeamSeasonDocumentId } from '../../model/team/teamIdentity.model.js'

jest.mock('firebase/firestore', () => ({
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}))

const league = {
  id: 'league-1',
  level: 2,
  region: 'center',
}

const season = {
  seasonId: '28',
  seasonKey: '2026-2027',
  seasonStatus: 'active',
  birthYear: 2012,
  leagueTotalRound: 30,
}

const team = {
  clubId: 'club-1',
  ageGroupId: 'u15',
  ageGroupLabel: 'נערים ג',
  birthYear: 2012,
  birthTeamSlot: 1,
  birthTeamDocumentId: 'team-1',
  teamGamePlayed: 8,
}

const player = {
  playerId: 'player-1',
  externalPlayerId: '123',
  fullName: 'Player One',
  normalizedName: 'player one',
  playerDocumentId: 'player-doc-1',
  statsStatus: 'loaded',
  playerStats: {
    games: 8,
    goals: 3,
    minutes: 500,
    starts: 6,
    substituteIn: 2,
    substitutedOut: 1,
  },
  scoutCombinations: [{ id: 'combo-1' }],
}

describe('Stats V2 Player SearchIndex projection', () => {
  test('builds a full create payload from canonical projection', () => {
    const candidates = buildStatsPlayerSearchIndexCandidates({
      league,
      players: [player],
      season,
      team,
      playerDocumentIds: ['player-doc-1'],
      capturedAt: '2026-09-27T10:00:00.000Z',
    })
    const states = buildStatsPlayerSearchIndexStates({
      candidates,
      existingDocumentIds: [],
    })

    expect(states).toHaveLength(1)
    expect(states[0].action).toBe('create')
    expect(states[0].fields).toMatchObject({
      id: states[0].docId,
      entityType: 'playerSeason',
      entityId: states[0].docId,
      displayName: 'Player One',
      playerDocumentId: 'player-doc-1',
      sourceCollection: 'players',
      sourceDocumentId: 'player-doc-1',
      sourceTarget: 'current',
      statsStatus: 'loaded',
      games: 8,
      goals: 3,
    })
    expect(states[0].fields.statsSnapshots.current).toMatchObject({
      capturedAt: '2026-09-27T10:00:00.000Z',
      games: 8,
      goals: 3,
    })
    const expectedKeys = Object.keys(SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT)
      .filter(key => !['updatedAt', 'lastWriteAction', 'lastWriteAt'].includes(key))
      .sort()
    expect(Object.keys(states[0].fields).sort()).toEqual(expectedKeys)
    expect(states[0].fields.updatedAt).toBeUndefined()
  })

  test('builds only Stats-owned fields for an existing index', () => {
    const candidates = buildStatsPlayerSearchIndexCandidates({
      league,
      players: [player],
      season,
      team,
      playerDocumentIds: ['player-doc-1'],
    })
    const states = buildStatsPlayerSearchIndexStates({
      candidates,
      existingDocumentIds: [candidates[0].docId],
    })

    expect(states[0].action).toBe('update')
    expect(states[0].fields).toMatchObject({
      playerDocumentId: 'player-doc-1',
      sourceCollection: 'players',
      sourceDocumentId: 'player-doc-1',
      statsStatus: 'loaded',
    })
    expect(states[0].fields.displayName).toBeUndefined()
    expect(states[0].fields.aliases).toBeUndefined()
  })

  test('preserves the previous stats snapshot from the existing index', () => {
    const initialCandidates = buildStatsPlayerSearchIndexCandidates({
      league,
      players: [player],
      season,
      team,
      playerDocumentIds: ['player-doc-1'],
    })
    const docId = initialCandidates[0].docId
    const existingCurrent = {
      capturedAt: '2026-09-20T10:00:00.000Z',
      snapshotKey: '8|7|2|450|5|2|1',
      teamGamePlayed: 8,
      games: 7,
      goals: 2,
      minutes: 450,
      starts: 5,
      substituteIn: 2,
      substitutedOut: 1,
    }
    const candidates = buildStatsPlayerSearchIndexCandidates({
      league,
      players: [player],
      season,
      team,
      playerDocumentIds: ['player-doc-1'],
      existingById: {
        [docId]: { statsSnapshots: { previous: null, current: existingCurrent } },
      },
      capturedAt: '2026-09-27T10:00:00.000Z',
    })
    const states = buildStatsPlayerSearchIndexStates({
      candidates,
      existingDocumentIds: [docId],
    })

    expect(states[0].fields.statsSnapshots.previous).toEqual(existingCurrent)
    expect(states[0].fields.statsSnapshots.current.games).toBe(8)
  })

  test('points to Team Season when no Player Document is planned', () => {
    const candidates = buildStatsPlayerSearchIndexCandidates({
      league,
      players: [{ ...player, playerDocumentId: '' }],
      season,
      team,
      playerDocumentIds: [],
      capturedAt: '2026-09-27T10:00:00.000Z',
    })
    const states = buildStatsPlayerSearchIndexStates({
      candidates,
      existingDocumentIds: [],
    })

    expect(states[0].fields.playerDocumentId).toBe('')
    expect(states[0].fields.sourceCollection).toBe('birthTeamSeasons')
    expect(states[0].fields.sourceDocumentId).toBe(
      buildTeamSeasonDocumentId('team-1', season.seasonKey)
    )
    expect(states[0].fields.sourceDocumentId).toBe('team-1__26_27')
    expect(states[0].fields.sourceTarget).toBe('current')
  })

})
