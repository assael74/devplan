// src/shared/teams/scoring/scoring.scope.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Scope
|--------------------------------------------------------------------------
|
| אחריות:
| הגדרת סט המשחקים שעליו מותר למנוע ציון הקבוצה לעבוד.
|
| ברירת מחדל:
| משחקי ליגה ששוחקו בלבד.
*/

import {
  isGamePlayed,
} from '../../games/games.constants.js'

import {
  asText,
  getGameObject,
} from './scoring.utils.js'

const DEFAULT_SCOPE = {
  gameTypes: ['league'],
  playedOnly: true,
  limit: null,
  dateFrom: null,
  dateTo: null,
  sortDirection: 'desc',
}

const asArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [value]
}

const toTime = (value) => {
  if (!value) return 0

  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime()
  }

  const date = new Date(value)
  const time = date.getTime()

  return Number.isFinite(time) ? time : 0
}

const getGameType = (row = {}) => {
  const game = getGameObject(row)

  return asText(
    game?.type ||
      game?.gameType ||
      row?.type ||
      row?.gameType
  )
}

const getGameDateTime = (row = {}) => {
  const game = getGameObject(row)

  return toTime(
    game?.gameDate ||
      game?.date ||
      row?.gameDate ||
      row?.date
  )
}

const isGameTypeAllowed = ({
  row,
  gameTypes,
}) => {
  const allowedTypes = asArray(gameTypes).map(asText)

  if (!allowedTypes.length) return true

  return allowedTypes.includes(getGameType(row))
}

const isPlayedAllowed = ({
  row,
  playedOnly,
}) => {
  if (!playedOnly) return true

  const game = getGameObject(row)

  return isGamePlayed(row) || isGamePlayed(game)
}

const isAfterDateFrom = ({
  row,
  dateFrom,
}) => {
  if (!dateFrom) return true

  const gameTime = getGameDateTime(row)
  const fromTime = toTime(dateFrom)

  if (!gameTime || !fromTime) return true

  return gameTime >= fromTime
}

const isBeforeDateTo = ({
  row,
  dateTo,
}) => {
  if (!dateTo) return true

  const gameTime = getGameDateTime(row)
  const to = new Date(dateTo)

  if (Number.isNaN(to.getTime())) return true

  to.setHours(23, 59, 59, 999)

  const toTimeValue = to.getTime()

  if (!gameTime || !toTimeValue) return true

  return gameTime <= toTimeValue
}

const sortByDate = ({
  games,
  direction,
}) => {
  const sign = direction === 'asc' ? 1 : -1

  return [...games].sort((a, b) => {
    return (getGameDateTime(a) - getGameDateTime(b)) * sign
  })
}

export const buildTeamScoringScope = ({
  games,
  scope,
} = {}) => {
  const base = Array.isArray(games) ? games : []

  const activeScope = {
    ...DEFAULT_SCOPE,
    ...(scope || {}),
  }

  const filtered = base.filter((row) => {
    return (
      isGameTypeAllowed({
        row,
        gameTypes: activeScope.gameTypes,
      }) &&
      isPlayedAllowed({
        row,
        playedOnly: activeScope.playedOnly,
      }) &&
      isAfterDateFrom({
        row,
        dateFrom: activeScope.dateFrom,
      }) &&
      isBeforeDateTo({
        row,
        dateTo: activeScope.dateTo,
      })
    )
  })

  const sorted = sortByDate({
    games: filtered,
    direction: activeScope.sortDirection,
  })

  const limited = activeScope.limit
    ? sorted.slice(0, Number(activeScope.limit))
    : sorted

  return {
    games: limited,
    allGamesCount: base.length,
    filteredGamesCount: filtered.length,
    scopedGamesCount: limited.length,
    scope: activeScope,
  }
}
