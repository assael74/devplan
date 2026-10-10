// src/features/playersDatabase/services/audit/system/cleanup.test.js

import { getSystemCleanupCandidates } from './cleanup.js'

describe('system cleanup candidates', () => {
  test('allows only orphan search projections and removes duplicates', () => {
    const orphan = {
      type: 'orphan_projection',
      target: 'playerSearchIndexes',
      documentId: 'search-1',
    }
    const result = getSystemCleanupCandidates({
      findings: [
        orphan,
        { ...orphan },
        { type: 'orphan_projection', target: 'playerSeasons', documentId: 'season-1' },
        { type: 'invalid_identity', target: 'playerSearchIndexes', documentId: 'search-2' },
      ],
    })

    expect(result).toEqual([orphan])
  })

  test('allows a canonical orphan Player Season team relation', () => {
    const orphan = {
      type: 'orphan_projection',
      target: 'playerSeasons',
      documentId: 'player-a_2026_2027',
      teamId: 'club-a_2011_1',
      seasonId: '2026_2027',
      expected: 'club-a_2011_1__2026_2027',
    }

    expect(getSystemCleanupCandidates({ findings: [orphan] })).toEqual([orphan])
  })

  test('rejects a Player Season relation whose expected identity is not canonical', () => {
    const orphan = {
      type: 'orphan_projection',
      target: 'playerSeasons',
      documentId: 'player-a_2026_2027',
      teamId: 'club-a_2011_1',
      seasonId: '2026_2027',
      expected: 'other-team-season',
    }

    expect(getSystemCleanupCandidates({ findings: [orphan] })).toEqual([])
  })
})

