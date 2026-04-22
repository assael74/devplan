// teamProfile/sharedLogic/games/entryLogic/teamGameEntryEdit.validation.js

import { normalizeBool, toNumOrEmpty } from './teamGameEntryEdit.shared.js'
import {
  getOnStartTotal,
  getGoalsTotal,
  getAssistsTotal,
  getTeamGoalsLimit,
} from './teamGameEntryEdit.selectors.js'

export const isRowDirty = (row) => {
  const i = row?.initial || {}

  return (
    normalizeBool(row?.onSquad) !== normalizeBool(i?.onSquad) ||
    normalizeBool(row?.onStart) !== normalizeBool(i?.onStart) ||
    toNumOrEmpty(row?.goals) !== toNumOrEmpty(i?.goals) ||
    toNumOrEmpty(row?.assists) !== toNumOrEmpty(i?.assists) ||
    toNumOrEmpty(row?.timePlayed) !== toNumOrEmpty(i?.timePlayed)
  )
}

export const getDirtyRows = (draft) => {
  const rows = Array.isArray(draft?.rows) ? draft.rows : []
  return rows.filter(isRowDirty)
}

export const getIsDirty = (draft) => getDirtyRows(draft).length > 0

export const getIsValid = (draft) => {
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

    const timePlayed = toNumOrEmpty(row?.timePlayed)
    if (timePlayed === '') return false

    return true
  })
}

export const getValidationMessage = (draft) => {
  const rows = Array.isArray(draft?.rows) ? draft.rows : []
  const isPlayedFlag = draft?.isPlayed === true

  const onStartTotal = getOnStartTotal(rows)
  const goalsTotal = getGoalsTotal(rows)
  const assistsTotal = getAssistsTotal(rows)
  const teamGoalsLimit = getTeamGoalsLimit(draft)

  if (onStartTotal > 11) {
    return 'לא ניתן לסמן יותר מ-11 שחקנים כפותחים'
  }

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

  if (missingTimeForStarter) {
    return 'יש שחקני הרכב ללא זמן משחק'
  }

  return ''
}
