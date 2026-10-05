// src/features/playersDatabase/domain/identity/identity.test.js

import {
  buildPlayerId,
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
  normalizeSeasonIdentity,
  requireSeasonId,
} from './index.js'

describe('PlayersDatabase canonical identity', () => {
  test('normalizes season fields independently without falling back between them', () => {
    expect(normalizeSeasonIdentity({
      seasonId: ' 2025_2026 ',
      seasonKey: ' 25_26 ',
    })).toEqual({
      seasonId: '2025_2026',
      seasonKey: '25_26',
    })

    expect(normalizeSeasonIdentity({ seasonKey: '25_26' })).toEqual({
      seasonId: '',
      seasonKey: '25_26',
    })
  })

  test('accepts only the technical YYYY_YYYY seasonId format', () => {
    expect(requireSeasonId(' 2025_2026 ')).toBe('2025_2026')

    expect(() => requireSeasonId('25/26')).toThrow('Invalid seasonId')
    expect(() => requireSeasonId('25_26')).toThrow('Invalid seasonId')
    expect(() => requireSeasonId('abc')).toThrow('Invalid seasonId')
    expect(() => requireSeasonId('2025/2026')).toThrow('Invalid seasonId')
    expect(() => requireSeasonId('')).toThrow('Missing seasonId')
  })

  test('builds Team and Team Season ids from explicit canonical inputs', () => {
    expect(buildTeamId({
      clubId: ' club-1 ',
      birthYear: 2012,
      teamSlot: 1,
    })).toBe('club-1_2012_1')

    expect(buildTeamSeasonDocumentId({
      teamId: ' club-1_2012_1 ',
      seasonId: ' 2025_2026 ',
    })).toBe('club-1_2012_1__2025_2026')
  })

  test('rejects a missing or zero teamSlot instead of inventing a default', () => {
    expect(() => buildTeamId({
      clubId: 'club-1',
      birthYear: 2012,
    })).toThrow('Invalid teamSlot')

    expect(() => buildTeamId({
      clubId: 'club-1',
      birthYear: 2012,
      teamSlot: 0,
    })).toThrow('Invalid teamSlot')
  })

  test('builds Player and Player Season ids from canonical identity only', () => {
    const playerId = buildPlayerId({
      birthYear: 2012,
      externalPlayerId: ' 123456 ',
    })

    expect(playerId).toBe('player__2012__123456')
    expect(buildPlayerSeasonDocumentId({
      playerId: ` ${playerId} `,
      seasonId: ' 2025_2026 ',
    })).toBe('playerSeason__player__2012__123456__2025_2026')
  })

  test('rejects invalid external player ids', () => {
    expect(() => buildPlayerId({
      birthYear: 2012,
      externalPlayerId: '1234',
    })).toThrow('Invalid externalPlayerId')

    expect(() => buildPlayerId({
      birthYear: 2012,
      externalPlayerId: '12A456',
    })).toThrow('Invalid externalPlayerId')
  })

  test('builds Player SearchIndex id only from playerId and teamSeasonDocumentId', () => {
    expect(buildPlayerSearchIndexDocumentId({
      playerId: ' player__2012__123456 ',
      teamSeasonDocumentId: ' club-1_2012_1__2025_2026 ',
    })).toBe(
      'playerSeason__player__2012__123456__club-1_2012_1__2025_2026'
    )
  })

  test('rejects seasonKey-shaped values in season-scoped document ids', () => {
    expect(() => buildTeamSeasonDocumentId({
      teamId: 'club-1_2012_1',
      seasonId: '25_26',
    })).toThrow('Invalid seasonId')

    expect(() => buildPlayerSeasonDocumentId({
      playerId: 'player__2012__123456',
      seasonId: '25/26',
    })).toThrow('Invalid seasonId')
  })
})
