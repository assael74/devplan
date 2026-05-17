// teamProfile/sharedUi/insights/teamPlayers/components/playerPerformance.helpers.js

import {
  PLAYER_INSIGHT_PROFILES,
} from '../../../../../../../shared/players/insights/index.js'

export const ROLE_LABELS = {
  key: 'שחקן מפתח',
  core: 'שחקן מרכזי',
  rotation: 'שחקן רוטציה',
  fringe: 'סגל מורחב',
}

export const POSITION_LABELS = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

export const PROFILE_ORDER = [
  'stat_anchor',
  'core_worker',
  'weak_spot',
  'joker',
  'unstable',
  'secondary_contributor',
  'out_of_sample',
]

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

export const formatGameDate = (value) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
  })
}

export const getGameSideLabel = (game) => {
  const g = getGameData(game)

  return g?.home ? 'בית' : 'חוץ'
}

export const getGameResultLabel = (game) => {
  const g = getGameData(game)
  const result = g?.result

  if (typeof result === 'string') return result

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
  const date = formatGameDate(g?.gameDate)
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
  const type = g?.type
  const status = g?.gameStatus

  const isLeague =
    !type ||
    type === 'league'

  const isPlayed =
    !status ||
    status === 'played'

  return isLeague && isPlayed
}

export const getScopeGames = (games) => {
  const safeGames = Array.isArray(games) ? games : []

  const filteredGames = safeGames
    .filter(isPlayedLeagueGame)
    .sort((a, b) => {
      return getGameTime(a) - getGameTime(b)
    })

  if (filteredGames.length) {
    return filteredGames
  }

  return safeGames
    .slice()
    .sort((a, b) => {
      return getGameTime(a) - getGameTime(b)
    })
}

export const getRangeCount = ({
  games,
  fromGameKey,
  toGameKey,
}) => {
  if (!fromGameKey || !toGameKey) return 0

  const fromIndex = games.findIndex((game) => {
    return getGameKey(game) === fromGameKey
  })

  const toIndex = games.findIndex((game) => {
    return getGameKey(game) === toGameKey
  })

  if (fromIndex < 0 || toIndex < 0) return 0

  return Math.abs(toIndex - fromIndex) + 1
}

export const getMetricTone = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'neutral'
  if (number > 0) return 'success'
  if (number < 0) return 'danger'

  return 'neutral'
}

export const getRoleLabel = (value) => {
  return ROLE_LABELS[value] || 'ללא מעמד'
}

export const getPositionLabel = (value) => {
  return POSITION_LABELS[value] || 'ללא עמדה'
}

export const formatSignedNumber = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '-'

  if (number > 0) return `+${number}`
  if (number < 0) return `${number}`

  return '0'
}

export const getOrderedProfiles = () => {
  return PROFILE_ORDER
    .map((id) => PLAYER_INSIGHT_PROFILES[id])
    .filter(Boolean)
}

export const getProfileRows = ({
  rows,
  profileId,
}) => {
  const safeRows = Array.isArray(rows) ? rows : []

  return safeRows.filter((row) => {
    return row.insightId === profileId
  })
}
