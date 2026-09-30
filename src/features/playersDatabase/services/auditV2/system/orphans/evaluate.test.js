// src/features/playersDatabase/services/auditV2/system/orphans/evaluate.test.js

import { evaluateOrphanDataV2 } from './evaluate.js'

const teamSeason = ({
  id = 'team-season-1',
  playerId = 'player-1',
  seasonId = '28',
  seasonKey = '26_27',
  birthTeamId = '6507',
  birthTeamSlot = 1,
} = {}) => ({
  id,
  data: {
    id,
    seasonId,
    seasonKey,
    birthTeamId,
    birthTeamDocumentId: 'team-root-1',
    scoutIdentityContext: { birthTeamSlot },
    teamPlayers: [{ playerId, fullName: 'Player One' }],
  },
})

const playerIndex = ({
  id = 'player-index-1',
  playerId = 'player-1',
  seasonId = '28',
  seasonKey = '26_27',
  birthTeamId = '6507',
  birthTeamSlot = 1,
} = {}) => ({
  id,
  data: {
    entityType: 'playerSeason',
    playerId,
    seasonId,
    seasonKey,
    birthTeamId,
    birthTeamSlot,
    birthTeamDocumentId: 'team-root-1',
  },
})

describe('evaluateOrphanDataV2', () => {
  test('returns no findings for valid relations', () => {
    const findings = evaluateOrphanDataV2({
      teamSearchIndexes: [{
        id: 'team-index-1',
        data: {
          entityType: 'birthTeamSeason',
          teamSeasonDocumentId: 'team-season-1',
          birthTeamDocumentId: 'team-root-1',
          seasonKey: '26_27',
        },
      }],
      playerSearchIndexes: [playerIndex()],
      teamSeasons: [teamSeason()],
      clubs: [{ id: 'club-1', data: { clubId: 'club-1' } }],
      clubsMaster: { clubs: [{ clubId: 'club-1' }] },
    })

    expect(findings).toEqual([])
  })

  test('allows League-only Team SearchIndex without Team Season relation', () => {
    const findings = evaluateOrphanDataV2({
      teamSearchIndexes: [{
        id: 'team-index-1',
        data: {
          entityType: 'birthTeamSeason',
          teamSeasonDocumentId: '',
          birthTeamDocumentId: 'team-root-1',
          seasonKey: '26_27',
        },
      }],
    })

    expect(findings).toEqual([])
  })

  test('finds Team SearchIndex pointing to a missing Team Season', () => {
    const findings = evaluateOrphanDataV2({
      teamSearchIndexes: [{
        id: 'team-index-1',
        data: {
          entityType: 'birthTeamSeason',
          teamSeasonDocumentId: 'missing-team-season',
          birthTeamDocumentId: 'team-root-1',
          seasonKey: '26_27',
        },
      }],
    })

    expect(findings).toHaveLength(1)
    expect(findings[0]).toEqual(expect.objectContaining({
      target: 'teamSearchIndexes',
      documentId: 'team-index-1',
      relatedDocumentId: 'missing-team-season',
    }))
  })


  test('normalizes equivalent season formats before deciding a Player SearchIndex is orphaned', () => {
    const findings = evaluateOrphanDataV2({
      playerSearchIndexes: [playerIndex({ seasonId: '26/27', seasonKey: '' })],
      teamSeasons: [teamSeason({ seasonId: '26_27', seasonKey: '' })],
    })

    expect(findings).toEqual([])
  })


  test('finds Player SearchIndex without canonical roster owner', () => {
    const findings = evaluateOrphanDataV2({
      playerSearchIndexes: [playerIndex({ playerId: 'player-orphan' })],
      teamSeasons: [teamSeason()],
    })

    expect(findings).toHaveLength(1)
    expect(findings[0]).toEqual(expect.objectContaining({
      target: 'playerSearchIndexes',
      documentId: 'player-index-1',
      playerId: 'player-orphan',
    }))
  })

  test('finds Player SearchIndex with incomplete identity', () => {
    const findings = evaluateOrphanDataV2({
      playerSearchIndexes: [playerIndex({ playerId: '' })],
      teamSeasons: [teamSeason()],
    })

    expect(findings).toHaveLength(1)
    expect(findings[0]).toEqual(expect.objectContaining({
      type: 'invalid_identity',
      target: 'playerSearchIndexes',
    }))
  })

  test('finds ClubsMaster entry without Club document', () => {
    const findings = evaluateOrphanDataV2({
      clubs: [{ id: 'club-1', data: { clubId: 'club-1' } }],
      clubsMaster: {
        clubs: [{ clubId: 'club-1' }, { clubId: 'club-orphan' }],
      },
    })

    expect(findings).toHaveLength(1)
    expect(findings[0]).toEqual(expect.objectContaining({
      target: 'clubsMaster',
      clubId: 'club-orphan',
      relatedDocumentId: 'club-orphan',
    }))
  })
})
