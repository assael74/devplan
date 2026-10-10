// src/features/playersDatabase/ui/pages/teamPage/stats/import/hooks/useStatsLoadExecution.js

import * as React from 'react'

import { getWriteActionReceipt } from '../../../../../../services/write/receipt/index.js'
import { repairWriteActionReceipt } from '../../../../../../services/write/recovery/index.js'
import { loadStats } from '../../../../../../services/write/stats/index.js'
import {
  applyStatsSyncProgressEvent,
  buildStatsSyncStages,
  resolveStatsRetryMode,
} from '../logic/statsSyncProgress.model.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const initialState = () => ({
  status: 'idle',
  result: null,
  error: null,
})

const auditIsClean = result => (
  result?.audit?.coverage?.complete === true &&
  (result?.audit?.findings?.length || 0) === 0 &&
  result?.status === 'closed' &&
  result?.executionStatus === 'succeeded'
)

export default function useStatsLoadExecution({
  approvedState = null,
  actionInput = null,
  display = {},
  teamSeasons = [],
  prepareFreshApprovedState,
} = {}) {
  const [state, setState] = React.useState(initialState)
  const [receiptId, setReceiptId] = React.useState('')
  const [executionReceipt, setExecutionReceipt] = React.useState(null)
  const [activeApprovedState, setActiveApprovedState] = React.useState(approvedState)
  const runningRef = React.useRef(false)

  React.useEffect(() => {
    setState(actionInput && approvedState
      ? { status: 'ready', result: null, error: null }
      : initialState())
    setReceiptId('')
    setExecutionReceipt(null)
    setActiveApprovedState(approvedState)
    runningRef.current = false
  }, [actionInput, approvedState])

  const run = React.useCallback(async ({ retry = false } = {}) => {
    if (!actionInput || !activeApprovedState || runningRef.current) return null
    runningRef.current = true
    setState(current => ({ ...current, status: 'writing', error: null }))

    try {
      let executionState = activeApprovedState
      let result
      if (retry && receiptId) {
        const receipt = await getWriteActionReceipt({ receiptId })
        setExecutionReceipt(receipt)
        if (clean(receipt?.canonicalOutcome) === 'confirmed') {
          setExecutionReceipt(current => applyStatsSyncProgressEvent({
            receipt: current,
            event: { type: 'repairStarted', receiptId },
          }))
          result = await repairWriteActionReceipt({ receiptId })
        } else {
          executionState = await prepareFreshApprovedState?.()
          if (!executionState) throw new Error('לא ניתן לבנות Approved State חדש לטעינת הסטטיסטיקות')
          setActiveApprovedState(executionState)
        }
      }
      if (!result) {
        result = await loadStats({
          approvedState: executionState,
          receiptId,
          display,
          onProgress: event => {
            setReceiptId(clean(event?.receiptId))
            setExecutionReceipt(current => applyStatsSyncProgressEvent({
              receipt: current,
              event,
            }))
          },
        })
      }
      if (result.receiptId) setReceiptId(result.receiptId)
      try {
        setExecutionReceipt(await getWriteActionReceipt({ receiptId: result.receiptId }))
      } catch {
        setExecutionReceipt(current => ({
          ...current,
          id: result.receiptId,
          status: result.status,
          executionStatus: result.executionStatus,
          recoveryRequired: Boolean(result.recoveryRequired),
        }))
      }
      setState({
        status: auditIsClean(result) ? 'success' : 'audit_failed',
        result,
        error: null,
      })
      return result
    } catch (error) {
      const failedReceiptId = clean(error?.receiptId) || receiptId
      if (failedReceiptId) {
        setReceiptId(failedReceiptId)
        try {
          setExecutionReceipt(await getWriteActionReceipt({ receiptId: failedReceiptId }))
        } catch {
          setExecutionReceipt(current => current)
        }
      }
      setState({ status: 'failed', result: null, error })
      return null
    } finally {
      runningRef.current = false
    }
  }, [actionInput, activeApprovedState, display, prepareFreshApprovedState, receiptId])

  const expectedTeamSeasonId = clean(activeApprovedState?.teamSeasonDocumentId)
  const expectedUpdatedAt = clean(
    activeApprovedState?.canonicalTeamSeason?.stats?.statsLoadState?.updatedAt
  )
  const observedTeamSeason = teamSeasons.find(teamSeason => (
    clean(teamSeason?.identity?.teamSeasonDocumentId || teamSeason?.id) === expectedTeamSeasonId
  ))
  const observedUpdatedAt = clean(observedTeamSeason?.stats?.statsLoadState?.updatedAt)
  const listenerConfirmed = Boolean(
    expectedTeamSeasonId && expectedUpdatedAt && observedUpdatedAt === expectedUpdatedAt
  )
  const result = state.result
  const executionStatus = state.status
  const syncStages = buildStatsSyncStages({
    receipt: executionReceipt,
    busy: executionStatus === 'writing',
  })
  const receiptClosed = result?.status === 'closed' && result?.executionStatus === 'succeeded'
  return {
    status: state.status,
    error: state.error,
    result,
    receiptId: result?.receiptId || receiptId,
    executionReceipt,
    executionStatus,
    executionError: state.error?.message || '',
    retryMode: resolveStatsRetryMode(executionReceipt),
    syncStages,
    receiptClosed,
    auditResult: result?.audit || null,
    running: state.status === 'writing',
    listenerConfirmed,
    syncComplete: state.status === 'success' && receiptClosed && listenerConfirmed,
    execute: () => run(),
    retry: () => run({ retry: true }),
  }
}
