// shared/teams/targets/teamTargets.selectors.js

import {
  TEAM_TARGET_GROUPS,
  TEAM_TARGET_PROFILES,
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

export const getTeamTargetProfiles = () => {
  return TEAM_TARGET_PROFILES
}

export const getTeamTargetProfileById = (id) => {
  const normalizedId = normalizeId(id)

  return (
    TEAM_TARGET_PROFILES.find((profile) => {
      return profile.id === normalizedId
    }) || null
  )
}

export const getTeamTargetGroup = (profileId, groupId) => {
  const profile = getTeamTargetProfileById(profileId)

  if (!profile || !groupId) return null

  return profile.targets?.[groupId] || null
}

export const resolveTeamTargetProfileByRank = (rank) => {
  const n = toNumber(rank)

  if (!n) return null

  return (
    TEAM_TARGET_PROFILES.find((profile) => {
      const min = toNumber(profile?.rankRange?.[0])
      const max = toNumber(profile?.rankRange?.[1])

      if (!min || !max) return false

      return n >= min && n <= max
    }) || null
  )
}

export const resolveTeamTargetProfileByRange = (range = []) => {
  const min = toNumber(range?.[0])
  const max = toNumber(range?.[1])

  if (!min || !max) return null

  const exact = TEAM_TARGET_PROFILES.find((profile) => {
    return profile?.rankRange?.[0] === min && profile?.rankRange?.[1] === max
  })

  if (exact) return exact

  return (
    TEAM_TARGET_PROFILES.find((profile) => {
      const profileMin = toNumber(profile?.rankRange?.[0])
      const profileMax = toNumber(profile?.rankRange?.[1])

      if (!profileMin || !profileMax) return false

      return min <= profileMax && max >= profileMin
    }) || null
  )
}

export const resolveTeamTargetProfileByProjectedPoints = (points) => {
  const n = toNumber(points)

  if (!Number.isFinite(n)) return null

  return (
    TEAM_TARGET_PROFILES.find((profile) => {
      const min = toNumber(profile?.pointsRange?.min, 0)
      const max = profile?.pointsRange?.max

      if (max === null || max === undefined) {
        return n >= min
      }

      return n >= min && n < Number(max)
    }) || null
  )
}

export const getTeamTargetProfileLabel = (profile) => {
  return (
    profile?.rankRangeLabel ||
    profile?.rankLabel ||
    profile?.shortLabel ||
    profile?.label ||
    ''
  )
}

export const getTeamGamesBenchmarkLevelById = (id) => {
  return cloneProfileForLegacy(getTeamTargetProfileById(id))
}

export const getTeamGamesHomeAwayTargetsByLevelId = (id) => {
  return getTeamTargetGroup(id, TEAM_TARGET_GROUPS.HOME_AWAY)
}

export const getTeamGamesDifficultyTargetsByLevelId = (id) => {
  return getTeamTargetGroup(id, TEAM_TARGET_GROUPS.DIFFICULTY)
}

export const getTeamGamesScorersTargetsByLevelId = (id) => {
  return getTeamTargetGroup(id, TEAM_TARGET_GROUPS.SCORERS)
}

export const getTeamGamesSquadUsageTargetsByLevelId = (id) => {
  return getTeamTargetGroup(id, TEAM_TARGET_GROUPS.SQUAD_USAGE)
}

export const getTeamGamesTableLevels = () => {
  return TEAM_TARGET_PROFILES.map(cloneProfileForLegacy)
}

// legacy aliases
export const getTeamGamesTargetProfiles = getTeamTargetProfiles
export const getTeamGamesTargetProfileById = getTeamTargetProfileById
export const getTeamGamesTargetGroup = getTeamTargetGroup

export const resolveTeamGamesTargetProfileByPosition =
  resolveTeamTargetProfileByRank

export const resolveTeamGamesTargetProfileByRange =
  resolveTeamTargetProfileByRange

export const resolveTeamGamesTargetProfileByProjectedPoints =
  resolveTeamTargetProfileByProjectedPoints

export const resolveTeamGamesTableLevelByProjectedPoints =
  resolveTeamTargetProfileByProjectedPoints

export const resolveTeamGamesTableLevelByPosition =
  resolveTeamTargetProfileByRank

export const getTeamGamesTargetProfileLabel = getTeamTargetProfileLabel
