// src/shared/teams/scout/teamScout.builder.js

import { addTeamScoutRankings } from './teamScout.rankings.js'
import {
  buildTeamScoutEnvironment,
  buildTeamScoutPerformance,
} from './teamScout.performance.js'
import {
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from './teamScout.model.js'

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const pickFirstNumber = (...values) => {
  for (const value of values) {
    const n = toNumber(value)
    if (Number.isFinite(n)) return n
  }

  return null
}

const pickFirstText = (...values) => {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text) return text
  }

  return ''
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Number(n.toFixed(digits))
}

const normalizeTeamScoutRow = (row = {}, index = 0) => {
  const gamesPlayed = pickFirstNumber(
    row.gamesPlayed,
    row.playedGames,
    row.matchesPlayed,
    row.games,
    row.played,
    row.p,
    row.teamStats && row.teamStats.teamGamePlayed,
    row.teamStats && row.teamStats.games
  )
  const goalsFor = pickFirstNumber(
    row.goalsFor,
    row.leagueGoalsFor,
    row.gf,
    row.teamStats && row.teamStats.goalsFor
  )
  const goalsAgainst = pickFirstNumber(
    row.goalsAgainst,
    row.leagueGoalsAgainst,
    row.ga,
    row.teamStats && row.teamStats.goalsAgainst
  )
  const points = pickFirstNumber(
    row.points,
    row.pts,
    row.teamStats && row.teamStats.points
  )
  const position = pickFirstNumber(
    row.position,
    row.rank,
    row.tablePosition,
    row.place
  )

  if (!position || !gamesPlayed || gamesPlayed <= 0) return null
  if (!Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) return null

  return {
    teamId: pickFirstText(
      row.teamId,
      row.id,
      row.team && row.team.id,
      `team_${index + 1}`
    ),
    teamName: pickFirstText(
      row.teamName,
      row.name,
      row.team && row.team.name
    ),
    position,
    gamesPlayed,
    points,
    goalsFor,
    goalsAgainst,
    pointsPerGame: points === null
      ? null
      : roundNumber(points / gamesPlayed, 3),
    goalsForPerGame: roundNumber(goalsFor / gamesPlayed, 3),
    goalsAgainstPerGame: roundNumber(goalsAgainst / gamesPlayed, 3),
    source: row,
  }
}

const addTeamScoutProjection = (row, leagueNumGames) => {
  const seasonGames = toNumber(leagueNumGames, 30)
  const gamesRemaining = Math.max(seasonGames - row.gamesPlayed, 0)

  return {
    ...row,
    leagueNumGames: seasonGames,
    gamesRemaining,
    projectedPoints: row.pointsPerGame === null
      ? null
      : roundNumber(row.pointsPerGame * seasonGames, 1),
    projectedGoalsFor: roundNumber(row.goalsForPerGame * seasonGames, 1),
    projectedGoalsAgainst: roundNumber(
      row.goalsAgainstPerGame * seasonGames,
      1
    ),
  }
}

const sortTeamScoutRows = (rows, sortMode) => {
  if (sortMode === TEAM_SCOUT_SORT_MODE.TABLE) {
    return [...rows].sort((a, b) => a.position - b.position)
  }

  const scoreKey = sortMode === TEAM_SCOUT_SORT_MODE.DEFENSE
    ? 'defense'
    : 'offense'

  return [...rows].sort((a, b) => {
    const first = toNumber(
      a[scoreKey] && (
        a[scoreKey].scoutPriorityRate ??
        a[scoreKey].combinedRate
      ),
      -Infinity
    )
    const second = toNumber(
      b[scoreKey] && (
        b[scoreKey].scoutPriorityRate ??
        b[scoreKey].combinedRate
      ),
      -Infinity
    )

    if (second !== first) return second - first
    return a.position - b.position
  })
}

export const buildTeamScoutLeagueModel = ({
  leagueLevel,
  leagueNumGames = 30,
  rows = [],
  normalizationMode = TEAM_SCOUT_NORMALIZATION_MODE.OFF,
  normalizationFactor,
  sortMode = TEAM_SCOUT_SORT_MODE.OFFENSE,
} = {}) => {
  const normalizedRows = rows
    .map(normalizeTeamScoutRow)
    .filter(Boolean)
    .map((row) => addTeamScoutProjection(row, leagueNumGames))
  const rankedRows = addTeamScoutRankings(normalizedRows)
  const environment = buildTeamScoutEnvironment({
    rows: normalizedRows,
    leagueLevel,
    mode: normalizationMode,
    manualFactor: normalizationFactor,
  })
  const resultRows = rankedRows.map((row) => {
    return buildTeamScoutPerformance({
      row,
      leagueLevel,
      leagueNumGames,
      environmentFactor: environment.appliedFactor,
      teamsCount: rankedRows.length,
    })
  })

  return {
    leagueLevel: toNumber(leagueLevel),
    leagueNumGames: toNumber(leagueNumGames, 30),
    teamsCount: resultRows.length,
    normalization: environment,
    sortMode,
    rows: sortTeamScoutRows(resultRows, sortMode),
  }
}
