import { useMemo } from 'react'

import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'
import {
  GAME_TYPE,
  GAME_STATUS,
} from '../../../../../shared/games/games.constants.js'

const safeId = (v) => (v == null ? '' : String(v))
const safeStr = (v) => (v == null ? '' : String(v))

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : [])

const GAME_TYPE_MAP = GAME_TYPE.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {})

const GAME_STATUS_MAP = GAME_STATUS.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {})

const getStatusMeta = (game = {}) => {
  const statusId = safeStr(game?.gameStatus || 'scheduled')
  const match = GAME_STATUS_MAP[statusId] || GAME_STATUS_MAP.scheduled

  return {
    id: match?.id || 'scheduled',
    label: match?.labelH || match?.label || 'מתוכנן',
    icon: match?.idIcon || 'calendar',
    color: match?.color || 'neutral',
  }
}

const getHomeAwayMeta = (game = {}) => {
  if (game?.home === true) {
    return {
      id: 'home',
      label: 'בית',
      icon: 'home',
      color: 'success',
    }
  }

  if (game?.home === false) {
    return {
      id: 'away',
      label: 'חוץ',
      icon: 'away',
      color: 'danger',
    }
  }

  return {
    id: '',
    label: '',
    icon: 'games',
    color: 'neutral',
  }
}

const getResultMeta = (game = {}) => {
  if (safeStr(game?.gameStatus) !== 'played') {
    return {
      label: '',
      icon: 'games',
      color: 'neutral',
      resultKey: '',
    }
  }

  const gf = safeNum(game?.goalsFor)
  const ga = safeNum(game?.goalsAgainst)

  if (gf == null || ga == null) {
    return {
      label: '',
      icon: 'games',
      color: 'neutral',
      resultKey: '',
    }
  }

  if (gf > ga) {
    return {
      label: `${gf}-${ga}`,
      icon: 'win',
      color: 'success',
      resultKey: 'win',
    }
  }

  if (gf < ga) {
    return {
      label: `${gf}-${ga}`,
      icon: 'loss',
      color: 'danger',
      resultKey: 'loss',
    }
  }

  return {
    label: `${gf}-${ga}`,
    icon: 'draw',
    color: 'warning',
    resultKey: 'draw',
  }
}

const getOpponentName = (game = {}) => {
  if (safeStr(game?.rivel)) return safeStr(game.rivel)
  if (safeStr(game?.rival)) return safeStr(game.rival)

  return 'ללא יריבה'
}

const getTypeMeta = (game = {}) => {
  const typeId = safeStr(game?.type)
  const match = GAME_TYPE_MAP[typeId]

  if (!match) {
    return {
      id: '',
      label: '',
      icon: 'games',
    }
  }

  return {
    id: match.id,
    label: match.labelH || match.label || '',
    icon: match.idIcon || 'games',
  }
}

const findPlayerInList = (list, playerId) => {
  return (
    toArr(list).find((item) => {
      if (!item) return false

      if (typeof item === 'string' || typeof item === 'number') {
        return safeId(item) === safeId(playerId)
      }

      return safeId(item?.playerId || item?.id) === safeId(playerId)
    }) || null
  )
}

const getPlayerGameStatus = (game, playerId) => {
  if (!playerId || !game) {
    return {
      exists: false,
      item: null,
      isSelected: false,
      isStarting: false,
    }
  }

  const lists = [
    game?.players,
    game?.playerIds,
    game?.gamePlayers,
    game?.playersStats,
    game?.lineup,
    game?.squad,
  ]

  for (const list of lists) {
    const found = findPlayerInList(list, playerId)
    if (!found) continue

    if (typeof found === 'string' || typeof found === 'number') {
      return {
        exists: true,
        item: { playerId: safeId(found), isSelected: true, isStarting: false },
        isSelected: true,
        isStarting: false,
      }
    }

    return {
      exists: true,
      item: found,
      isSelected: found?.isSelected === true || found?.selected === true,
      isStarting: found?.isStarting === true || found?.starting === true,
    }
  }

  return {
    exists: false,
    item: null,
    isSelected: false,
    isStarting: false,
  }
}

const buildSearchKey = (parts) => {
  return parts.filter(Boolean).join(' · ').toLowerCase()
}

const getDateLabel = (dateRaw) => {
  return dateRaw ? getFullDateIl(dateRaw) : 'ללא תאריך'
}

const getTeamName = ({ game, fallback }) => {
  return (
    safeStr(game?.team?.teamName) ||
    safeStr(game?.teamName) ||
    fallback ||
    'ללא קבוצה'
  )
}

export default function useGameOptions({
  value = '',
  player = null,
  options = [],
  teamId = '',
}) {
  const indexedOptions = useMemo(() => {
    const playerId = safeId(player?.id)
    const resolvedTeamId = safeId(teamId || player?.teamId)
    const resolvedTeamName = safeStr(player?.team?.teamName)

    const sourceGames =
      Array.isArray(player?.teamGames) && player.teamGames.length
        ? player.teamGames
        : Array.isArray(options)
          ? options
          : []

    return sourceGames
      .map((game) => {
        const gameId = safeId(game?.id)
        if (!gameId) return null

        const dateRaw =
          safeStr(game?.gameDate) ||
          safeStr(game?.date) ||
          safeStr(game?.matchDate)

        const dateLabel = getDateLabel(dateRaw)
        const teamName = getTeamName({
          game,
          fallback: resolvedTeamName,
        })

        const opponentName = getOpponentName(game)
        const statusMeta = getStatusMeta(game)
        const homeAwayMeta = getHomeAwayMeta(game)
        const resultMeta = getResultMeta(game)
        const typeMeta = getTypeMeta(game)
        const playerStatus = getPlayerGameStatus(game, playerId)

        return {
          value: gameId,
          game,

          dateRaw,
          dateLabel,

          teamId: resolvedTeamId,
          teamName,
          opponentName,

          gameStatus: statusMeta.id,
          statusMeta,

          type: safeStr(game?.type),
          typeMeta,

          home: game?.home === true,
          homeAway: homeAwayMeta.label,
          homeAwayMeta,

          result: resultMeta.label,
          resultMeta,

          isAlreadyInGame: playerStatus.exists,
          playerInGame: playerStatus.item,
          isSelected: playerStatus.isSelected,
          isStarting: playerStatus.isStarting,

          primaryLine: `${teamName} · ${opponentName}`,

          secondaryLine: [
            dateLabel,
            statusMeta.label,
            resultMeta.label,
            homeAwayMeta.label,
            typeMeta.label,
          ]
            .filter(Boolean)
            .join(' · '),

          shortLabel: [teamName, opponentName, dateLabel]
            .filter(Boolean)
            .join(' · '),

          searchKey: buildSearchKey([
            teamName,
            opponentName,
            dateLabel,
            statusMeta.label,
            resultMeta.label,
            homeAwayMeta.label,
            typeMeta.label,
          ]),
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a.dateRaw ? new Date(a.dateRaw).getTime() : 0
        const bTime = b.dateRaw ? new Date(b.dateRaw).getTime() : 0
        return bTime - aTime
      })
  }, [player, options, teamId])

  const selectedOption = useMemo(() => {
    return (
      indexedOptions.find((item) => safeId(item.value) === safeId(value)) ||
      null
    )
  }, [indexedOptions, value])

  return {
    indexedOptions,
    selectedOption,
  }
}
