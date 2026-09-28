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
  const [activeTarget, setActiveTarget] = React.useState(null)

  const buildTarget = React.useCallback(seasonOption => ({
    birthTeamDocumentId: clean(
      team?.birthTeamDocumentId ||
      team?.teamDocumentId ||
      team?.id
    ),
    seasonKey: clean(seasonOption?.seasonKey),
    leagueId: clean(seasonOption?.leagueId || leagueId),
  }), [leagueId, team])

  const defaultTarget = React.useMemo(
    () => buildTarget(selectedSeasonOption),
    [buildTarget, selectedSeasonOption]
  )

  const reset = React.useCallback(() => {
    setStatus(INITIAL_STATE)
    setProposedPlan(null)
    setResult(null)
    setError(null)
    setActiveTarget(null)
  }, [])

  const loadPreview = React.useCallback(async requestedTarget => {
    const target = requestedTarget || activeTarget || defaultTarget

    setStatus('loadingPreview')
    setProposedPlan(null)
    setResult(null)
    setError(null)

    try {
      const plan = await prepareClearStatsForUiV2(target)

      setProposedPlan(plan)
      setStatus('ready')
    } catch (nextError) {
      setError(nextError)
      setStatus('failed')
    }
  }, [activeTarget, defaultTarget])

  const openModal = React.useCallback(seasonOption => {
    const requestedTarget = seasonOption?.seasonKey
      ? buildTarget(seasonOption)
      : defaultTarget

    setActiveTarget(requestedTarget)
    setOpen(true)
    loadPreview(requestedTarget)
  }, [buildTarget, defaultTarget, loadPreview])

  const close = React.useCallback(() => {
    if (status === 'executing') return
    setOpen(false)
    reset()
  }, [reset, status])

  const execute = React.useCallback(async () => {
    if (status !== 'ready' || !proposedPlan) return

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
    loadPreview(activeTarget || defaultTarget)
  }, [activeTarget, defaultTarget, loadPreview])

  return {
    open,
    status,
    proposedPlan,
    result,
    error,
    target: activeTarget || defaultTarget,
    openModal,
    close,
    execute,
    retry,
  }
}
