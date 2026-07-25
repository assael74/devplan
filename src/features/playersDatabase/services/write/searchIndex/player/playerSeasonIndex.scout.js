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
