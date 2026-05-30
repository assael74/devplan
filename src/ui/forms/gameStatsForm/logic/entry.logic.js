// src/ui/forms/gameStatsForm/logic/entry.logic.js

const isRateParm = parm => {
  return parm?.id?.toLowerCase().includes('rate')
}

const isTotalParm = parm => {
  return parm?.id?.toLowerCase().endsWith('total')
}

const hasValue = value => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return true

  return false
}

const isSuccessParm = parm => {
  return !isTotalParm(parm) && !isRateParm(parm)
}

const getTripletLabel = items => {
  const total = items.find(isTotalParm)

  return total?.statsParmShortName ||
    total?.statsParmName ||
    items[0]?.tripletGroup ||
    ''
}

const getTripletType = items => {
  const found = items.find(item => item?.statsParmType)

  return found?.statsParmType || 'general'
}

const buildTripletField = (group, items) => {
  const total = items.find(isTotalParm)
  const rate = items.find(isRateParm)
  const success = items.find(isSuccessParm)

  if (!total || !success || !rate) return null

  return {
    id: group,
    type: 'triplet',
    label: getTripletLabel(items),
    statsParmType: getTripletType(items),
    totalKey: total.id,
    successKey: success.id,
    rateKey: rate.id,
  }
}

const buildRegularField = parm => {
  return {
    id: parm.id,
    type: parm.statsParmFieldType || 'number',
    statsParmType: parm.statsParmType || 'general',
    parm,
  }
}

const isRegularFieldFilled = ({ field, row }) => {
  if (!field || !row) return false

  return hasValue(row[field.id])
}

const hasPositiveNumber = value => {
  const num = Number(value)

  return Number.isFinite(num) && num > 0
}

const isTripletFieldFilled = ({ field, row }) => {
  if (!field || !row) return false

  return (
    hasPositiveNumber(row[field.totalKey]) ||
    hasPositiveNumber(row[field.successKey])
  )
}

export const getEntryFieldsProgress = ({ fields, row }) => {
  const safeFields = Array.isArray(fields) ? fields.filter(Boolean) : []
  const total = safeFields.length

  const filled = safeFields.filter(field => {
    if (field.type === 'triplet') {
      return isTripletFieldFilled({ field, row })
    }

    return isRegularFieldFilled({ field, row })
  }).length

  return {
    filled,
    total,
    text: `${filled}/${total} שדות`,
    isComplete: total > 0 && filled >= total,
  }
}

export const buildEntryFields = parms => {
  const regular = []
  const triplets = {}

  ;(parms || []).forEach(parm => {
    if (parm.statsParmFieldType !== 'triplet') {
      regular.push(buildRegularField(parm))
      return
    }

    const group = parm.tripletGroup || parm.id
    triplets[group] = [...(triplets[group] || []), parm]
  })

  const tripletFields = Object.entries(triplets)
    .map(([group, items]) => buildTripletField(group, items))
    .filter(Boolean)

  return [...regular, ...tripletFields]
}

export const splitEntryFields = fields => {
  const safeFields = Array.isArray(fields) ? fields : []

  return {
    regularFields: safeFields.filter(field => field.type !== 'triplet'),
    tripletFields: safeFields.filter(field => field.type === 'triplet'),
  }
}

export const findPlayerStatsRow = ({ draft, playerId }) => {
  const rows = Array.isArray(draft?.playerStats) ? draft.playerStats : []

  return rows.find(row => row.playerId === playerId) || null
}

export const updatePlayerStatsRow = ({ draft, playerId, patch }) => {
  const rows = Array.isArray(draft?.playerStats) ? draft.playerStats : []

  return rows.map(row => {
    if (row.playerId !== playerId) return row

    return {
      ...row,
      ...(patch || {}),
    }
  })
}

export const restorePlayerStatsRow = ({ draft, savedDraft, playerId }) => {
  const currentRows = Array.isArray(draft?.playerStats)
    ? draft.playerStats
    : []

  const savedRows = Array.isArray(savedDraft?.playerStats)
    ? savedDraft.playerStats
    : []

  const savedRow = savedRows.find(row => row?.playerId === playerId)

  if (!savedRow) {
    return currentRows.filter(row => row?.playerId !== playerId)
  }

  const exists = currentRows.some(row => row?.playerId === playerId)

  if (!exists) {
    return [...currentRows, savedRow]
  }

  return currentRows.map(row => {
    if (row?.playerId !== playerId) return row

    return savedRow
  })
}

/**
 * Triplet input logic
 */

export const isEmptyTripletValue = value => {
  return value === null || value === undefined || value === ''
}

export const toTripletNumber = value => {
  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

export const toTripletDraftValue = value => {
  if (isEmptyTripletValue(value)) return ''

  const num = Number(value)

  return Number.isFinite(num) && num >= 0 ? num : ''
}

export const isValidTripletNumberInput = value => {
  if (value === '') return true

  const num = Number(value)

  return Number.isFinite(num) && num >= 0
}

export const shouldBlockTripletKey = key => {
  return ['-', 'Minus', '+', 'e', 'E'].includes(key)
}

export const shouldBlockTripletPaste = text => {
  if (text === '') return false

  const num = Number(text)

  return !Number.isFinite(num) || num < 0
}

export const isTripletSuccessDisabled = totalValue => {
  return toTripletNumber(totalValue) <= 0
}

export const clampTripletSuccess = ({ success, total }) => {
  if (isEmptyTripletValue(success)) return ''

  const totalNum = toTripletNumber(total)
  const successNum = toTripletNumber(success)

  if (totalNum <= 0) return ''

  return Math.min(successNum, totalNum)
}

export const calcTripletRate = ({ total, success }) => {
  if (isEmptyTripletValue(total) || isEmptyTripletValue(success)) return ''

  const totalNum = toTripletNumber(total)
  const successNum = toTripletNumber(success)

  if (totalNum <= 0) return ''

  return Math.round((successNum / totalNum) * 1000) / 10
}

export const buildTripletTotalPatch = ({
  rawValue,
  successValue,
  totalKey,
  successKey,
  rateKey,
}) => {
  const total = toTripletDraftValue(rawValue)
  const success = clampTripletSuccess({
    success: successValue,
    total,
  })
  const rate = calcTripletRate({ total, success })

  return {
    [totalKey]: total,
    [successKey]: success,
    [rateKey]: rate,
  }
}

export const buildTripletSuccessPatch = ({
  rawValue,
  totalValue,
  successKey,
  rateKey,
}) => {
  const success = clampTripletSuccess({
    success: rawValue,
    total: totalValue,
  })
  const rate = calcTripletRate({
    total: totalValue,
    success,
  })

  return {
    [successKey]: success,
    [rateKey]: rate,
  }
}
