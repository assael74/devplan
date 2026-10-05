// src/shared/scouting/players/reclassification/playerProfileReclassification.test.js

import { reclassifyPlayerScoutSignals } from './playerProfileReclassification.js'

const preliminarySignal = {
  profileId: 'preliminary_low_output',
  profileIdentity: 'preliminary',
  profileStrength: { depthPct: 20 },
}

describe('player profile reclassification', () => {
  test('prefers a known attacking position over a defensive statistical inference', () => {
    const result = reclassifyPlayerScoutSignals({
      signals: [preliminarySignal],
      player: {
        positionLayer: 'attack',
        lineClassification: { line: 'defense' },
      },
    })

    expect(result.reclassification.targetProfileId).toBe('attacking_support')
    expect(result.signals.map(signal => signal.profileId)).toContain('attacking_support')
  })
})
