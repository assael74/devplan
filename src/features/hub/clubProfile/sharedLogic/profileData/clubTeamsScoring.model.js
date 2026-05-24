// src/features/hub/clubProfile/sharedLogic/profileData/clubTeamsScoring.model.js

import {
  buildTeamScoringModel,
} from '../../../teamProfile/sharedLogic/profileData/index.js'

const emptyArray = []

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const num = Number(value)

  return Number.isFinite(num) ? num : fallback
}

const roundNumber = (value, digits = 2) => {
  const num = Number(value)

  if (!Number.isFinite(num)) return null

  return Number(num.toFixed(digits))
}

const getTeamId = team => {
  return asText(team?.teamId || team?.id)
}

const getGameObject = row => {
  return row?.game || row || {}
}

const getGameStatus = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameStatus ||
      game?.gameStatus ||
      row?.status ||
      game?.status ||
      ''
  ).toLowerCase()
}

const getGameType = row => {
  const game = getGameObject(row)

  return asText(
    row?.type ||
      row?.gameType ||
      game?.type ||
      game?.gameType ||
      ''
  ).toLowerCase()
}

const isLeagueGame = row => {
  const type = getGameType(row)

  return !type || type === 'league'
}

const isPlayedGame = row => {
  const status = getGameStatus(row)

  return !status || status === 'played'
}

const getTeamGames = team => {
  if (Array.isArray(team?.teamGames)) return team.teamGames
  if (Array.isArray(team?.games)) return team.games

  return emptyArray
}

const getScoringGames = team => {
  return getTeamGames(team).filter(row => {
    return isLeagueGame(row) && isPlayedGame(row)
  })
}

const getLastRow = rows => {
  return Array.isArray(rows) && rows.length
    ? rows[rows.length - 1]
    : null
}

const getTeamRatingValue = ({ scoring, lastRow } = {}) => {
  return (
    scoring?.rating ??
    scoring?.avgRating ??
    scoring?.ratingRaw ??
    lastRow?.rating ??
    lastRow?.ratingRaw ??
    null
  )
}

const getTeamImpactValue = ({ scoring, lastRow } = {}) => {
  return (
    lastRow?.cumulativeImpact ??
    lastRow?.cumulativeTva ??
    lastRow?.tva ??
    scoring?.cumulativeImpact ??
    scoring?.totalImpact ??
    scoring?.tva ??
    null
  )
}

const buildSummary = scoring => {
  const rows = Array.isArray(scoring?.rows) ? scoring.rows : emptyArray
  const lastRow = getLastRow(rows)

  const rating = getTeamRatingValue({ scoring, lastRow })
  const impact = getTeamImpactValue({ scoring, lastRow })

  return {
    rating: toNumber(rating, null),
    ratingRaw: toNumber(rating, null),
    avgRating: toNumber(rating, null),
    teamRating: toNumber(rating, null),

    tva: toNumber(impact, null),
    cumulativeImpact: toNumber(impact, null),
    totalImpact: toNumber(impact, null),

    ratedGames: toNumber(scoring?.meta?.ratedGames ?? scoring?.ratedGames, 0),
    games: toNumber(scoring?.meta?.gamesCount, rows.length),
    scores: toNumber(scoring?.meta?.scoresCount, rows.length),

    lastGameId: lastRow?.gameId || '',
    lastGameDate: lastRow?.gameDate || '',
  }
}

const buildTeamScoringRow = ({ team, calculationMode } = {}) => {
  const games = getScoringGames(team)

  const scoring = buildTeamScoringModel({
    team,
    games,
    calculationMode,
  })

  const summary = buildSummary(scoring)

  return {
    teamId: getTeamId(team),
    team,

    scoring,
    summary,

    rows: scoring?.rows || emptyArray,
    points: scoring?.points || emptyArray,
    byGameId: scoring?.byGameId || {},

    trend: scoring?.trend || {
      points: scoring?.points || emptyArray,
      byGameId: scoring?.byGameId || {},
    },

    meta: {
      ready: true,
      source: 'clubProfile.teamScoring.adapter',
      calculationMode,
      gamesCount: games.length,
      scoresCount: scoring?.meta?.scoresCount || 0,
      ratedGames: summary?.ratedGames || 0,
      hasTrend: Boolean(scoring?.meta?.hasTrend),
    },
  }
}

const buildById = rows => {
  return rows.reduce((acc, row) => {
    if (row?.teamId) {
      acc[row.teamId] = row
    }

    return acc
  }, {})
}

export const buildClubTeamsScoringModel = ({ teams, calculationMode = 'games' } = {}) => {
  const safeTeams = Array.isArray(teams) ? teams : emptyArray

  const rows = safeTeams.map(team => {
    return buildTeamScoringRow({
      team,
      calculationMode,
    })
  })

  return {
    rows,
    byId: buildById(rows),

    meta: {
      ready: true,
      source: 'clubProfile.teamsScoring',
      calculationMode,
      teamsCount: safeTeams.length,
      scoredTeams: rows.filter(row => row?.meta?.ratedGames > 0).length,
    },
  }
}
