// features/hub/editLogic/games/entryGames/teamGameEntry.model.js

import {
  safe,
  clean,
  toNum,
  toNumOrEmpty,
  normalizeBool,
  getGameSource,
  getGamePlayers,
  getPlayerDisplayName,
  buildEntryGameMeta,
} from './entryGame.shared.js'

export const getTeamPlayers = (team, context) => {
  const direct = team?.players || team?.teamPlayers || team?.squad || []

  if (Array.isArray(direct) && direct.length) return direct

  const allPlayers = Array.isArray(context?.players) ? context.players : []

  return allPlayers.filter((player) => {
    const playerTeamId =
      player?.teamId ||
      player?.team?.id ||
      player?.currentTeamId ||
      ''

    return team?.id && playerTeamId === team.id
  })
}

export const isGamePlayed = (game) => {
  const source = getGameSource(game)
  const status = clean(source?.status).toLowerCase()

  if (typeof source?.isPlayed === 'boolean') return source.isPlayed
  if (typeof source?.played === 'boolean') return source.played
  if (typeof source?.wasPlayed === 'boolean') return source.wasPlayed
  if (status === 'played') return true
  if (status === 'scheduled') return false

  const hasResult =
    source?.goalsFor != null ||
    source?.goalsAgainst != null ||
    clean(source?.result)

  return Boolean(hasResult)
}

export const getGameDurationLimit = (draft) => {
  return toNum(draft?.raw?.gameDuration ?? 0)
}

export const getTeamGoalsLimit = (draft) => {
  return toNum(draft?.raw?.goalsFor ?? 0)
}

export const getGoalsTotal = (rows = []) => {
  return rows.reduce((sum, row) => sum + toNum(row?.goals), 0)
}

export const getAssistsTotal = (rows = []) => {
  return rows.reduce((sum, row) => sum + toNum(row?.assists), 0)
}

export const getOnStartTotal = (rows = []) => {
  return rows.filter((row) => row?.onStart === true).length
}

export const buildTeamGameEntryRow = (player, existing) => {
  const playerId = player?.id || existing?.playerId || ''
  const current = existing || {}

  return {
    id: playerId,
    playerId,

    playerName: getPlayerDisplayName(player),
    playerNumber: player?.number || player?.shirtNumber || player?.playerNumber || '',
    position: player?.position || player?.mainPosition || '',
    avatar: player?.img || player?.avatar || player?.photo || '',
    active: player?.active !== false,
    rawPlayer: player,

    onSquad: current?.onSquad === true,
    onStart: current?.onStart === true,
    goals: toNumOrEmpty(current?.goals),
    assists: toNumOrEmpty(current?.assists),
    timePlayed: toNumOrEmpty(current?.timePlayed),

    initial: {
      onSquad: current?.onSquad === true,
      onStart: current?.onStart === true,
      goals: toNumOrEmpty(current?.goals),
      assists: toNumOrEmpty(current?.assists),
      timePlayed: toNumOrEmpty(current?.timePlayed),
    },
  }
}

export const buildTeamGameEntryInitial = (game, team, context) => {
  const meta = buildEntryGameMeta(game)
  const existingGamePlayers = getGamePlayers(game)
  const squad = getTeamPlayers(team, context)

  const existingMap = new Map(
    existingGamePlayers
      .filter(Boolean)
      .map((item) => [item?.playerId || item?.id, item])
      .filter(([id]) => Boolean(id))
  )

  const rosterRows = squad.map((player) => {
    const key = player?.id
    return buildTeamGameEntryRow(player, existingMap.get(key))
  })

  const extraExistingRows = existingGamePlayers
    .filter((item) => {
      return item?.playerId && !rosterRows.some((row) => row.playerId === item.playerId)
    })
    .map((item) => {
      return buildTeamGameEntryRow(
        {
          id: item?.playerId,
          name: item?.playerName || item?.name || 'שחקן',
          number: item?.playerNumber || '',
          position: item?.position || '',
          avatar: item?.avatar || '',
          active: false,
        },
        item
      )
    })

  return {
    ...meta,
    isPlayed: isGamePlayed(game),
    rows: [...rosterRows, ...extraExistingRows],
    existingGamePlayers,
  }
}

export const getRemainingGoalsForRow = (rows = [], playerId, teamGoalsLimit = 0) => {
  const othersTotal = rows.reduce((sum, row) => {
    if (row?.playerId === playerId) return sum
    return sum + toNum(row?.goals)
  }, 0)

  return Math.max(0, teamGoalsLimit - othersTotal)
}

export const getRemainingAssistsForRow = (rows = [], playerId, teamGoalsLimit = 0) => {
  const othersTotal = rows.reduce((sum, row) => {
    if (row?.playerId === playerId) return sum
    return sum + toNum(row?.assists)
  }, 0)

  return Math.max(0, teamGoalsLimit - othersTotal)
}

export const clampTeamGameEntryStatToRowLimit = (rows = [], playerId, field, value, draft) => {
  const nextValue = value === '' ? '' : toNum(value)
  const teamGoalsLimit = getTeamGoalsLimit(draft)

  if (field === 'goals') {
    const maxAllowed = getRemainingGoalsForRow(rows, playerId, teamGoalsLimit)
    if (nextValue === '') return ''
    return Math.max(0, Math.min(nextValue, maxAllowed))
  }

  if (field === 'assists') {
    const maxAllowed = getRemainingAssistsForRow(rows, playerId, teamGoalsLimit)
    if (nextValue === '') return ''
    return Math.max(0, Math.min(nextValue, maxAllowed))
  }

  if (field === 'timePlayed') {
    const maxAllowed = getGameDurationLimit(draft)
    if (nextValue === '') return ''
    return Math.max(0, Math.min(nextValue, maxAllowed))
  }

  return value
}

export const setTeamGameEntryRowField = (rows, playerId, field, value) => {
  const safeRows = Array.isArray(rows) ? rows : []

  if (field === 'onStart' && value === true) {
    const currentStarts = getOnStartTotal(safeRows)
    const currentRow = safeRows.find((row) => row?.playerId === playerId)
    const alreadyStarter = currentRow?.onStart === true

    if (!alreadyStarter && currentStarts >= 11) return safeRows
  }

  return safeRows.map((row) => {
    if (row.playerId !== playerId) return row

    const next = { ...row, [field]: value }

    if (field === 'onSquad' && value !== true) {
      next.onStart = false
      next.goals = ''
      next.assists = ''
      next.timePlayed = ''
    }

    if (field === 'onStart' && value === true) {
      next.onSquad = true
    }

    return next
  })
}

export const isTeamGameEntryRowDirty = (row) => {
  const initial = row?.initial || {}

  return (
    normalizeBool(row?.onSquad) !== normalizeBool(initial?.onSquad) ||
    normalizeBool(row?.onStart) !== normalizeBool(initial?.onStart) ||
    toNumOrEmpty(row?.goals) !== toNumOrEmpty(initial?.goals) ||
    toNumOrEmpty(row?.assists) !== toNumOrEmpty(initial?.assists) ||
    toNumOrEmpty(row?.timePlayed) !== toNumOrEmpty(initial?.timePlayed)
  )
}

export const getTeamGameEntryDirtyRows = (draft) => {
  const rows = Array.isArray(draft?.rows) ? draft.rows : []
  return rows.filter(isTeamGameEntryRowDirty)
}

export const isTeamGameEntryDirty = (draft) => {
  return getTeamGameEntryDirtyRows(draft).length > 0
}

export const getIsTeamGameEntryValid = (draft) => {
  const rows = Array.isArray(draft?.rows) ? draft.rows : []
  const isPlayedFlag = draft?.isPlayed === true

  const onStartTotal = getOnStartTotal(rows)
  const goalsTotal = getGoalsTotal(rows)
  const assistsTotal = getAssistsTotal(rows)
  const teamGoalsLimit = getTeamGoalsLimit(draft)

  if (onStartTotal > 11) return false

  if (isPlayedFlag) {
    if (goalsTotal > teamGoalsLimit) return false
    if (assistsTotal > teamGoalsLimit) return false
  }

  return rows.every((row) => {
    if (!row?.onSquad) return true
    if (!row?.onStart) return true
    if (!isPlayedFlag) return true

    return toNumOrEmpty(row?.timePlayed) !== ''
  })
}

export const getTeamGameEntryValidationMessage = (draft) => {
  const rows = Array.isArray(draft?.rows) ? draft.rows : []
  const isPlayedFlag = draft?.isPlayed === true

  const onStartTotal = getOnStartTotal(rows)
  const goalsTotal = getGoalsTotal(rows)
  const assistsTotal = getAssistsTotal(rows)
  const teamGoalsLimit = getTeamGoalsLimit(draft)

  if (onStartTotal > 11) return 'לא ניתן לסמן יותר מ-11 שחקנים כפותחים'

  if (isPlayedFlag && goalsTotal > teamGoalsLimit) {
    return `סך השערים של השחקנים (${goalsTotal}) גבוה ממספר שערי הקבוצה (${teamGoalsLimit})`
  }

  if (isPlayedFlag && assistsTotal > teamGoalsLimit) {
    return `סך הבישולים של השחקנים (${assistsTotal}) גבוה ממספר שערי הקבוצה (${teamGoalsLimit})`
  }

  const missingTimeForStarter = rows.some((row) => {
    if (!row?.onSquad || !row?.onStart || !isPlayedFlag) return false
    return toNumOrEmpty(row?.timePlayed) === ''
  })

  if (missingTimeForStarter) return 'יש שחקני הרכב ללא זמן משחק'

  return ''
}

export const sanitizeTeamGameEntryForSave = (row, isPlayedFlag) => {
  const onSquad = row?.onSquad === true
  const onStart = onSquad ? row?.onStart === true : false

  const entry = {
    playerId: row?.playerId,
    onSquad,
  }

  if (onStart) entry.onStart = true
  if (onSquad && isPlayedFlag && row?.goals !== '') entry.goals = Number(row.goals)
  if (onSquad && isPlayedFlag && row?.assists !== '') entry.assists = Number(row.assists)
  if (onSquad && isPlayedFlag && row?.timePlayed !== '') entry.timePlayed = Number(row.timePlayed)

  return entry
}

export const buildTeamGameEntryPatch = (draft) => {
  const existing = Array.isArray(draft?.existingGamePlayers) ? draft.existingGamePlayers : []
  const existingMap = new Map(
    existing
      .filter(Boolean)
      .map((item) => [item?.playerId || item?.id, item])
      .filter(([id]) => Boolean(id))
  )

  const dirtyRows = getTeamGameEntryDirtyRows(draft)
  if (!dirtyRows.length) return {}

  dirtyRows.forEach((row) => {
    existingMap.set(row.playerId, {
      ...(existingMap.get(row.playerId) || {}),
      ...sanitizeTeamGameEntryForSave(row, draft?.isPlayed === true),
    })
  })

  return {
    gamePlayers: Array.from(existingMap.values()),
  }
}
