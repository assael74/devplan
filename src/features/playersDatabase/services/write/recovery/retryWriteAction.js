// src/features/playersDatabase/services/write/recovery/retryWriteAction.js

import { bootstrapClubs } from '../club/index.js'
import {
  clearLeagueTeams,
  deleteLeagueSeason,
} from '../league/index.js'
import { clearRoster, prepareRosterClear } from '../roster/index.js'
import { clearStats } from '../stats/index.js'
import { getWriteActionReceipt } from '../receipt/index.js'
import { repairWriteActionReceipt } from './repairWriteAction.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const DIRECT_RECEIPT_RETRY_ACTIONS = Object.freeze([
  'leagueTeamsClear',
  'leagueSeasonDelete',
  'rosterClear',
  'statsClear',
  'clubsBootstrap',
])

export const canRetryWriteActionFromReceipt = actionType => (
  DIRECT_RECEIPT_RETRY_ACTIONS.includes(clean(actionType))
)

const requireOpenReceipt = receipt => {
  if (!receipt) throw new Error('הקבלה לא נמצאה')
  if (clean(receipt.status) !== 'open') throw new Error('אפשר לנסות שוב רק קבלה פתוחה')
  if (!canRetryWriteActionFromReceipt(receipt.actionType)) {
    throw new Error('הפעולה דורשת את קלט הטעינה המקורי')
  }
  return receipt
}

export const retryWriteActionReceipt = async ({ receiptId = '', approvedState = null } = {}) => {
  const id = clean(receiptId)
  if (!id) throw new Error('חסר מזהה קבלה')

  const receipt = requireOpenReceipt(await getWriteActionReceipt({ receiptId: id }))
  if (
    clean(receipt.actionType) !== 'clubsBootstrap' &&
    clean(receipt.canonicalOutcome) === 'confirmed'
  ) {
    return repairWriteActionReceipt({ receiptId: id })
  }
  const target = receipt.target || {}
  const display = receipt.display || {}

  if (receipt.actionType === 'leagueTeamsClear') {
    return clearLeagueTeams({ input: target, receiptId: id, display })
  }
  if (receipt.actionType === 'leagueSeasonDelete') {
    return deleteLeagueSeason({ input: target, receiptId: id, display })
  }
  if (receipt.actionType === 'rosterClear') {
    const resolvedApprovedState = approvedState || await prepareRosterClear({ input: target })
    return clearRoster({ approvedState: resolvedApprovedState, receiptId: id, display })
  }
  if (receipt.actionType === 'statsClear') {
    return clearStats({ input: target, receiptId: id, display })
  }
  if (receipt.actionType === 'clubsBootstrap') {
    return bootstrapClubs({ receiptId: id })
  }

  throw new Error('סוג הקבלה אינו נתמך לניסיון חוזר ישיר')
}
