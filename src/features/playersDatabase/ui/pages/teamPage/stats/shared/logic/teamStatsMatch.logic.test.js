// src/features/playersDatabase/ui/pages/teamPage/stats/shared/logic/teamStatsMatch.logic.test.js

import {
  applyResolvedStatsIdentity,
  buildRosterLookup,
  enrichStatsRowForPreview,
  STATS_IDENTITY_STATUS,
} from './teamStatsMatch.logic.js'

describe('Stats identity resolution', () => {
  test('requires manual approval when no system identity or valid external ID exists', () => {
    const result = applyResolvedStatsIdentity({
      row: { fullName: 'שחקן ללא מזהה', birthYear: 2012 },
      resolvedPlayer: { identityMatchStatus: 'unresolved' },
    })

    expect(result.identityStatus).toBe(STATS_IDENTITY_STATUS.UNRESOLVED)
    expect(result.rosterStatus).toBe('unresolved')
    expect(result.identityMessage).toContain('נדרש אישור ידני')
  })

  test('allows deterministic creation for a new valid external player ID', () => {
    const result = applyResolvedStatsIdentity({
      row: { fullName: 'שחקן חדש', birthYear: 2012, externalPlayerId: '228408' },
      resolvedPlayer: { identityMatchStatus: 'unresolved', externalPlayerId: '228408' },
    })

    expect(result.identityStatus).toBe(STATS_IDENTITY_STATUS.NEW_PLAYER)
    expect(result.identityResolution).toBe('createNew')
  })

  test('preserves position and scout context when a pasted row matches the roster', () => {
    const player = {
      playerId: 'player-1',
      fullName: 'שחקן קיים',
      lineClassification: { line: 'DEFENSE' },
      primaryPosition: 'CB',
      positionLayer: 'CENTER',
      scoutProfiles: [{ profileId: 'anchor' }],
      scoutCombinations: ['defensive-core'],
      scoutProfileDisplay: { label: 'anchor' },
    }
    const row = enrichStatsRowForPreview(
      { fullName: 'שחקן קיים', minutes: 720 },
      buildRosterLookup([player])
    )

    expect(row.lineClassification).toEqual({ line: 'DEFENSE' })
    expect(row.primaryPosition).toBe('CB')
    expect(row.scoutProfiles).toEqual([{ profileId: 'anchor' }])
    expect(row.scoutCombinations).toEqual(['defensive-core'])
    expect(row.scoutProfileDisplay).toEqual({ label: 'anchor' })
  })
})
