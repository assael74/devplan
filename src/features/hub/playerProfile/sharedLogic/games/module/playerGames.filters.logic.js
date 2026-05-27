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

const safeArray = v => (Array.isArray(v) ? v : [])

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const safeNumberOrNull = v => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const safeNumber = v => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const toBoolOrFallback = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

const getGameId = row => {
  const game = row?.game || row || {}

  return asText(
    row?.gameId ||
      row?.id ||
      game?.id ||
      game?.gameId ||
      ''
  )
}

const isPrivatePlayer = player => {
  return (
    player?.isPrivatePlayer === true ||
    player?.playerSource === 'private'
  )
}

const resolveSourceGames = ({ player, profileData }) => {
  const profileGames = profileData?.games?.playerGames

  if (Array.isArray(profileGames) && profileGames.length) {
    return profileGames
  }

  if (isPrivatePlayer(player)) {
    return safeArray(player?.externalGames)
  }

  return safeArray(player?.playerGames)
}

const resolveScoreRow = ({ row, scoring }) => {
  const gameId = getGameId(row)

  return gameId
    ? scoring?.byGameId?.[gameId] || null
    : null
}

const resolveEntryByGameId = ({ row, profileData }) => {
  const gameId = getGameId(row)

  return gameId
    ? profileData?.games?.playerGameById?.[gameId] || null
    : null
}

const resolvePlayerEntry = ({ rawGame, player, profileData }) => {
  const byIdEntry = resolveEntryByGameId({
    row: rawGame,
    profileData,
  })

  if (byIdEntry) return byIdEntry

  if (rawGame?.playerGame) return rawGame.playerGame
  if (rawGame?.stats) return rawGame.stats

  if (isPrivatePlayer(player)) {
    return {
      playerId: rawGame?.playerId || player?.id || player?.playerId || '',
      isSelected: rawGame?.isSelected ?? rawGame?.onSquad ?? true,
      isStarting: rawGame?.isStarting ?? rawGame?.onStart ?? false,
      onSquad: rawGame?.onSquad ?? rawGame?.isSelected ?? true,
      onStart: rawGame?.onStart ?? rawGame?.isStarting ?? false,
      goals: rawGame?.goals ?? 0,
      assists: rawGame?.assists ?? 0,
      timePlayed: rawGame?.timePlayed ?? 0,
    }
  }

  return {}
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

  const myClubName =
    row?.clubName ||
    player?.clubName ||
    team?.club?.clubName ||
    'מועדון'

  const myTeamName =
    row?.teamName ||
    player?.teamName ||
    team?.teamName ||
    'ללא קבוצה'

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

const normalizePlayerGameRow = ({ rawGame, player, scoring, profileData }) => {
  const normalizedGame = normalize(rawGame || {})
  const personal = resolvePlayerEntry({ rawGame, player, profileData })

  const isSelected = toBoolOrFallback(
    personal?.isSelected ?? personal?.onSquad,
    false
  )

  const isStarting = toBoolOrFallback(
    personal?.isStarting ?? personal?.onStart,
    false
  )

  const onSquad = toBoolOrFallback(
    personal?.onSquad ?? personal?.isSelected,
    isSelected
  )

  const onStart = toBoolOrFallback(
    personal?.onStart ?? personal?.isStarting,
    isStarting
  )

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
    stats: personal,

    goals: safeNumber(personal?.goals),
    assists: safeNumber(personal?.assists),
    timePlayed: safeNumber(personal?.timePlayed),
    gameLeagueNum,

    isSelected,
    isStarting,
    onSquad,
    onStart,

    hasEntry: isSelected || onSquad || safeNumber(personal?.timePlayed) > 0,
  }

  return {
    ...baseRow,
    ...buildDisplayMeta(baseRow, player),
  }
}

export const resolvePlayerGamesFiltersDomain = (player, filters, context = {}) => {
  const profileData = context?.profileData || null

  const raw = resolveSourceGames({
    player,
    profileData,
  })

  const scoring =
    context?.scoring ||
    profileData?.playerScoring ||
    profileData?.scoring?.player ||
    null

  const enriched = raw.map(game => {
    return normalizePlayerGameRow({
      rawGame: game,
      player,
      scoring,
      profileData,
    })
  })

  const filtered = applyPlayerGamesFilters(enriched, filters)

  return {
    games: filtered,
    summary: buildPlayerGamesSummary(enriched, filtered, filters),
    options: buildPlayerGamesOptions(enriched),
    indicators: buildPlayerGamesIndicators(filters),
  }
}
