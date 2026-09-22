// src/shared/scouting/players/trajectory/playerTrajectory.utils.js

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const ratio = (value, total) => {
  const safeValue = toNumber(value, 0)
  const safeTotal = toNumber(total, 0)

  return safeTotal > 0 ? safeValue / safeTotal : 0
}

const seasonOrder = (stint = {}) => {
  const seasonKey = String(stint.seasonKey || stint.season || '')
  const match = seasonKey.match(/(?:^|[^0-9])(\d{2,4})\s*[\/_-]\s*(\d{2,4})(?:$|[^0-9])/)

  if (match) {
    const first = Number(match[1])
    return first < 100 ? 2000 + first : first
  }

  return toNumber(stint.seasonOrder, toNumber(stint.seasonId, 0))
}

const getProfileIds = (stint = {}) => {
  const profiles = Array.isArray(stint.scoutProfiles) ? stint.scoutProfiles : []

  return profiles
    .map((profile) => {
      if (typeof profile === 'string') return profile
      return profile?.profileId || profile?.id || ''
    })
    .filter(Boolean)
}

const getStats = (stint = {}) => stint.playerStats || stint.stats || {}

const getNearProfileIds = (stint = {}) => {
  const progression = stint.scoutProfileProgression || stint.profileProgression || {}
  const nearProfiles = Array.isArray(progression.nearProfiles)
    ? progression.nearProfiles
    : Array.isArray(stint.scoutCandidateSignals)
      ? stint.scoutCandidateSignals
      : []

  return nearProfiles
    .map(item => item?.profileId || item?.id || '')
    .filter(Boolean)
}

export const normalizePlayerSeasonStint = (stint = {}, inputIndex = 0) => {
  const stats = getStats(stint)
  const minutes = toNumber(stats.minutes, toNumber(stint.minutes, 0))
  const starts = toNumber(stats.starts, toNumber(stint.starts, 0))
  const games = toNumber(stats.games, toNumber(stint.games, 0))
  const teamGames = toNumber(stats.teamGames, toNumber(stint.teamGames, 0))
  const teamMinutes = toNumber(stats.teamMinutes, toNumber(stint.teamMinutes, 0))
  const goals = toNumber(stats.goals, toNumber(stint.goals, 0))
  const clubLevel = toNumber(stint.clubLevel, 0)
  const clubStrengthLevel = toNumber(stint.clubStrengthLevel, clubLevel)
  const leagueLevel = toNumber(stint.leagueLevel, 0)
  const effectiveTeamGames = teamGames || games
  const storedGoalsPer90 = toNumber(stats.goalsPer90, toNumber(stint.goalsPer90, 0))

  return {
    inputIndex,
    seasonId: stint.seasonId || '',
    seasonKey: stint.seasonKey || stint.season || '',
    seasonOrder: seasonOrder(stint),
    seasonStatus: stint.seasonStatus || (stint.lifecycle?.isFinal === true ? 'completed' : ''),
    leagueId: stint.leagueId || '',
    clubId: stint.clubId || '',
    clubName: stint.clubName || stint.teamName || '',
    birthTeamId: stint.birthTeamId || '',
    birthTeamDocumentId: stint.birthTeamDocumentId || stint.teamDocumentId || '',
    teamId: stint.teamId || '',
    teamName: stint.teamName || stint.clubName || '',
    rosterStatus: stint.rosterStatus || '',
    clubLevel,
    clubStrengthLevel,
    leagueLevel,
    isYoungerAgeGroup: Boolean(stint.isYoungerAgeGroup),
    primaryPosition: stint.primaryPosition || '',
    positionLayer: stint.positionLayer || '',
    minutes,
    games,
    starts,
    goals,
    teamGames: effectiveTeamGames,
    teamMinutes,
    minutesPct: teamMinutes > 0 ? ratio(minutes, teamMinutes) : 0,
    startsPct: ratio(starts, effectiveTeamGames),
    goalsPer90: storedGoalsPer90 || (minutes > 0 ? ratio(goals * 90, minutes) : 0),
    profileIds: getProfileIds(stint),
    nearProfileIds: getNearProfileIds(stint),
  }
}

export const normalizePlayerSeasonStints = (stints = []) => {
  const safeStints = Array.isArray(stints) ? stints : []

  return safeStints
    .map((stint, index) => normalizePlayerSeasonStint(stint, index))
    .sort((a, b) => {
      if (a.seasonOrder !== b.seasonOrder) return a.seasonOrder - b.seasonOrder
      return a.inputIndex - b.inputIndex
    })
}

const mergeProfileIds = (stints = []) => {
  return [...new Set(stints.flatMap(stint => stint.profileIds || []))]
}

const mergeNearProfileIds = (stints = []) => {
  return [...new Set(stints.flatMap(stint => stint.nearProfileIds || []))]
}

const buildSeasonSummary = (seasonStints = []) => {
  const first = seasonStints[0] || null
  const latest = seasonStints[seasonStints.length - 1] || null

  if (!first || !latest) return null

  const totals = seasonStints.reduce((result, stint) => {
    return {
      minutes: result.minutes + stint.minutes,
      games: result.games + stint.games,
      starts: result.starts + stint.starts,
      goals: result.goals + stint.goals,
      teamGames: result.teamGames + stint.teamGames,
      teamMinutes: result.teamMinutes + stint.teamMinutes,
    }
  }, {
    minutes: 0,
    games: 0,
    starts: 0,
    goals: 0,
    teamGames: 0,
    teamMinutes: 0,
  })

  return {
    seasonId: latest.seasonId || first.seasonId,
    seasonKey: latest.seasonKey || first.seasonKey,
    seasonOrder: latest.seasonOrder,
    seasonStatus: latest.seasonStatus || first.seasonStatus || '',
    stintsCount: seasonStints.length,
    clubId: latest.clubId,
    birthTeamId: latest.birthTeamId,
    teamId: latest.teamId,
    clubLevel: latest.clubLevel,
    clubStrengthLevel: latest.clubStrengthLevel || latest.clubLevel,
    leagueLevel: latest.leagueLevel,
    isYoungerAgeGroup: seasonStints.some(stint => stint.isYoungerAgeGroup),
    primaryPosition: latest.primaryPosition,
    positionLayer: latest.positionLayer,
    minutes: totals.minutes,
    games: totals.games,
    starts: totals.starts,
    goals: totals.goals,
    teamGames: totals.teamGames,
    teamMinutes: totals.teamMinutes,
    minutesPct: totals.teamMinutes > 0 ? ratio(totals.minutes, totals.teamMinutes) : 0,
    startsPct: ratio(totals.starts, totals.teamGames || totals.games),
    goalsPer90: totals.minutes > 0 ? ratio(totals.goals * 90, totals.minutes) : 0,
    profileIds: mergeProfileIds(seasonStints),
    nearProfileIds: mergeNearProfileIds(seasonStints),
  }
}

export const buildPlayerSeasonSummaries = (normalizedStints = []) => {
  const groups = new Map()

  normalizedStints.forEach((stint) => {
    const key = stint.seasonOrder || stint.seasonKey || stint.seasonId

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(stint)
  })

  return [...groups.values()]
    .map(buildSeasonSummary)
    .filter(Boolean)
    .sort((a, b) => a.seasonOrder - b.seasonOrder)
}

// Competitive-level contract: lower numeric values represent stronger levels.
export const compareCompetitiveLevel = (previousLevel, currentLevel) => {
  const previous = toNumber(previousLevel, 0)
  const current = toNumber(currentLevel, 0)

  if (!previous || !current) return 0
  if (current < previous) return 1
  if (current > previous) return -1

  return 0
}

export const compareOptionalLevel = compareCompetitiveLevel

export const getDelta = (previousValue, currentValue) => {
  return toNumber(currentValue, 0) - toNumber(previousValue, 0)
}
