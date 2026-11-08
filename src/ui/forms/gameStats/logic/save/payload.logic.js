// src/ui/forms/gameStats/logic/save/payload.logic.js

import { getVisibleParams } from '../params.logic.js'
import { buildEntryFields, getEntryFieldsProgress } from '../entry.logic.js'
import { calculateSuccessRate } from '../../../../../shared/stats/stats.helpers.js'

const toPayloadNumber = value => {
  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

const hasNumber = value => {
  if (value === null || value === undefined || value === '') return false
  if (typeof value === 'string' && !value.trim()) return false

  const num = Number(value)
  return Number.isFinite(num) && num >= 0
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

  return calculateSuccessRate(totalNum, successNum)
}

const shouldKeepRegularField = ({ row, field }) => {
  return hasNumber(row?.[field.id])
}

const shouldKeepTripletField = ({ row, field }) => {
  return hasNumber(row?.[field.totalKey])
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

  const scope = draft?.scope || draft?.meta?.scope

  if (scope !== 'player' && scope !== 'privatePlayer') {
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
  const visibleParams = getVisibleParams(selectedParmIds)
  const fields = buildEntryFields(visibleParams)

  return {
    selectedParmIds,
    fields,
  }
}

const buildPayloadMeta = draft => {
  const scope = draft?.scope || draft?.meta?.scope

  if (scope === 'player' || scope === 'privatePlayer') {
    const meta = { ...(draft?.meta || {}) }
    delete meta.timePlayed
    delete meta.timeVideoStats
    return meta
  }

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
    gameDuration: toPayloadNumber(draft?.gameDuration),
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
