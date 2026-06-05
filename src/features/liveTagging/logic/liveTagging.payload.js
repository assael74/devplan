// src/features/liveTagging/logic/liveTagging.payload.js

import {
  LIVE_ACTION_SIDE_IDS,
} from '../../../shared/liveTagging/index.js'

import {
  getSelectedGame,
  getSelectedPlayer,
  hasGameStatsPointer,
  isPrivatePlayerSelection,
  isTeamSelection,
  resolveSelectionTeamId,
} from './liveTagging.selection.js'

const clean = value => String(value ?? '').trim()

const toNum = value => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const clampPositive = value => Math.max(0, toNum(value))

const increment = (target, key, amount = 1) => {
  if (!key) return target

  return {
    ...target,
    [key]: clampPositive(target[key]) + amount,
  }
}

const getClockMs = clock => {
  return clampPositive(clock?.ms)
}

const getEventPlayerId = ({ event, selection }) => {
  return clean(
    event?.subject?.playerId ||
      event?.playerId ||
      selection?.playerId
  )
}

const getEventStatsPatch = event => {
  const action = event?.action || {}
  const stats = action.stats || {}

  const side = action.side
  const statId = clean(stats.statId)
  const totalStatId = clean(stats.totalStatId)

  if (!statId && !totalStatId) return {}

  if (totalStatId) {
    const patch = increment({}, totalStatId)

    const shouldAddStatId =
      statId &&
      statId !== totalStatId &&
      (
        side === LIVE_ACTION_SIDE_IDS.POSITIVE ||
        side === LIVE_ACTION_SIDE_IDS.NEGATIVE
      )

    return shouldAddStatId ? increment(patch, statId) : patch
  }

  return statId ? increment({}, statId) : {}
}

const mergeStatsPatch = (current, patch) => {
  return Object.entries(patch || {}).reduce((acc, [key, value]) => {
    return increment(acc, key, clampPositive(value))
  }, current || {})
}

const groupEventsByPlayer = ({ events, selection }) => {
  return (events || []).reduce((acc, event) => {
    const playerId = getEventPlayerId({ event, selection })
    if (!playerId) return acc

    const patch = getEventStatsPatch(event)
    if (!Object.keys(patch).length) return acc

    return {
      ...acc,
      [playerId]: mergeStatsPatch(acc[playerId], patch),
    }
  }, {})
}

const buildTeamStatsFromEvents = events => {
  return (events || []).reduce((acc, event) => {
    const patch = getEventStatsPatch(event)
    if (!Object.keys(patch).length) return acc

    return mergeStatsPatch(acc, patch)
  }, {})
}

const getSelectedParmIds = statsItems => {
  const ids = new Set()

  statsItems.forEach(stats => {
    Object.keys(stats || {}).forEach(key => ids.add(key))
  })

  return Array.from(ids)
}

const getMaxEventMs = events => {
  return (events || []).reduce((max, event) => {
    return Math.max(max, getClockMs(event?.clock))
  }, 0)
}

const resolveGameDuration = game => {
  return (
    clampPositive(game?.gameDuration) ||
    clampPositive(game?.duration) ||
    80
  )
}

const resolveSessionMinutes = ({ events, game }) => {
  const maxMs = getMaxEventMs(events)
  const maxMinutes = Math.ceil(maxMs / 60000)

  return maxMinutes || resolveGameDuration(game)
}

const buildCompleteness = ({ stats, selectedParmIds }) => {
  const filled = Object.keys(stats || {}).length
  const total = selectedParmIds.length

  return {
    filled,
    total,
    isComplete: total > 0 && filled >= total,
    isEmpty: filled === 0,
    isPartial: filled > 0 && filled < total,
  }
}

const buildPlayerStatsRows = ({
  groupedStats,
  selectedParmIds,
  timePlayed,
  timeVideoStats,
}) => {
  return Object.entries(groupedStats || {})
    .map(([playerId, stats]) => ({
      playerId,
      timePlayed,
      timeVideoStats,
      stats,
      completeness: buildCompleteness({ stats, selectedParmIds }),
    }))
    .filter(row => Object.keys(row.stats || {}).length > 0)
}

const buildBasePayload = ({
  gameId,
  teamId,
  source,
  scope,
  selectedPlayerIds,
  selectedParmIds,
  playerStats,
  teamStats,
  timePlayed,
  timeVideoStats,
  sessionId,
}) => {
  return {
    gameId,
    ...(teamId ? { teamId } : {}),

    status: 'partial',
    source,
    preset: 'liveTagging',

    selectedPlayerIds,
    selectedParmIds,

    meta: {
      scope,
      source: 'liveTagging',
      sessionId: sessionId || '',
      timePlayed,
      timeVideoStats,
    },

    timePlayed,
    timeVideoStats,
    playerStats,
    ...(teamStats ? { teamStats } : {}),

    summary: {
      playersCount: selectedPlayerIds.length,
      savedPlayersCount: playerStats.length,
      parmsCount: selectedParmIds.length,
      statsFieldsCount: playerStats.reduce((sum, row) => {
        return sum + Object.keys(row.stats || {}).length
      }, Object.keys(teamStats || {}).length),
      completedPlayersCount: playerStats.filter(row => {
        return row.completeness?.isComplete
      }).length,
    },
  }
}

const getPrivatePlayerPayload = ({
  events,
  selection,
  game,
  player,
  sessionId,
}) => {
  const gameId = clean(selection?.gameId || game?.id || game?.gameId)
  const playerId = clean(selection?.playerId || player?.id || player?.playerId)

  const groupedStats = groupEventsByPlayer({ events, selection })
  const selectedParmIds = getSelectedParmIds([groupedStats[playerId] || {}])

  const timePlayed = resolveGameDuration(game)
  const timeVideoStats = resolveSessionMinutes({ events, game })

  const playerStats = buildPlayerStatsRows({
    groupedStats: {
      [playerId]: groupedStats[playerId] || {},
    },
    selectedParmIds,
    timePlayed,
    timeVideoStats,
  })

  const payload = buildBasePayload({
    gameId,
    teamId: '',
    source: 'privatePlayerProfile',
    scope: 'privatePlayer',
    selectedPlayerIds: playerId ? [playerId] : [],
    selectedParmIds,
    playerStats,
    timePlayed,
    timeVideoStats,
    sessionId,
  })

  return {
    ...payload,
    meta: {
      ...payload.meta,
      playerId,
    },
  }
}

const getRegularPlayerPayload = ({
  events,
  selection,
  game,
  teamId,
  sessionId,
}) => {
  const gameId = clean(selection?.gameId || game?.id || game?.gameId)
  const safeTeamId = clean(teamId)

  const groupedStats = groupEventsByPlayer({ events, selection })
  const selectedParmIds = getSelectedParmIds(Object.values(groupedStats))

  const timePlayed = resolveGameDuration(game)
  const timeVideoStats = resolveSessionMinutes({ events, game })

  const playerStats = buildPlayerStatsRows({
    groupedStats,
    selectedParmIds,
    timePlayed,
    timeVideoStats,
  })

  return buildBasePayload({
    gameId,
    teamId: safeTeamId,
    source: 'liveTagging',
    scope: 'player',
    selectedPlayerIds: playerStats.map(row => row.playerId),
    selectedParmIds,
    playerStats,
    timePlayed,
    timeVideoStats,
    sessionId,
  })
}

const getTeamOnlyPayload = ({
  events,
  selection,
  game,
  teamId,
  sessionId,
}) => {
  const gameId = clean(selection?.gameId || game?.id || game?.gameId)
  const safeTeamId = clean(teamId)

  const baseTeamStats = buildTeamStatsFromEvents(events)
  const selectedParmIds = getSelectedParmIds([baseTeamStats])

  const timePlayed = resolveGameDuration(game)
  const timeVideoStats = resolveSessionMinutes({ events, game })

  const teamStats = {
    ...baseTeamStats,
    gameId,
    teamId: safeTeamId,
    playersCount: 0,
    timePlayed,
    timeVideoStats,
  }

  return buildBasePayload({
    gameId,
    teamId: safeTeamId,
    source: 'liveTaggingTeamOnly',
    scope: 'team',
    selectedPlayerIds: [],
    selectedParmIds,
    playerStats: [],
    teamStats,
    timePlayed,
    timeVideoStats,
    sessionId,
  })
}

export const buildLiveTaggingStatsSaveModel = ({
  events = [],
  selection,
  players = [],
  games = [],
  sessionId = '',
} = {}) => {
  const game = getSelectedGame(games, selection?.gameId)
  const player = getSelectedPlayer(players, selection?.playerId)
  const teamId = resolveSelectionTeamId({ selection, players })

  const gameId = clean(selection?.gameId || game?.id || game?.gameId)

  if (!gameId) {
    return {
      ok: false,
      error: 'חסר משחק לשמירת Live Tagging',
    }
  }

  if (hasGameStatsPointer(game)) {
    return {
      ok: false,
      error: 'למשחק הזה כבר קיימת סטטיסטיקה רשמית. Live Tagging יוצר מסמך חדש בלבד.',
    }
  }

  if (!events.length) {
    return {
      ok: false,
      error: 'אין אירועים לשמירה',
    }
  }

  if (isPrivatePlayerSelection(selection)) {
    const payload = getPrivatePlayerPayload({
      events,
      selection,
      game,
      player,
      sessionId,
    })

    if (!payload.playerStats?.length) {
      return {
        ok: false,
        error: 'אין אירועים תקינים לשחקן הפרטי',
      }
    }

    return {
      ok: true,
      route: 'privatePlayerSave',
      payload,
    }
  }

  if (isTeamSelection(selection)) {
    if (!teamId) {
      return {
        ok: false,
        error: 'חסר teamId לשמירת סטטיסטיקה קבוצתית',
      }
    }

    const payload = getTeamOnlyPayload({
      events,
      selection,
      game,
      teamId,
      sessionId,
    })

    if (!Object.keys(payload.teamStats || {}).length) {
      return {
        ok: false,
        error: 'אין נתוני קבוצה לשמירה',
      }
    }

    return {
      ok: true,
      route: 'teamOnlyCreate',
      payload,
    }
  }

  if (!teamId) {
    return {
      ok: false,
      error: 'חסר teamId לשמירת סטטיסטיקת שחקן רגיל',
    }
  }

  const payload = getRegularPlayerPayload({
    events,
    selection,
    game,
    teamId,
    sessionId,
  })

  if (!payload.playerStats?.length) {
    return {
      ok: false,
      error: 'אין אירועים עם שיוך שחקן',
    }
  }

  return {
    ok: true,
    route: 'create',
    payload,
  }
}
