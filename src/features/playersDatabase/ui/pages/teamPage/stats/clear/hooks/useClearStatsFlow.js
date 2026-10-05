// src/features/playersDatabase/ui/pages/teamPage/stats/clear/hooks/useClearStatsFlow.js

import * as React from 'react'

import {
  clearStats,
  prepareStatsClear,
} from '../../../../../../services/write/stats/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const INITIAL_STATE = 'idle'

export default function useClearStatsFlow({
  team,
  selectedSeasonOption,
  leagueId,
}) {
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState(INITIAL_STATE)
  const [proposedPlan, setProposedPlan] = React.useState(null)
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [activeTarget, setActiveTarget] = React.useState(null)

  const buildTarget = React.useCallback(seasonOption => ({
    teamId: clean(
      team?.birthTeamDocumentId ||
      team?.teamDocumentId ||
      team?.id
    ),
    seasonId: clean(seasonOption?.seasonId),
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
      const plan = await prepareStatsClear({ input: target })

      setProposedPlan(plan)
      setStatus('ready')
    } catch (nextError) {
      setError(nextError)
      setStatus('failed')
    }
  }, [activeTarget, defaultTarget])

  const openModal = React.useCallback(seasonOption => {
    const requestedTarget = seasonOption?.seasonId
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
      const nextResult = await clearStats({
        approvedState: proposedPlan,
        display: {
          teamName: clean(team?.teamName || team?.name),
        },
      })

      setResult(nextResult)
      setStatus('succeeded')
    } catch (nextError) {
      setError(nextError)
      setStatus('failed')
      return
    }

  }, [proposedPlan, status, team])

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
