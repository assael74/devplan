// src/features/playersDatabase/domain/statsV2/playerDocumentScout.projection.test.js

import { buildStatsPlayerDocumentSeasonRow } from './playerDocumentStats.projection.js'

const hasUndefined = value => {
  if (value === undefined) return true
  if (Array.isArray(value)) return value.some(hasUndefined)
  if (value && typeof value === 'object') return Object.values(value).some(hasUndefined)
  return false
}

describe('Stats V2 Player Document scout projection', () => {
  test('projects engine scouting output to the compact Player Document catalog shape', () => {
    const row = buildStatsPlayerDocumentSeasonRow({
      season: { seasonKey: '2026-2027' },
      player: {
        scoutProfiles: [{
          id: 'profile-1',
          profileIdentity: 'ATTACKER',
          profileStrength: {
            depthPct: 75,
            baseDepthPct: null,
            contextAdjustmentPct: 5,
          },
          profileConfidence: {
            level: 'high',
            reason: 'fixture',
            engineOnly: 'must-not-persist',
          },
          reasons: ['fixture'],
          engineOnly: 'must-not-persist',
        }],
        scoutCombinations: [{
          id: 'combination-1',
          idIcon: 'elite',
          label: 'Combination 1',
          group: 'attack',
          profileIds: ['profile-1'],
          matchedProfileIds: ['profile-1'],
        }, {
          id: 'combination-2',
          idIcon: 'link',
          label: 'Combination 2',
          group: 'attack',
          profileIds: ['profile-1'],
          matchedProfileIds: ['profile-1'],
        }],
        scoutOpportunity: {
          source: 'engine',
          evaluations: [{
            id: 'evaluation-1',
            result: 'positive',
            points: 2,
            reason: 'fixture',
            profileId: 'profile-1',
            details: { allowedDetail: true, optionalDetail: undefined },
            engineOnly: 'must-not-persist',
          }],
          signalPersistence: {
            profileRepeat: { profile1: 2, optional: undefined },
            engineOnly: 'must-not-persist',
          },
          engineOnly: 'must-not-persist',
        },
        scoutProfileProgression: {
          distances: [{
            profileId: 'profile-1',
            distancePct: null,
            status: 'close',
            matched: false,
            ruleDistances: [{ min: undefined, max: undefined }],
            engineOnly: 'must-not-persist',
          }],
        },
        scoutProfileHierarchy: {
          primaryProfileId: 'profile-1',
          exclusiveFamilyWinners: {
            goal_output: 'profile-1',
            engineOnly: 'must-not-persist',
          },
          engineOnly: 'must-not-persist',
        },
      },
    })

    expect(hasUndefined(row)).toBe(false)
    expect(row.scoutProfiles).toEqual([{
      profileId: 'profile-1',
      profileIdentity: 'ATTACKER',
      strength: {
        depthPct: 75,
        baseDepthPct: null,
        contextAdjustmentPct: 5,
      },
      confidence: {
        level: 'high',
        reason: 'fixture',
      },
      reasons: ['fixture'],
    }])
    expect(row.scoutCombinationIds).toEqual([
      'combination-1',
      'combination-2',
    ])
    expect(row.scoutProfileProgression).toEqual({
      distances: [{
        profileId: 'profile-1',
        distancePct: null,
        status: 'close',
        matched: false,
      }],
    })
    expect(row.scoutOpportunity.evaluations[0]).toEqual({
      id: 'evaluation-1',
      result: 'positive',
      points: 2,
      reason: 'fixture',
      profileId: 'profile-1',
      details: { allowedDetail: true },
    })
    expect(row.scoutOpportunity.signalPersistence).toEqual({
      profileRepeat: { profile1: 2 },
      combinationRepeat: {},
      attackingOutputUpgrade: {},
      decay: {},
      reasons: [],
    })
    expect(row.scoutProfileHierarchy.exclusiveFamilyWinners).toEqual({
      goal_output: 'profile-1',
    })
    expect(JSON.stringify(row)).not.toContain('ruleDistances')
    expect(JSON.stringify(row)).not.toContain('engineOnly')
  })
})
