// src/shared/scouting/players/profileProgression/playerProfileProgression.js

import {
  SCOUT_PROFILES,
} from '../profiles.js'

import {
  buildScoutMetrics,
} from '../metrics.js'

import {
  buildPlayerProfileDistance,
} from './playerProfileDistance.js'

import {
  NEAR_PROFILE_ELIGIBLE_PROFILE_IDS,
  PROFILE_DISTANCE_STATUS,
} from './playerProfileProgression.model.js'

const getProfileRules = ({ profile, searchDistance = 0 }) => {
  const deepRules = Array.isArray(profile?.deepRules) ? profile.deepRules : []

  if (searchDistance >= 2 && deepRules.length) return deepRules

  return Array.isArray(profile?.rules) ? profile.rules : []
}

const getPreviousDistance = ({ previousProfileDistances, profileId }) => {
  if (!previousProfileDistances) return null

  if (Array.isArray(previousProfileDistances)) {
    const match = previousProfileDistances.find((item) => item?.profileId === profileId)
    const value = match?.distance

    if (value === null || value === undefined || value === '') return null

    return Number.isFinite(Number(value)) ? Number(value) : null
  }

  const value = previousProfileDistances[profileId]

  if (value === null || value === undefined || value === '') return null

  return Number.isFinite(Number(value)) ? Number(value) : null
}

const isNearProfileCandidate = (distanceResult) => {
  if (distanceResult.matched) return false

  return distanceResult.status === PROFILE_DISTANCE_STATUS.VERY_CLOSE ||
    distanceResult.status === PROFILE_DISTANCE_STATUS.NEAR
}

export const buildPlayerProfileProgression = ({
  player,
  team,
  searchDistance = 0,
  profiles = SCOUT_PROFILES,
  previousProfileDistances,
} = {}) => {
  const metrics = buildScoutMetrics({ player, team })
  const distances = profiles
    .filter((profile) => (
      profile.group !== 'opportunity' &&
      NEAR_PROFILE_ELIGIBLE_PROFILE_IDS.includes(profile.id)
    ))
    .map((profile) => {
      const rules = getProfileRules({ profile, searchDistance })
      const previousDistance = getPreviousDistance({
        previousProfileDistances,
        profileId: profile.id,
      })

      return buildPlayerProfileDistance({
        profile,
        rules,
        metrics,
        previousDistance,
      })
    })
  const nearProfiles = distances
    .filter(isNearProfileCandidate)
    .sort((a, b) => (a.distance || 1) - (b.distance || 1))

  return {
    distances,
    nearProfiles,
    nearestProfile: nearProfiles[0] || null,
  }
}
