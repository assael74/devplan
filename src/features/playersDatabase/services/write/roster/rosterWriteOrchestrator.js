// src/features/playersDatabase/services/write/roster/rosterWriteOrchestrator.js

import {
  buildRosterClearWritePlan,
  buildRosterLoadWritePlan,
} from '../../../domain/roster/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { readRosterClearSources, readRosterLoadSources } from './readRosterWriteSources.js'
import { writeRosterCanonical } from './writeRosterCanonical.js'
import { writeRosterCounterparts } from './writeRosterCounterparts.js'
import { writeRosterPlayerSeasons } from './writeRosterPlayerSeasons.js'
import { writeRosterPlayerSearchIndexes } from './writeRosterPlayerSearchIndexes.js'
import { writeRosterLeagueProjection } from './writeRosterLeagueProjection.js'
import { writeRosterLeaguesCenter } from './writeRosterLeaguesCenter.js'
import { writeRosterClubsCenter } from './writeRosterClubsCenter.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const LOAD_STAGES = Object.freeze([
  'canonical',
  'counterparts',
  'playerSeasons',
  'playerSearchIndexes',
  'leagueProjection',
  'leaguesCenter',
  'clubsCenter',
])

const CLEAR_STAGES = Object.freeze([
  'canonical',
  'playerSeasons',
  'playerSearchIndexes',
  'leagueProjection',
  'leaguesCenter',
  'clubsCenter',
])

const withReceiptId = ({ error, receiptId }) => {
  const resolved = error instanceof Error ? error : new Error(clean(error) || 'Roster write failed')
  if (receiptId && !resolved.receiptId) resolved.receiptId = receiptId
  return resolved
}

const emitProgress = ({ onProgress, event }) => {
  if (typeof onProgress !== 'function') return
  try {
    onProgress(event)
  } catch {
    // UI progress reporting must not interrupt the persisted write flow.
  }
}

const runStage = async ({ stageId, approvedState, receiptId, onProgress }) => {
  try {
    let result
    if (stageId === 'canonical') result = await writeRosterCanonical({ approvedState })
    else if (stageId === 'counterparts') result = await writeRosterCounterparts({ approvedState })
    else if (stageId === 'playerSeasons') result = await writeRosterPlayerSeasons({ approvedState })
    else if (stageId === 'playerSearchIndexes') result = await writeRosterPlayerSearchIndexes({ approvedState })
    else if (stageId === 'leagueProjection') result = await writeRosterLeagueProjection({ approvedState })
    else if (stageId === 'leaguesCenter') result = await writeRosterLeaguesCenter({ approvedState })
    else if (stageId === 'clubsCenter') result = await writeRosterClubsCenter({ approvedState })
    else throw new Error('Unsupported Roster write stage')

    await completeWriteActionStage({ receiptId, stageId })
    emitProgress({
      onProgress,
      event: { type: 'stageCompleted', receiptId, stageId },
    })
    return result
  } catch (error) {
    const resolved = withReceiptId({ error, receiptId })
    try {
      await failWriteActionStage({ receiptId, stageId, error: resolved })
    } catch (receiptError) {
      resolved.receiptUpdateError = withReceiptId({ error: receiptError, receiptId })
    }
    emitProgress({
      onProgress,
      event: {
        type: 'stageFailed',
        receiptId,
        stageId,
        errorCode: clean(resolved.code || resolved.message),
      },
    })
    throw resolved
  }
}

const openRosterReceipt = async ({ actionType, approvedState, receiptId, display }) => openWriteActionReceipt({
  actionType,
  target: {
    domain: 'roster',
    leagueId: approvedState.leagueId,
    clubId: approvedState.clubId,
    teamId: approvedState.teamId,
    seasonId: approvedState.seasonId,
    playerId: '',
  },
  display,
  receiptId,
})

const executeBusinessStages = async ({
  actionType,
  approvedState,
  stages,
  receiptId,
  display,
  onProgress,
}) => {
  const resolvedReceiptId = await openRosterReceipt({
    actionType,
    approvedState,
    receiptId,
    display,
  })
  emitProgress({
    onProgress,
    event: { type: 'receiptOpened', receiptId: resolvedReceiptId },
  })
  const stageResults = {}
  for (const stageId of stages) {
    stageResults[stageId] = await runStage({
      stageId,
      approvedState,
      receiptId: resolvedReceiptId,
      onProgress,
    })
  }
  let audit
  let receiptState
  try {
    audit = await auditRoster({ approvedState })
    receiptState = await completeWriteActionAudit({ receiptId: resolvedReceiptId, audit })
    emitProgress({
      onProgress,
      event: {
        type: receiptState.executionStatus === 'succeeded'
          ? 'stageCompleted'
          : 'stageFailed',
        receiptId: resolvedReceiptId,
        stageId: 'audit',
        receiptState,
      },
    })
  } catch (error) {
    const auditError = withReceiptId({ error, receiptId: resolvedReceiptId })
    auditError.failedTarget = auditError.failedTarget || {
      targetType: 'rosterAudit',
      documentId: approvedState.teamSeasonDocumentId,
    }
    await failWriteActionStage({ receiptId: resolvedReceiptId, stageId: 'audit', error: auditError }).catch(() => null)
    emitProgress({
      onProgress,
      event: {
        type: 'stageFailed',
        receiptId: resolvedReceiptId,
        stageId: 'audit',
        errorCode: clean(auditError.code || auditError.message),
      },
    })
    throw auditError
  }
  stageResults.audit = audit
  return {
    actionType,
    receiptId: resolvedReceiptId,
    teamId: approvedState.teamId,
    teamSeasonDocumentId: approvedState.teamSeasonDocumentId,
    leagueId: approvedState.leagueId,
    seasonId: approvedState.seasonId,
    status: receiptState.status,
    executionStatus: receiptState.executionStatus,
    recoveryRequired: receiptState.recoveryRequired,
    stageResults,
    approvedState,
    audit,
  }
}

export const prepareRosterLoad = async ({ input = {} } = {}) => {
  const freshSources = await readRosterLoadSources({ input })
  return buildRosterLoadWritePlan({ ...input, ...freshSources })
}

export const prepareRosterClear = async ({ input = {} } = {}) => {
  const freshSources = await readRosterClearSources({ input })
  return buildRosterClearWritePlan({ ...input, ...freshSources })
}

export const loadRoster = async ({
  approvedState = null,
  receiptId = '',
  display = {},
  onProgress,
} = {}) => {
  if (!approvedState || approvedState.actionType !== 'rosterLoad') {
    throw new Error('Roster Load requires an approved state')
  }
  return executeBusinessStages({
    actionType: 'rosterLoad',
    approvedState,
    stages: LOAD_STAGES,
    receiptId,
    display,
    onProgress,
  })
}

export const clearRoster = async ({
  approvedState = null,
  receiptId = '',
  display = {},
  onProgress,
} = {}) => {
  if (!approvedState || approvedState.actionType !== 'rosterClear') {
    throw new Error('Roster Clear requires an approved state')
  }
  return executeBusinessStages({
    actionType: 'rosterClear',
    approvedState,
    stages: CLEAR_STAGES,
    receiptId,
    display,
    onProgress,
  })
}
