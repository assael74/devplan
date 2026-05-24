// playerProfile/sharedLogic/games/module/playerGames.filters.logic.js

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

import {
  applyPlayerGamesFilters,
  buildPlayerGamesSummary,
} from './playerGames.filters.apply.js'

import {
  buildPlayerGamesOptions,
  buildPlayerGamesIndicators,
} from './playerGames.filters.options.js'

const EXPECTATION_BASELINE = 6

const normalize = createGameRowNormalizer({})

const safeArray = (v) => (Array.isArray(v) ? v : [])

const safeNumberOrNull = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const safeNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const pickTeamScore = (row) => {
  return safeNumberOrNull(row?.goalsFor)
}

const pickRivalScore = (row) => {
  return safeNumberOrNull(row?.goalsAgainst)
}

const getGameId = row => {
  return String(
    row?.gameId ||
      row?.id ||
      row?.game?.id ||
      row?.game?.gameId ||
      ''
  ).trim()
}

const resolveScoreRow = ({ row, scoring }) => {
  const gameId = getGameId(row)

  return gameId
    ? scoring?.byGameId?.[gameId] || null
    : null
}

const resolveRatingKey = scoreRow => {
  const value = Number(
    scoreRow?.ratingRaw ??
      scoreRow?.rating
  )

  if (!Number.isFinite(value)) return ''

  return value >= EXPECTATION_BASELINE
    ? 'positive'
    : 'negative'
}

const buildDisplayMeta = (row, player) => {
  const isAway = row?.homeKey === 'away'

  const team = row?.team || player?.team || null

  const myClubName = team?.club?.clubName || 'מועדון'

  const myTeamName = team?.teamName || 'ללא קבוצה'

  const rivalName = row?.rival || row?.rivel || 'ללא יריבה'

  const myTeamOnLeft = !isAway

  const leftName = myTeamOnLeft ? myClubName : rivalName
  const rightName = myTeamOnLeft ? rivalName : myClubName

  const goalsFor = safeNumberOrNull(row?.goalsFor)
  const goalsAgainst = safeNumberOrNull(row?.goalsAgainst)

  const leftScore = myTeamOnLeft ? goalsFor : goalsAgainst
  const rightScore = myTeamOnLeft ? goalsAgainst : goalsFor

  return {
    isAway,
    myTeamOnLeft,
    myClubName,
    myTeamName,
    rivalName,
    leftName,
    rightName,
    leftScore,
    rightScore,
    displayTitle: `${leftName} - ${rightName}`,
    displayScore: `${leftScore} - ${rightScore}`,
  }
}

const normalizePlayerGameRow = (rawGame, player, scoring) => {
  const normalizedGame = normalize(rawGame || {})
  const personal = rawGame?.playerGame || {}
  const isSelected = personal?.isSelected || personal?.onSquad
  const isStarting = personal?.isStarting || personal?.onStart
  const gameLeagueNum = rawGame?.gameLeagueNum || 0

  const scoreRow = resolveScoreRow({
    row: rawGame,
    scoring,
  })

  const baseRow = {
    ...normalizedGame,
    rawGame: rawGame || null,
    player: player || null,
    team: normalizedGame?.team || rawGame?.team || player?.team || null,

    scoreRow,
    rating: scoreRow?.ratingRaw ?? scoreRow?.rating ?? null,
    impactDelta: scoreRow?.impactDelta ?? null,
    cumulativeImpact: scoreRow?.cumulativeImpact ?? scoreRow?.tva ?? null,
    ratingKey: resolveRatingKey(scoreRow),

    playerGame: personal,

    goals: safeNumber(personal?.goals),
    assists: safeNumber(personal?.assists),
    timePlayed: safeNumber(personal?.timePlayed),
    gameLeagueNum,

    isSelected: isSelected,
    isStarting: isStarting,

    hasEntry: personal?.isSelected === true || safeNumber(personal?.timePlayed) > 0,
  }

  return {
    ...baseRow,
    ...buildDisplayMeta(baseRow, player),
  }
}

export const resolvePlayerGamesFiltersDomain = (player, filters, context = {}) => {
  const raw = safeArray(player?.playerGames)

  const scoring =
    context?.scoring ||
    context?.profileData?.playerScoring ||
    context?.profileData?.scoring?.player ||
    null

  const enriched = raw.map(game => {
    return normalizePlayerGameRow(game, player, scoring)
  })

  const filtered = applyPlayerGamesFilters(enriched, filters)

  return {
    games: filtered,
    summary: buildPlayerGamesSummary(enriched, filtered, filters),
    options: buildPlayerGamesOptions(enriched),
    indicators: buildPlayerGamesIndicators(filters),
  }
}
