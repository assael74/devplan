import * as React from 'react'

import {
  STATS_FINAL_SYNC_STAGES,
  runStatsFinalSyncStageV2,
} from '../../../../../../services/writeV2/stats/index.js'
import {
  WRITE_ACTION_V2_CANONICAL_STATUS,
  WRITE_ACTION_V2_FLOW_TYPE,
  closeWriteActionReceiptV2,
  createWriteActionReceiptV2,
  reportWriteActionCanonicalStatusV2,
  saveWriteActionAuditSummaryV2,
} from '../../../../../../services/writeV2/receipt/index.js'
import { auditStatsV2 } from '../../../../../../services/auditV2/index.js'

const STATS_AUDIT_STAGE = 'audit'
const STATS_STAGE_BY_AUDIT_TARGET = Object.freeze({
  teamSeason: 'canonical',
  counterpart: 'counterparts',
  playerDocument: 'playerDocuments',
  playerSearchIndex: 'playerIndexes',
  teamSearchIndex: 'teamLeague',
  leagueMetadata: 'teamLeague',
  leaguesMaster: 'teamLeague',
  club: 'clubs',
  clubsMaster: 'clubs',
})
const STATS_UI_SYNC_STAGES = Object.freeze([
  ...STATS_FINAL_SYNC_STAGES,
  STATS_AUDIT_STAGE,
])

const initialResults = () => Object.fromEntries(
  STATS_UI_SYNC_STAGES.map(stage => [
    stage,
    {
      status: 'pending',
      result: null,
      error: null,
    },
  ])
)

export const buildStatsFinalSyncRetryResults = (current, auditResult) => {
  const affectedStages = new Set(
    (auditResult?.findings || [])
      .map(finding => STATS_STAGE_BY_AUDIT_TARGET[finding?.target])
      .filter(Boolean)
  )
  const next = { ...current }

  affectedStages.forEach(stage => {
    next[stage] = {
      ...(next[stage] || {}),
      status: 'needs_sync',
      error: null,
    }
  })

  next[STATS_AUDIT_STAGE] = {
    status: 'needs_sync',
    result: auditResult,
    error: null,
  }

  return next
}

export default function useStatsV2FinalSync({
  approvedState,
  onAuditClean,
} = {}) {
  const [results, setResults] = React.useState(initialResults)
  const [runningStage, setRunningStage] = React.useState('')
  const [receiptId, setReceiptId] = React.useState('')
  const [receiptClosed, setReceiptClosed] = React.useState(false)
  const [auditResult, setAuditResult] = React.useState(null)

  React.useEffect(() => {
    setResults(initialResults())
    setRunningStage('')
    setReceiptId('')
    setReceiptClosed(false)
    setAuditResult(null)
  }, [approvedState])

  const runStage = React.useCallback(async stage => {
    if (!approvedState || runningStage) return null

    setRunningStage(stage)

    try {
      let activeReceiptId = receiptId

      if (stage === STATS_FINAL_SYNC_STAGES[0]) {
        if (!activeReceiptId) {
          activeReceiptId = await createWriteActionReceiptV2({
            flowType: WRITE_ACTION_V2_FLOW_TYPE.STATS,
            label: 'טעינת סטטיסטיקות קבוצה',
            auditTarget: {
              birthTeamDocumentId: approvedState.identity?.birthTeamDocumentId,
              seasonKey: approvedState.identity?.seasonKey,
            },
          })
          setReceiptId(activeReceiptId)
        }

        try {
          const result = await runStatsFinalSyncStageV2({
            stage,
            approvedState,
          })

          await reportWriteActionCanonicalStatusV2({
            receiptId: activeReceiptId,
            canonicalStatus: WRITE_ACTION_V2_CANONICAL_STATUS.REPORTED,
          })

          setResults(current => ({
            ...current,
            [stage]: {
              status: 'completed',
              result,
              error: null,
            },
          }))
          return result
        } catch (error) {
          await reportWriteActionCanonicalStatusV2({
            receiptId: activeReceiptId,
            canonicalStatus: WRITE_ACTION_V2_CANONICAL_STATUS.FAILED_OR_UNKNOWN,
          }).catch(() => null)

          throw error
        }
      }

      if (stage === STATS_AUDIT_STAGE) {
        if (!activeReceiptId) {
          throw new Error('Missing Stats WriteAction V2 receipt')
        }

        const result = await auditStatsV2({
          birthTeamDocumentId: approvedState.identity?.birthTeamDocumentId,
          seasonKey: approvedState.identity?.seasonKey,
        })
        const findingsCount = result.findings?.length || 0
        const auditComplete = result.coverage?.complete === true

        await saveWriteActionAuditSummaryV2({
          receiptId: activeReceiptId,
          ranAt: new Date().toISOString(),
          coverage: auditComplete ? 'complete' : 'partial',
          findingsCount,
          checkedDomains: result.coverage?.coveredTargets || [],
        })

        if (auditComplete && findingsCount === 0) {
          await closeWriteActionReceiptV2({
            receiptId: activeReceiptId,
          })

          setReceiptClosed(true)
          onAuditClean?.()
        } else {
          setReceiptClosed(false)
        }

        setAuditResult(result)
        setResults(current => (
          auditComplete && findingsCount === 0
            ? {
                ...current,
                [stage]: {
                  status: 'completed',
                  result,
                  error: null,
                },
              }
            : buildStatsFinalSyncRetryResults(current, result)
        ))
        return result
      }

      const result = await runStatsFinalSyncStageV2({
        stage,
        approvedState,
      })

      setResults(current => ({
        ...current,
        [stage]: {
          status: 'completed',
          result,
          error: null,
        },
      }))
      return result
    } catch (error) {
      setResults(current => ({
        ...current,
        [stage]: {
          status: 'failed',
          result: null,
          error,
        },
      }))
      throw error
    } finally {
      setRunningStage('')
    }
  }, [
    approvedState,
    onAuditClean,
    receiptId,
    runningStage,
  ])

  return {
    stages: STATS_UI_SYNC_STAGES,
    results,
    runningStage,
    receiptId,
    receiptClosed,
    auditResult,
    runStage,
  }
}




