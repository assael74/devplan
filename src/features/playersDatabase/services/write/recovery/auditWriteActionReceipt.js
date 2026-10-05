// src/features/playersDatabase/services/write/recovery/auditWriteActionReceipt.js

import { auditClubBootstrap } from '../../audit/club/index.js'
import { auditLeague } from '../../audit/league/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import { auditStats } from '../../audit/stats/index.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { buildClubBootstrapExpectedState } from '../../../domain/club/bootstrapClubCatalog.builder.js'
import { getWriteActionReceipt } from '../receipt/index.js'
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
  'clubsBootstrap',
])

const runReceiptAudit = async ({ actionType, target }) => {
  if (actionType === 'clubsBootstrap') {
    const approvedState = buildClubBootstrapExpectedState({
      catalog: PLAYERS_DATABASE_CLUBS_CATALOG,
    })
    return auditClubBootstrap({ approvedState })
  }

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

export const auditWriteActionReceipt = async ({ receiptId = '' } = {}) => {
  const id = clean(receiptId)
  if (!id) throw new Error('חסר מזהה קבלה')

  const receipt = await getWriteActionReceipt({ receiptId: id })
  if (!receipt) throw new Error('הקבלה לא נמצאה')

  const actionType = clean(receipt.actionType)
  if (!AUDITABLE_ACTIONS.includes(actionType)) {
    throw new Error('סוג הפעולה אינו תומך בבדיקת סנכרון')
  }
  const target = actionType === 'clubsBootstrap'
    ? {}
    : requireWriteActionReceiptTarget(receipt)
  const audit = await runReceiptAudit({ actionType, target })

  return {
    receiptId: id,
    actionType,
    audit,
  }
}

export default auditWriteActionReceipt
