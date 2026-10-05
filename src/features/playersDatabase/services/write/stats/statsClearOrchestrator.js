// src/features/playersDatabase/services/write/stats/statsClearOrchestrator.js

import { buildStatsClearApprovedState } from '../../../domain/stats/index.js'
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
import { writeStatsLeagueProjection } from './writeStatsLeagueProjection.js'
import { writeStatsLeaguesCenter } from './writeStatsLeaguesCenter.js'
import { writeStatsPlayerRoots } from './writeStatsPlayerRoots.js'
import { writeStatsPlayerSearchIndexes } from './writeStatsPlayerSearchIndexes.js'
import { writeStatsPlayerSeasons } from './writeStatsPlayerSeasons.js'

const STAGES = Object.freeze([
  'canonical',
  'playerRoots',
  'playerSeasons',
  'playerSearchIndexes',
  'leagueProjection',
  'leaguesCenter',
  'clubsCenter',
])

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requireInput = input => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Missing Stats Clear input')
  if (!clean(input.leagueId) || !clean(input.teamId) || !clean(input.seasonId)) {
    throw new Error('Missing Stats Clear target identity')
  }
  return input
}

const withReceiptId = ({ error, receiptId }) => {
  const result = error instanceof Error ? error : new Error(clean(error) || 'Stats Clear failed')
  if (receiptId && !result.receiptId) result.receiptId = receiptId
  return result
}

export const prepareStatsClear = async ({ input = {} } = {}) => {
  const actionInput = requireInput(input)
  const sources = await readStatsLoadSources({
    leagueId: actionInput.leagueId,
    teamId: actionInput.teamId,
    seasonId: actionInput.seasonId,
    incomingPlayers: [],
  })
  return buildStatsClearApprovedState({
    leagueId: actionInput.leagueId,
    teamId: actionInput.teamId,
    seasonId: actionInput.seasonId,
    updatedAt: actionInput.updatedAt || new Date().toISOString(),
    sources,
  })
}

const writerByStage = Object.freeze({
  canonical: writeStatsCanonical,
  playerRoots: writeStatsPlayerRoots,
  playerSeasons: writeStatsPlayerSeasons,
  playerSearchIndexes: writeStatsPlayerSearchIndexes,
  leagueProjection: writeStatsLeagueProjection,
  leaguesCenter: writeStatsLeaguesCenter,
  clubsCenter: writeStatsClubsCenter,
})

const runStage = async ({ stageId, approvedState, receiptId }) => {
  const writer = writerByStage[stageId]
  if (!writer) throw new Error(`Unsupported Stats Clear stage: ${stageId}`)
  try {
    const result = await writer({ approvedState })
    await completeWriteActionStage({ receiptId, stageId })
    return result
  } catch (error) {
    const stageError = withReceiptId({ error, receiptId })
    stageError.failedStep = stageId
    stageError.failedTarget = stageError.failedTarget || {
      targetType: stageId,
      documentId: approvedState.teamSeasonDocumentId,
    }
    await failWriteActionStage({ receiptId, stageId, error: stageError }).catch(() => null)
    throw stageError
  }
}

const buildProjectionWriteSummary = stageResults => {
  const targets = STAGES
    .filter(stageId => stageId !== 'canonical' && stageResults[stageId])
    .map(stageId => {
      const result = stageResults[stageId]
      const written = result.written === true ? 1 : Number(result.written) || 0
      return written > 0
        ? { targetType: stageId, status: 'written', written }
        : { targetType: stageId, status: 'skipped', skipped: 1 }
    })
  return {
    targets,
    writesCompleted: targets.reduce((total, target) => total + (target.written || 0), 0),
    writesSkipped: targets.reduce((total, target) => total + (target.skipped || 0), 0),
  }
}

export const clearStats = async ({ approvedState = null, receiptId = '', display = {} } = {}) => {
  if (!approvedState || approvedState.actionType !== 'statsClear') {
    throw new Error('Stats Clear requires an approved state')
  }
  let resolvedReceiptId = ''

  try {
    resolvedReceiptId = await openWriteActionReceipt({
      actionType: 'statsClear',
      target: {
        domain: 'stats',
        leagueId: approvedState.leagueId,
        clubId: approvedState.clubId,
        teamId: approvedState.teamId,
        seasonId: approvedState.seasonId,
      },
      display: {
        actionLabel: 'מחיקת סטטיסטיקות',
        teamName: clean(display.teamName),
        leagueName: clean(display.leagueName),
        seasonKey: clean(approvedState.sourceSummary.seasonKey),
        playersCount: approvedState.impact.playersAffected,
      },
      receiptId,
    })
  } catch (error) {
    const receiptError = withReceiptId({ error, receiptId: resolvedReceiptId || receiptId })
    receiptError.failedStep = 'receipt'
    throw receiptError
  }

  const stageResults = {}
  for (const stageId of STAGES) {
    try {
      stageResults[stageId] = await runStage({
        stageId,
        approvedState,
        receiptId: resolvedReceiptId,
      })
    } catch (error) {
      error.canonicalWrite = stageResults.canonical
        ? {
          ...stageResults.canonical,
          playersAffected: approvedState.impact.playersAffected,
        }
        : null
      error.projectionWrite = buildProjectionWriteSummary(stageResults)
      if (stageId !== 'canonical') {
        error.projectionWrite.failedTarget = {
          ...error.failedTarget,
          targetType: stageId,
          status: 'failed',
        }
      }
      throw error
    }
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
    receiptState = await completeWriteActionAudit({ receiptId: resolvedReceiptId, audit })
    if (receiptState.executionStatus !== 'succeeded') {
      const error = new Error('Stats Clear Audit found unresolved differences')
      error.code = 'STATS_CLEAR_AUDIT_FAILED'
      error.audit = audit
      throw error
    }
  } catch (error) {
    const auditError = withReceiptId({ error, receiptId: resolvedReceiptId })
    auditError.failedStep = 'audit'
    auditError.failedTarget = auditError.failedTarget || {
      targetType: 'statsAudit',
      documentId: approvedState.teamSeasonDocumentId,
    }
    await failWriteActionStage({
      receiptId: resolvedReceiptId,
      stageId: 'audit',
      error: auditError,
    }).catch(() => null)
    throw auditError
  }

  const canonicalWrite = {
    ...stageResults.canonical,
    playersAffected: approvedState.impact.playersAffected,
  }
  const projectionWrite = buildProjectionWriteSummary(stageResults)
  return {
    actionType: 'statsClear',
    receiptId: resolvedReceiptId,
    leagueId: approvedState.leagueId,
    teamId: approvedState.teamId,
    seasonId: approvedState.seasonId,
    status: receiptState.status,
    executionStatus: receiptState.executionStatus,
    recoveryRequired: receiptState.recoveryRequired,
    canonicalWrite,
    projectionWrite,
    stageResults: { ...stageResults, audit },
    audit,
  }
}
