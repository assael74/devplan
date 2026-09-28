// src/features/playersDatabase/ui/pages/teamPage/stats/clear/hooks/useClearStatsFlow.js

import * as React from 'react'

import { buildClearStatsApprovedStateV2 } from '../../../../../../domain/statsV2/index.js'
import {
  executeClearStatsV2,
  prepareClearStatsForUiV2,
} from '../../../../../../services/writeV2/stats/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const INITIAL_STATE = 'idle'

export default function useClearStatsFlow({
  team,
  selectedSeasonOption,
  leagueId,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState(INITIAL_STATE)
  const [proposedPlan, setProposedPlan] = React.useState(null)
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState(null)

  const reset = React.useCallback(() => {
    setStatus(INITIAL_STATE)
    setProposedPlan(null)
    setResult(null)
    setError(null)
  }, [])

  const loadPreview = React.useCallback(async () => {
    const birthTeamDocumentId = clean(
      team?.birthTeamDocumentId ||
      team?.teamDocumentId ||
      team?.id
    )
    const seasonKey = clean(selectedSeasonOption?.seasonKey)
    const targetLeagueId = clean(selectedSeasonOption?.leagueId || leagueId)

    setStatus('loadingPreview')
    setProposedPlan(null)
    setResult(null)
    setError(null)

    try {
      const plan = await prepareClearStatsForUiV2({
        birthTeamDocumentId,
        seasonKey,
        leagueId: targetLeagueId,
      })

      setProposedPlan(plan)
      setStatus('ready')
    } catch (nextError) {
      setError(nextError)
      setStatus('failed')
    }
  }, [leagueId, selectedSeasonOption, team])

  const openModal = React.useCallback(() => {
    setOpen(true)
    loadPreview()
  }, [loadPreview])

  const close = React.useCallback(() => {
    if (status === 'executing') return
    setOpen(false)
    reset()
  }, [reset, status])

  const execute = React.useCallback(async () => {
    if (status !== 'ready' || !proposedPlan) return

    const noWork = (
      proposedPlan.isIdempotent === true &&
      Number(proposedPlan.projectionPlan?.impact?.operationsRequired || 0) === 0
    )
    if (noWork) return

    setStatus('executing')
    setError(null)

    try {
      const approvedState = buildClearStatsApprovedStateV2({
        proposedPlan,
        approvedAt: new Date().toISOString(),
      })
      const nextResult = await executeClearStatsV2({ approvedState })

      setResult(nextResult)
      setStatus('succeeded')
    } catch (nextError) {
      setError(nextError)
      setStatus('failed')
      return
    }

    try {
      await reload?.()
    } catch (reloadError) {
      setError(reloadError)
    }
  }, [proposedPlan, reload, status])

  const retry = React.useCallback(() => {
    loadPreview()
  }, [loadPreview])

  return {
    open,
    status,
    proposedPlan,
    result,
    error,
    openModal,
    close,
    execute,
    retry,
  }
}
