// src/ui/forms/gameStatsForm/logic/draft/draft.fromDoc.js

import { statsParm } from '../../../../../shared/stats/statsParmList.js'

import {
  buildGameStatsPlayers,
  createPlayerStatsRows,
} from '../players.logic.js'

const SYSTEM_STATS_KEYS = new Set([
  'id',
  'docId',
  'uid',
  'name',

  'playerId',
  'teamId',
  'gameId',
  'gameStatsDocId',

  'stats',
  'completeness',
])

const clean = value => {
  return String(value ?? '').trim()
}

const safeArr = value => {
  return Array.isArray(value) ? value : []
}

const isObject = value => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const getStatsDocId = statsDoc => {
  return clean(
    statsDoc?.gameStatsDocId ||
      statsDoc?.docId ||
      statsDoc?.id
  )
}

const getGameId = ({ game, statsDoc }) => {
  return clean(
    statsDoc?.gameId ||
      game?.id ||
      game?.gameId ||
      game?.game?.id ||
      game?.game?.gameId
  )
}

const getTeamId = ({ team, game, statsDoc }) => {
  return clean(
    statsDoc?.teamId ||
      team?.id ||
      game?.teamId ||
      game?.game?.teamId
  )
}

const getGameDuration = ({ game, statsDoc }) => {
  return (
    Number(statsDoc?.teamStats?.timePlayed) ||
    Number(game?.gameDuration) ||
    Number(game?.game?.gameDuration) ||
    80
  )
}

const buildParmById = () => {
  return new Map(
    safeArr(statsParm).map(item => [item?.id, item])
  )
}

const parmById = buildParmById()

const getTripletGroupIds = group => {
  if (!group) return []

  return safeArr(statsParm)
    .filter(item => item?.tripletGroup === group)
    .map(item => item?.id)
    .filter(Boolean)
}

const addSelectedParmId = (set, key) => {
  if (!key || SYSTEM_STATS_KEYS.has(key)) return

  const parm = parmById.get(key)
  if (!parm) return

  if (parm.statsParmFieldType === 'triplet') {
    getTripletGroupIds(parm.tripletGroup).forEach(id => set.add(id))
    return
  }

  set.add(key)
}

const buildSelectedParmIdsFromStatsDoc = statsDoc => {
  const selected = new Set()

  for (const row of safeArr(statsDoc?.playerStats)) {
    for (const key of Object.keys(row || {})) {
      addSelectedParmId(selected, key)
    }
  }

  return Array.from(selected)
}

const indexStatsRowsByPlayerId = statsDoc => {
  const map = new Map()

  for (const row of safeArr(statsDoc?.playerStats)) {
    const playerId = clean(row?.playerId || row?.id)
    if (!playerId) continue

    map.set(playerId, row)
  }

  return map
}

const getStatFieldsPatch = statsRow => {
  const source = isObject(statsRow?.stats)
    ? statsRow.stats
    : statsRow

  return Object.entries(source || {}).reduce((acc, [key, value]) => {
    if (SYSTEM_STATS_KEYS.has(key)) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {})
}

const mergeSavedStatsIntoRows = ({ baseRows, statsDoc }) => {
  const byPlayerId = indexStatsRowsByPlayerId(statsDoc)

  return safeArr(baseRows).map(row => {
    const saved = byPlayerId.get(clean(row?.playerId))
    if (!saved) return row

    return {
      ...row,
      timePlayed: Number(saved?.timePlayed ?? row?.timePlayed ?? 0),
      timeVideoStats: Number(saved?.timeVideoStats ?? row?.timeVideoStats ?? 0),
      ...getStatFieldsPatch(saved),
    }
  })
}

export const createGameStatsDraftFromDoc = ({ game, team, statsDoc } = {}) => {
  const players = buildGameStatsPlayers(game)
  const statsRows = safeArr(statsDoc?.playerStats)
  const selectedPlayerIds = statsRows
    .map(row => clean(row?.playerId || row?.id))
    .filter(Boolean)

  const gameDuration = getGameDuration({ game, statsDoc })

  const baseRows = createPlayerStatsRows({
    players,
    selectedPlayerIds,
    game,
    team,
  })

  return {
    gameId: getGameId({ game, statsDoc }),
    teamId: getTeamId({ team, game, statsDoc }),
    gameStatsDocId: getStatsDocId(statsDoc),

    status: statsDoc?.status || game?.statsStatus || 'partial',
    source: statsDoc?.source || 'manual',
    preset: 'custom',

    players,
    selectedPlayerIds,
    selectedParmIds: buildSelectedParmIdsFromStatsDoc(statsDoc),
    activePlayerId: selectedPlayerIds[0] || '',

    playerStats: mergeSavedStatsIntoRows({
      baseRows,
      statsDoc,
    }),

    teamStats: statsDoc?.teamStats || {},
    timePlayed: Number(statsDoc?.teamStats?.timePlayed ?? gameDuration),
    timeVideoStats: Number(
      statsDoc?.teamStats?.timeVideoStats ??
        statsDoc?.teamStats?.timePlayed ??
        gameDuration
    ),
  }
}
