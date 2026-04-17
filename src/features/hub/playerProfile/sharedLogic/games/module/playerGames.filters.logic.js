// playerProfile/sharedLogic/games/module/playerGames.filters.logic.js

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'
import { createInitialPlayerGamesFilters as createInitialFilters } from './playerGames.filters.constants.js'
import {
  applyPlayerGamesFilters,
  buildPlayerGamesSummary,
} from './playerGames.filters.apply.js'
import {
  buildPlayerGamesOptions,
  buildPlayerGamesIndicators,
} from './playerGames.filters.options.js'

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

const normalizePlayerGameRow = (rawGame, player) => {
  const normalizedGame = normalize(rawGame || {})
  const personal = rawGame?.playerGame || {}

  const baseRow = {
    ...normalizedGame,
    rawGame: rawGame || null,
    player: player || null,
    team: normalizedGame?.team || rawGame?.team || player?.team || null,

    playerGame: personal,

    goals: safeNumber(personal?.goals),
    assists: safeNumber(personal?.assists),
    timePlayed: safeNumber(personal?.timePlayed),

    isSelected: personal?.isSelected === true,
    isStarting: personal?.isStarting === true,

    hasEntry: personal?.isSelected === true || safeNumber(personal?.timePlayed) > 0,
  }

  return {
    ...baseRow,
    ...buildDisplayMeta(baseRow, player),
  }
}

export const createInitialPlayerGamesFilters = () => createInitialFilters()

export const resolvePlayerGamesFiltersDomain = (player, filters) => {
  const raw = safeArray(player?.playerGames)

  const enriched = raw.map((game) => normalizePlayerGameRow(game, player))
  const filtered = applyPlayerGamesFilters(enriched, filters)

  return {
    games: filtered,
    summary: buildPlayerGamesSummary(enriched, filtered, filters),
    options: buildPlayerGamesOptions(enriched),
    indicators: buildPlayerGamesIndicators(filters),
  }
}
