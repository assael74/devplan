// src/features/playersDatabase/services/write/recovery/auditWriteActionReceipt.js

import { auditLeague } from '../../audit/league/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import { auditStats } from '../../audit/stats/index.js'
import { completeWriteActionAudit, getWriteActionReceipt } from '../receipt/index.js'
import {
  prepareRosterReceiptState,
  prepareStatsReceiptState,
  requireWriteActionReceiptTarget,
} from './repairWriteAction.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const AUDITABLE_ACTIONS = Object.freeze([
  'leagueOpen',
  'leagueLoad',
  'leagueTeamsClear',
  'leagueSeasonDelete',
  'rosterLoad',
  'rosterClear',
  'statsLoad',
  'statsClear',
])

const runReceiptAudit = async ({ actionType, target }) => {
  if (actionType.startsWith('league')) {
    return auditLeague(target)
  }
  if (actionType.startsWith('roster')) {
    const approvedState = await prepareRosterReceiptState({ actionType, target })
    return auditRoster({ approvedState })
  }
  if (actionType.startsWith('stats')) {
    const approvedState = await prepareStatsReceiptState({ actionType, target })
    return auditStats({ ...target, approvedState })
  }
  throw new Error('סוג הפעולה אינו תומך בבדיקת סנכרון')
}

export const auditWriteActionReceipt = async ({ receiptId = '', closeIfClean = false } = {}) => {
  const id = clean(receiptId)
  if (!id) throw new Error('חסר מזהה קבלה')

  const receipt = await getWriteActionReceipt({ receiptId: id })
  if (!receipt) throw new Error('הקבלה לא נמצאה')

  const actionType = clean(receipt.actionType)
  if (!AUDITABLE_ACTIONS.includes(actionType)) {
    throw new Error('סוג הפעולה אינו תומך בבדיקת סנכרון')
  }
  const target = requireWriteActionReceiptTarget(receipt)
  const audit = await runReceiptAudit({ actionType, target })

  if (
    closeIfClean &&
    receipt.status !== 'closed' &&
    receipt.executionStatus !== 'running' &&
    receipt.canonicalOutcome === 'confirmed' &&
    audit?.coverage?.complete === true &&
    Array.isArray(audit.findings) &&
    audit.findings.length === 0
  ) {
    await completeWriteActionAudit({ receiptId: id, audit })
  }

  return {
    receiptId: id,
    actionType,
    audit,
  }
}

export default auditWriteActionReceipt
