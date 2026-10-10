// src/features/playersDatabase/services/write/stats/statsWriteOrchestrator.js

import { buildStatsLoadApprovedState } from '../../../domain/stats/index.js'
import { auditStats } from '../../audit/stats/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { readStatsLoadSources } from './readStatsLoadSources.js'
import { writeStatsCanonical } from './writeStatsCanonical.js'
import { writeStatsClubsCenter } from './writeStatsClubsCenter.js'
import { writeStatsCounterparts } from './writeStatsCounterparts.js'
import { writeStatsLeagueProjection } from './writeStatsLeagueProjection.js'
import { writeStatsLeaguesCenter } from './writeStatsLeaguesCenter.js'
import { writeStatsPlayerRoots } from './writeStatsPlayerRoots.js'
import { writeStatsPlayerSearchIndexes } from './writeStatsPlayerSearchIndexes.js'
import { writeStatsPlayerSeasons } from './writeStatsPlayerSeasons.js'

const STAGES = Object.freeze([
  'canonical',
  'counterparts',
  'playerRoots',
  'playerSeasons',
  'playerSearchIndexes',
  'leagueProjection',
  'leaguesCenter',
  'clubsCenter',
])

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requireInput = input => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Missing Stats Load input')
  if (!clean(input.leagueId) || !clean(input.teamId) || !clean(input.seasonId)) {
    throw new Error('Missing Stats Load target identity')
  }
  if (!Array.isArray(input.incomingPlayers)) throw new Error('Stats Load incomingPlayers must be an array')
  return input
}

const withReceiptId = ({ error, receiptId }) => {
  const result = error instanceof Error ? error : new Error(clean(error) || 'Stats Load failed')
  if (receiptId && !result.receiptId) result.receiptId = receiptId
  return result
}

const emitProgress = ({ onProgress, event }) => {
  if (typeof onProgress !== 'function') return
  try {
    onProgress(event)
  } catch {
    // UI progress reporting must not interrupt the persisted write flow.
  }
}

export const prepareStatsLoad = async ({ input = {} } = {}) => {
  const actionInput = requireInput(input)
  const sources = await readStatsLoadSources({
    leagueId: actionInput.leagueId,
    teamId: actionInput.teamId,
    seasonId: actionInput.seasonId,
    incomingPlayers: actionInput.incomingPlayers,
  })
  return buildStatsLoadApprovedState({
    leagueId: actionInput.leagueId,
    teamId: actionInput.teamId,
    seasonId: actionInput.seasonId,
    incomingPlayers: actionInput.incomingPlayers,
    reloadDecisions: actionInput.reloadDecisions || {},
    updatedAt: actionInput.updatedAt || null,
    sources,
  })
}

const runStage = async ({ stageId, approvedState, receiptId, onProgress }) => {
  const writers = {
    canonical: writeStatsCanonical,
    counterparts: writeStatsCounterparts,
    playerRoots: writeStatsPlayerRoots,
    playerSeasons: writeStatsPlayerSeasons,
    playerSearchIndexes: writeStatsPlayerSearchIndexes,
    leagueProjection: writeStatsLeagueProjection,
    leaguesCenter: writeStatsLeaguesCenter,
    clubsCenter: writeStatsClubsCenter,
  }
  const writer = writers[stageId]
  if (!writer) throw new Error(`Unsupported Stats Load stage: ${stageId}`)

  try {
    const result = await writer({ approvedState })
    await completeWriteActionStage({ receiptId, stageId })
    emitProgress({
      onProgress,
      event: { type: 'stageCompleted', receiptId, stageId },
    })
    return result
  } catch (error) {
    const stageError = withReceiptId({ error, receiptId })
    stageError.failedTarget = stageError.failedTarget || {
      targetType: stageId,
      documentId: approvedState.teamSeasonDocumentId,
    }
    await failWriteActionStage({ receiptId, stageId, error: stageError }).catch(() => null)
    emitProgress({
      onProgress,
      event: {
        type: 'stageFailed',
        receiptId,
        stageId,
        errorCode: clean(stageError.code || stageError.message),
      },
    })
    throw stageError
  }
}

export const loadStats = async ({
  approvedState = null,
  receiptId = '',
  display = {},
  onProgress,
} = {}) => {
  if (!approvedState || approvedState.actionType !== 'statsLoad') {
    throw new Error('Stats Load requires an approved state')
  }
  let resolvedReceiptId = ''

  try {
    resolvedReceiptId = await openWriteActionReceipt({
      actionType: 'statsLoad',
      target: {
        domain: 'stats',
        leagueId: approvedState.leagueId,
        clubId: approvedState.clubId,
        teamId: approvedState.teamId,
        seasonId: approvedState.seasonId,
      },
      display: {
        actionLabel: 'טעינת סטטיסטיקות',
        teamName: clean(display.teamName),
        leagueName: clean(display.leagueName),
        seasonKey: clean(approvedState.sourceSummary.seasonKey),
        playersCount: approvedState.sourceSummary.incomingPlayersCount,
      },
      receiptId,
    })
  } catch (error) {
    throw withReceiptId({ error, receiptId: resolvedReceiptId || receiptId })
  }
  emitProgress({
    onProgress,
    event: { type: 'receiptOpened', receiptId: resolvedReceiptId },
  })

  const stageResults = {}
  for (const stageId of STAGES) {
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
    audit = await auditStats({
      leagueId: approvedState.leagueId,
      teamId: approvedState.teamId,
      seasonId: approvedState.seasonId,
      approvedState,
    })
    receiptState = await completeWriteActionAudit({
      receiptId: resolvedReceiptId,
      audit,
    })
    emitProgress({
      onProgress,
      event: {
        type: receiptState.executionStatus === 'succeeded' ? 'stageCompleted' : 'stageFailed',
        receiptId: resolvedReceiptId,
        stageId: 'audit',
        receiptState,
      },
    })
  } catch (error) {
    const auditError = withReceiptId({ error, receiptId: resolvedReceiptId })
    auditError.failedTarget = auditError.failedTarget || {
      targetType: 'statsAudit',
      documentId: approvedState.teamSeasonDocumentId,
    }
    await failWriteActionStage({
      receiptId: resolvedReceiptId,
      stageId: 'audit',
      error: auditError,
    }).catch(() => null)
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
    actionType: 'statsLoad',
    receiptId: resolvedReceiptId,
    leagueId: approvedState.leagueId,
    teamId: approvedState.teamId,
    seasonId: approvedState.seasonId,
    status: receiptState.status,
    executionStatus: receiptState.executionStatus,
    recoveryRequired: receiptState.recoveryRequired,
    stageResults,
    approvedState,
    audit,
  }
}
