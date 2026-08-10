// features/playersDatabase/services/write/searchIndex/player/playerSeasonIndex.scout.js

import { adaptPlayerScoutEngineResult } from '../../../../domain/index.js'
import { clean } from '../../leagues/leagueDoc.js'
import { uniqueCleanValues } from './playerSeasonIndex.identity.js'

export const normalizeScoutSignalsForIndex = player => {
  const sourceProfiles = Array.isArray(player?.scoutSignals)
    ? player.scoutSignals
    : Array.isArray(player?.scoutProfiles)
      ? player.scoutProfiles
      : []

  return sourceProfiles
    .filter(profile => clean(profile?.profileId))
    .map(profile => {
      const reliabilityLevel = clean(
        profile.reliability?.level ||
        profile.reliabilityLevel ||
        ''
      )
      const reliabilityScoreValue = profile.reliability?.score !== undefined
        && profile.reliability?.score !== null
        ? profile.reliability.score
        : profile.reliabilityScore
      const reliabilityScore = Number.isFinite(Number(reliabilityScoreValue))
        ? Number(reliabilityScoreValue)
        : null
      const score = Number.isFinite(Number(profile.score))
        ? Number(profile.score)
        : null

      return {
        ...profile,
        profileId: clean(profile.profileId),
        reliability: {
          level: reliabilityLevel,
          score: reliabilityScore,
        },
        score,
      }
    })
}

export const buildScoutProfileIds = scoutSignals => (
  uniqueCleanValues(
    (Array.isArray(scoutSignals) ? scoutSignals : [])
      .map(signal => signal?.profileId)
  )
)

export const buildScoutCombinationIds = ({
  scoutSignals = [],
  scoutCombinations = [],
} = {}) => adaptPlayerScoutEngineResult({
  signals: Array.isArray(scoutSignals) ? scoutSignals : [],
  combinations: Array.isArray(scoutCombinations) ? scoutCombinations : [],
}).combinationIds

export const buildScoutProfileSearchIds = ({
  scoutProfileIds = [],
  scoutCombinationIds = [],
} = {}) => uniqueCleanValues([
  ...scoutProfileIds,
  ...scoutCombinationIds,
])

const toNullableNumber = value => (
  Number.isFinite(Number(value))
    ? Number(value)
    : null
)

export const buildPlayerScoutIndexFields = player => {
  const scoutSignals = normalizeScoutSignalsForIndex(player)
  const scout = adaptPlayerScoutEngineResult({
    signals: scoutSignals,
    combinations: Array.isArray(player?.scoutCombinations)
      ? player.scoutCombinations
      : [],
  })
  const primaryProfile = scout.primaryProfile
  const secondaryProfile = scout.secondaryProfile
  const scoutProfileIds = scout.profileIds
  const scoutCombinationIds = scout.combinationIds

  return {
    primaryScoutProfileId: clean(primaryProfile?.id),
    primaryScoutReliabilityLevel: clean(
      primaryProfile?.reliability?.level
    ),
    primaryScoutWarnings: uniqueCleanValues(primaryProfile?.warnings),
    primaryScoutScore: toNullableNumber(primaryProfile?.score),
    secondaryScoutProfileId: clean(secondaryProfile?.id),
    secondaryScoutReliabilityLevel: clean(
      secondaryProfile?.reliability?.level
    ),
    secondaryScoutWarnings: uniqueCleanValues(secondaryProfile?.warnings),
    secondaryScoutScore: toNullableNumber(secondaryProfile?.score),
    scoutProfileIds,
    scoutCombinationIds,
    scoutProfileSearchIds: buildScoutProfileSearchIds({
      scoutProfileIds,
      scoutCombinationIds,
    }),
  }
}

