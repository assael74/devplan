// src/ui/forms/gameStatsForm/logic/save/payload.logic.js

import { getVisibleParms } from '../parms.logic.js'
import { buildEntryFields, getEntryFieldsProgress } from '../entry.logic.js'

const toPayloadNumber = value => {
  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

const hasPositiveNumber = value => {
  return toPayloadNumber(value) > 0
}

const clampSuccess = ({ total, success }) => {
  const totalNum = toPayloadNumber(total)
  const successNum = toPayloadNumber(success)

  if (totalNum <= 0) return 0

  return Math.min(successNum, totalNum)
}

const calcRate = ({ total, success }) => {
  const totalNum = toPayloadNumber(total)
  const successNum = toPayloadNumber(success)

  if (totalNum <= 0) return 0

  return Math.round((successNum / totalNum) * 1000) / 10
}

const shouldKeepRegularField = ({ row, field }) => {
  return hasPositiveNumber(row?.[field.id])
}

const shouldKeepTripletField = ({ row, field }) => {
  const total = toPayloadNumber(row?.[field.totalKey])
  const success = toPayloadNumber(row?.[field.successKey])

  return total > 0 || success > 0
}

const addRegularField = ({ acc, row, field }) => {
  if (!shouldKeepRegularField({ row, field })) return acc

  return {
    ...acc,
    [field.id]: toPayloadNumber(row?.[field.id]),
  }
}

const addTripletField = ({ acc, row, field }) => {
  if (!shouldKeepTripletField({ row, field })) return acc

  const total = toPayloadNumber(row?.[field.totalKey])
  const success = clampSuccess({
    total,
    success: row?.[field.successKey],
  })
  const rate = calcRate({ total, success })

  return {
    ...acc,
    [field.totalKey]: total,
    [field.successKey]: success,
    [field.rateKey]: rate,
  }
}

const buildPlayerStatsValues = ({ row, fields }) => {
  return (fields || []).reduce((acc, field) => {
    if (field.type === 'triplet') {
      return addTripletField({ acc, row, field })
    }

    return addRegularField({ acc, row, field })
  }, {})
}

const buildPlayerTimeMeta = row => {
  return {
    timePlayed: toPayloadNumber(row?.timePlayed),
    timeVideoStats: toPayloadNumber(row?.timeVideoStats),
  }
}

const buildPlayerPayloadRow = ({ row, fields }) => {
  const stats = buildPlayerStatsValues({ row, fields })
  const progress = getEntryFieldsProgress({ fields, row })
  const timeMeta = buildPlayerTimeMeta(row)

  return {
    playerId: row.playerId,

    ...timeMeta,

    stats,

    completeness: {
      filled: progress.filled,
      total: progress.total,
      isComplete: progress.isComplete,
      isEmpty: progress.filled === 0,
      isPartial: progress.filled > 0 && progress.filled < progress.total,
    },
  }
}

const hasStatsToSave = row => {
  return Object.keys(row?.stats || {}).length > 0
}

const getScopedSelectedIds = draft => {
  const selectedIds = draft?.selectedPlayerIds || []

  if (draft?.scope !== 'player' && draft?.meta?.scope !== 'player') {
    return selectedIds
  }

  const editablePlayerId =
    draft?.editablePlayerId ||
    draft?.meta?.editablePlayerId ||
    draft?.meta?.playerId ||
    draft?.activePlayerId ||
    ''

  return editablePlayerId ? [editablePlayerId] : selectedIds
}

const buildPlayersPayload = ({ draft, fields }) => {
  const selectedIds = new Set(getScopedSelectedIds(draft))
  const rows = Array.isArray(draft?.playerStats) ? draft.playerStats : []

  return rows
    .filter(row => selectedIds.has(row.playerId))
    .map(row => buildPlayerPayloadRow({ row, fields }))
    .filter(hasStatsToSave)
}

const buildFormModel = draft => {
  const selectedParmIds = draft?.selectedParmIds || []
  const visibleParms = getVisibleParms(selectedParmIds)
  const fields = buildEntryFields(visibleParms)

  return {
    selectedParmIds,
    fields,
  }
}

const buildPayloadMeta = draft => {
  return {
    ...(draft?.meta || {}),
    timePlayed: toPayloadNumber(draft?.timePlayed),
    timeVideoStats: toPayloadNumber(draft?.timeVideoStats),
  }
}

export const buildGameStatsPayload = draft => {
  const model = buildFormModel(draft)

  const playerStats = buildPlayersPayload({
    draft,
    fields: model.fields,
  })

  return {
    gameId: draft?.gameId || '',
    teamId: draft?.teamId || '',
    status: draft?.status || 'draft',
    source: draft?.source || 'manual',
    preset: draft?.preset || 'custom',

    ...(draft?.gameStatsDocId ? { gameStatsDocId: draft.gameStatsDocId } : {}),

    selectedPlayerIds: draft?.selectedPlayerIds || [],
    selectedParmIds: model.selectedParmIds,

    meta: buildPayloadMeta(draft),

    playerStats,

    summary: {
      playersCount: draft?.selectedPlayerIds?.length || 0,
      savedPlayersCount: playerStats.length,
      parmsCount: model.selectedParmIds.length,
      statsFieldsCount: playerStats.reduce((sum, row) => {
        return sum + Object.keys(row.stats || {}).length
      }, 0),
      completedPlayersCount: playerStats.filter(row => row.completeness.isComplete).length,
    },
  }
}
