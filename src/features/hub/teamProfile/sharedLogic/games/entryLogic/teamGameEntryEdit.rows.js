// teamProfile/sharedLogic/games/entryLogic/teamGameEntryEdit.rows.js

import { toNum } from './teamGameEntryEdit.shared.js'
import {
  getGameDurationLimit,
  getTeamGoalsLimit,
  getOnStartTotal,
} from './teamGameEntryEdit.selectors.js'

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

export const clampStatToRowLimit = (rows = [], playerId, field, value, draft) => {
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

export const setRowField = (rows, playerId, field, value) => {
  const safeRows = Array.isArray(rows) ? rows : []

  if (field === 'onStart' && value === true) {
    const currentStarts = getOnStartTotal(safeRows)
    const currentRow = safeRows.find((row) => row?.playerId === playerId)
    const alreadyStarter = currentRow?.onStart === true

    if (!alreadyStarter && currentStarts >= 11) {
      return safeRows
    }
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
