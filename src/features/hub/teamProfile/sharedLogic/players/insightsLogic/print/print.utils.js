// teamProfile/sharedLogic/players/insightsLogic/print/print.utils.js

const emptyText = '-'

export const asText = (value, fallback = emptyText) => {
  if (value == null || value === '') return fallback

  return String(value)
}

export const asNumber = (value, fallback = null) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : fallback
}

export const formatNumber = ({
  value,
  digits = 0,
  fallback = emptyText,
} = {}) => {
  const number = asNumber(value)

  if (!Number.isFinite(number)) return fallback

  return number.toLocaleString('he-IL', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export const formatSignedNumber = ({
  value,
  digits = 2,
  fallback = emptyText,
} = {}) => {
  const number = asNumber(value)

  if (!Number.isFinite(number)) return fallback
  if (number > 0) return `+${formatNumber({ value: number, digits })}`
  if (number < 0) return formatNumber({ value: number, digits })

  return '0'
}

export const formatDate = (value) => {
  if (!value) return emptyText

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return emptyText

  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export const getGameData = (game) => {
  return game?.game || game || {}
}

export const getGameKey = (game) => {
  const g = getGameData(game)

  return g?.id ||
    g?.gameId ||
    `${g?.gameDate || ''}_${g?.gameLeagueNum || ''}_${g?.rivel || g?.rival || ''}`
}

export const getGameTime = (game) => {
  const g = getGameData(game)
  const time = new Date(g?.gameDate).getTime()

  return Number.isFinite(time) ? time : 0
}

export const getGameSideLabel = (game) => {
  const g = getGameData(game)

  return g?.home ? 'בית' : 'חוץ'
}

export const getGameResultLabel = (game) => {
  const g = getGameData(game)
  const result = g?.result

  if (typeof result === 'string' && result) return result

  const goalsFor = result?.goalsFor ?? g?.goalsFor
  const goalsAgainst = result?.goalsAgainst ?? g?.goalsAgainst

  if (goalsFor == null || goalsAgainst == null) return ''

  return `${goalsFor}:${goalsAgainst}`
}

export const getGameLabel = (game) => {
  const g = getGameData(game)

  const round = g?.gameLeagueNum
    ? `מחזור ${g.gameLeagueNum}`
    : 'משחק'

  const rival = g?.rivel || g?.rival || 'יריבה'
  const side = getGameSideLabel(game)
  const date = formatDate(g?.gameDate)
  const result = getGameResultLabel(game)

  return [
    round,
    side,
    rival,
    date,
    result,
  ].filter(Boolean).join(' · ')
}

export const isPlayedLeagueGame = (game) => {
  const g = getGameData(game)

  return g?.gameStatus === 'played' && g?.type === 'league'
}

export const getOrderedLeagueGames = (games) => {
  const safeGames = Array.isArray(games) ? games : []

  return safeGames
    .filter(isPlayedLeagueGame)
    .sort((a, b) => {
      return getGameTime(a) - getGameTime(b)
    })
}

export const getRangeGames = ({
  games,
  performanceScope,
}) => {
  const orderedGames = getOrderedLeagueGames(games)

  if (
    performanceScope?.mode !== 'range' ||
    !performanceScope?.fromGameKey ||
    !performanceScope?.toGameKey
  ) {
    return orderedGames
  }

  const fromIndex = orderedGames.findIndex((game) => {
    return getGameKey(game) === performanceScope.fromGameKey
  })

  const toIndex = orderedGames.findIndex((game) => {
    return getGameKey(game) === performanceScope.toGameKey
  })

  if (fromIndex < 0 || toIndex < 0) return orderedGames

  const start = Math.min(fromIndex, toIndex)
  const end = Math.max(fromIndex, toIndex)

  return orderedGames.slice(start, end + 1)
}
