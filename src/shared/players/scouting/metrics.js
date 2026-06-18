// src/shared/players/scouting/metrics.js

const toNum = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const pickNum = (...values) => {
  for (const value of values) {
    const n = toNum(value, null)
    if (Number.isFinite(n)) return n
  }

  return 0
}

const hasValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

const ratio = (value, total) => {
  const n = toNum(value, 0)
  const t = toNum(total, 0)

  return t > 0 ? n / t : 0
}

const hasPosition = (player = {}) => {
  return Boolean(
    player?.primaryPosition ||
      player?.position ||
      player?.positionId ||
      (Array.isArray(player?.positions) && player.positions.length)
  )
}

const getTeamGames = ({ team, player }) => {
  return pickNum(
    team?.gamesPlayed,
    team?.playedGames,
    team?.games,
    team?.teamGamesCount,
    player?.teamGames,
    player?.leagueGames
  )
}

const getPlayerGames = (player = {}) => {
  return pickNum(
    player?.games,
    player?.gamesPlayed,
    player?.appearances,
    player?.matches,
    player?.apps
  )
}

const getSeasonMinutes = ({ team, player }) => {
  const teamGames = getTeamGames({ team, player })
  const gameTime = pickNum(team?.leagueGameTime, player?.gameTime, 90)

  return teamGames * gameTime
}

const getTeamGoals = ({ team, player }) => {
  return pickNum(
    team?.goalsFor,
    team?.leagueGoalsFor,
    team?.teamGoals,
    player?.teamGoals,
    player?.teamGoalsFor
  )
}

const getGoalGames = (player = {}) => {
  return pickNum(
    player?.goalGames,
    player?.gamesWithGoals,
    player?.scoringGames
  )
}

export const buildScoutMetrics = ({ player = {}, team = {} } = {}) => {
  const minutes = pickNum(player?.minutes, player?.totalMinutes, player?.playedMinutes)
  const games = getPlayerGames(player)
  const teamGames = getTeamGames({ team, player })
  const seasonMinutes = getSeasonMinutes({ team, player })
  const starts = pickNum(player?.starts, player?.lineupStarts, player?.started)
  const subIn = pickNum(player?.subIn, player?.subbedIn, player?.substituteApps)
  const subOut = pickNum(player?.subOut, player?.subbedOut, player?.substitutedOut)
  const goals = pickNum(player?.goals, player?.leagueGoals)
  const yellowCards = pickNum(player?.yellowCards, player?.cardsYellow, player?.yc)
  const penaltyGoals = hasValue(player?.penaltyGoals) ? toNum(player.penaltyGoals) : null
  const teamGoals = getTeamGoals({ team, player })
  const birthYear = pickNum(player?.birthYear, player?.yearOfBirth)
  const teamBirthYear = pickNum(team?.birthYear, team?.ageGroupYear)
  const goalGames = getGoalGames(player)

  return {
    minutes,
    games,
    teamGames,
    seasonMinutes,
    starts,
    subIn,
    subOut,
    goals,
    yellowCards,
    penaltyGoals,
    teamGoals,
    birthYear,
    teamBirthYear,
    goalGames,

    minutesPct: ratio(minutes, seasonMinutes),
    startsPct: ratio(starts, teamGames || games),
    subInPct: ratio(subIn, teamGames || games),
    subOutPct: ratio(subOut, starts || games),
    goalsPer90: ratio(goals * 90, minutes),
    yellowCardsPer90: ratio(yellowCards * 90, minutes),
    goalsShareOfTeam: ratio(goals, teamGoals),
    scoringGamesPct: ratio(goalGames, games),

    hasPosition: hasPosition(player),
    hasPenaltySplit: penaltyGoals !== null,
    isYoungerAgeGroup:
      Boolean(birthYear && teamBirthYear && birthYear > teamBirthYear) ||
      toNum(player?.playingUpMinutes, 0) > 0,
  }
}

export const getScoutDataAvailability = ({ player = {}, team = {} } = {}) => {
  return {
    minutes: hasValue(player?.minutes) || hasValue(player?.totalMinutes),
    games:
      hasValue(player?.games) ||
      hasValue(player?.appearances) ||
      hasValue(team?.gamesPlayed) ||
      hasValue(team?.games),
    starts: hasValue(player?.starts) || hasValue(player?.lineupStarts),
    substitutions:
      hasValue(player?.subIn) ||
      hasValue(player?.subOut) ||
      hasValue(player?.subbedIn) ||
      hasValue(player?.subbedOut),
    goals: hasValue(player?.goals) || hasValue(player?.leagueGoals),
    yellowCards:
      hasValue(player?.yellowCards) ||
      hasValue(player?.cardsYellow) ||
      hasValue(player?.yc),
    birthYear: hasValue(player?.birthYear) || hasValue(player?.yearOfBirth),
    position: hasPosition(player),
    teamGoals:
      hasValue(team?.goalsFor) ||
      hasValue(team?.leagueGoalsFor) ||
      hasValue(player?.teamGoals),
    penalties: hasValue(player?.penaltyGoals),
    timeSeries:
      Array.isArray(player?.snapshots) ||
      Array.isArray(player?.gameLogs) ||
      hasValue(player?.goalGames),
  }
}

