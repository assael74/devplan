// shared/games/insights/team/targets/teamTargets.selectors.js

import {
  TEAM_GAMES_TARGET_GROUPS,
  TEAM_GAMES_TARGET_PROFILES,
} from './teamTargetProfiles.js'

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeId = (value) => {
  return String(value || '').trim()
}

const cloneProfileForLegacy = (profile) => {
  if (!profile) return null

  return {
    ...profile,

    // legacy flat fields
    targetPoints: profile.targets?.forecast?.points,
    targetPointsRate: profile.targets?.forecast?.pointsRate,
    targetGoalDifference: profile.targets?.forecast?.goalDifference,
    targetGoalsFor: profile.targets?.forecast?.goalsFor,
    targetGoalsAgainst: profile.targets?.forecast?.goalsAgainst,

    homeAwayTargets: profile.targets?.homeAway || null,
    difficultyTargets: profile.targets?.difficulty || null,
    scorersTargets: profile.targets?.scorers || null,
    squadUsageTargets: profile.targets?.squadUsage || null,
  }
}

export const getTeamGamesTargetProfiles = () => {
  return TEAM_GAMES_TARGET_PROFILES
}

export const getTeamGamesTargetProfileById = (id) => {
  const normalizedId = normalizeId(id)

  return (
    TEAM_GAMES_TARGET_PROFILES.find((profile) => {
      return profile.id === normalizedId
    }) || null
  )
}

export const getTeamGamesTargetGroup = (profileId, groupId) => {
  const profile = getTeamGamesTargetProfileById(profileId)

  if (!profile || !groupId) return null

  return profile.targets?.[groupId] || null
}

export const resolveTeamGamesTargetProfileByPosition = (position) => {
  const n = toNumber(position)

  if (!n) return null

  return (
    TEAM_GAMES_TARGET_PROFILES.find((profile) => {
      const min = toNumber(profile?.rankRange?.[0])
      const max = toNumber(profile?.rankRange?.[1])

      if (!min || !max) return false

      return n >= min && n <= max
    }) || null
  )
}

export const resolveTeamGamesTargetProfileByRange = (range = []) => {
  const min = toNumber(range?.[0])
  const max = toNumber(range?.[1])

  if (!min || !max) return null

  const exact = TEAM_GAMES_TARGET_PROFILES.find((profile) => {
    return profile?.rankRange?.[0] === min && profile?.rankRange?.[1] === max
  })

  if (exact) return exact

  return (
    TEAM_GAMES_TARGET_PROFILES.find((profile) => {
      const profileMin = toNumber(profile?.rankRange?.[0])
      const profileMax = toNumber(profile?.rankRange?.[1])

      if (!profileMin || !profileMax) return false

      const hasOverlap = min <= profileMax && max >= profileMin
      return hasOverlap
    }) || null
  )
}

export const resolveTeamGamesTargetProfileByProjectedPoints = (points) => {
  const n = toNumber(points)

  if (!Number.isFinite(n)) return null

  return (
    TEAM_GAMES_TARGET_PROFILES.find((profile) => {
      const min = toNumber(profile?.pointsRange?.min, 0)
      const max = profile?.pointsRange?.max

      if (max === null || max === undefined) {
        return n >= min
      }

      return n >= min && n < Number(max)
    }) || null
  )
}

export const getTeamGamesTargetProfileLabel = (profile) => {
  return (
    profile?.rankRangeLabel ||
    profile?.rankLabel ||
    profile?.shortLabel ||
    profile?.label ||
    ''
  )
}

// legacy selectors
export const getTeamGamesBenchmarkLevelById = (id) => {
  return cloneProfileForLegacy(getTeamGamesTargetProfileById(id))
}

export const getTeamGamesHomeAwayTargetsByLevelId = (id) => {
  return getTeamGamesTargetGroup(id, TEAM_GAMES_TARGET_GROUPS.HOME_AWAY)
}

export const getTeamGamesDifficultyTargetsByLevelId = (id) => {
  return getTeamGamesTargetGroup(id, TEAM_GAMES_TARGET_GROUPS.DIFFICULTY)
}

export const getTeamGamesScorersTargetsByLevelId = (id) => {
  return getTeamGamesTargetGroup(id, TEAM_GAMES_TARGET_GROUPS.SCORERS)
}

export const getTeamGamesSquadUsageTargetsByLevelId = (id) => {
  return getTeamGamesTargetGroup(id, TEAM_GAMES_TARGET_GROUPS.SQUAD_USAGE)
}

export const getTeamGamesTableLevels = () => {
  return TEAM_GAMES_TARGET_PROFILES.map(cloneProfileForLegacy)
}
