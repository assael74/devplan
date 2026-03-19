import { getDirtyRows } from './teamGameEntryEdit.validation.js'

export const sanitizeEntryForSave = (row, isPlayedFlag) => {
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

export const buildPatch = (draft) => {
  const existing = Array.isArray(draft?.existingGamePlayers) ? draft.existingGamePlayers : []
  const existingMap = new Map(
    existing
      .filter(Boolean)
      .map((item) => [item?.playerId || item?.id, item])
      .filter(([id]) => !!id)
  )

  const dirtyRows = getDirtyRows(draft)
  if (!dirtyRows.length) return {}

  dirtyRows.forEach((row) => {
    existingMap.set(row.playerId, {
      ...(existingMap.get(row.playerId) || {}),
      ...sanitizeEntryForSave(row, draft?.isPlayed === true),
    })
  })

  return {
    gamePlayers: Array.from(existingMap.values()),
  }
}
