// src/features/playersDatabase/domain/identity/canonicalPlayerIdentityCandidates.domain.test.js

import {
  buildCanonicalPlayerIdentityCandidateMetadata,
  buildCanonicalPlayerIdentityKeys,
  resolveCanonicalPlayerIdentityCandidates,
} from './canonicalPlayerIdentityCandidates.domain.js'

describe('canonical player identity candidates', () => {
  test('builds lookup keys only from a valid external identity', () => {
    expect(buildCanonicalPlayerIdentityKeys({
      player: {
        externalPlayerId: '12345',
        fullName: 'Player A',
        identityKey: '2012__player_a',
        playerDocumentId: 'name__player_a',
      },
      birthYear: 2012,
    })).toEqual({
      externalPlayerId: '12345',
      identityBirthYear: 2012,
    })
  })

  test('does not create a candidate key from a name or legacy document id', () => {
    expect(buildCanonicalPlayerIdentityKeys({
      player: {
        fullName: 'Player A',
        identityKey: '2012__player_a',
        playerDocumentId: 'name__player_a',
      },
      birthYear: 2012,
    })).toEqual({
      externalPlayerId: '',
      identityBirthYear: 2012,
    })
  })

  test('resolves candidates only through externalPlayerId', () => {
    const externalCandidate = {
      playerId: 'player__2012__12345',
      externalPlayerId: '12345',
    }
    const lookup = {
      byExternalPlayerId: new Map([['12345', [externalCandidate]]]),
      byIdentityKey: new Map([['2012__player_a', [{ playerId: 'legacy-player' }]]]),
    }

    expect(resolveCanonicalPlayerIdentityCandidates({
      keys: { externalPlayerId: '12345' },
      lookup,
    })).toEqual({
      source: 'externalPlayerId',
      candidates: [externalCandidate],
      status: 'matched',
    })
    expect(resolveCanonicalPlayerIdentityCandidates({
      keys: { externalPlayerId: '' },
      lookup,
    }).candidates).toEqual([])
  })

  test('candidate metadata omits playerDocumentId', () => {
    expect(buildCanonicalPlayerIdentityCandidateMetadata([{
      playerId: 'player__2012__12345',
      playerDocumentId: 'external__12345',
      externalPlayerId: '12345',
      displayName: 'Player A',
    }])).toEqual([{
      candidateKey: 'player__2012__12345',
      playerId: 'player__2012__12345',
      externalPlayerId: '12345',
      fullName: 'Player A',
      displayName: 'Player A',
    }])
  })
})
