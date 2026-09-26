// src/features/playersDatabase/ui/pages/teamPage/stats/import/hooks/useStatsV2FinalSync.js

import * as React from 'react'

import {
  STATS_FINAL_SYNC_STAGES,
  runStatsFinalSyncStageV2,
} from '../../../../../../services/writeV2/stats/index.js'

const initialResults = () => Object.fromEntries(
  STATS_FINAL_SYNC_STAGES.map(stage => [stage, { status: 'pending', result: null, error: null }])
)

export default function useStatsV2FinalSync({ approvedState, onCanonicalWritten } = {}) {
  const [results, setResults] = React.useState(initialResults)
  const [runningStage, setRunningStage] = React.useState('')

  React.useEffect(() => {
    setResults(initialResults())
    setRunningStage('')
  }, [approvedState])

  const runStage = React.useCallback(async stage => {
    if (!approvedState || runningStage) return null
    setRunningStage(stage)
    try {
      const result = await runStatsFinalSyncStageV2({ stage, approvedState })
      setResults(current => ({
        ...current,
        [stage]: { status: 'completed', result, error: null },
      }))
      if (stage === STATS_FINAL_SYNC_STAGES[0]) onCanonicalWritten?.()
      return result
    } catch (error) {
      setResults(current => ({
        ...current,
        [stage]: { status: 'failed', result: null, error },
      }))
      throw error
    } finally {
      setRunningStage('')
    }
  }, [approvedState, onCanonicalWritten, runningStage])

  return { stages: STATS_FINAL_SYNC_STAGES, results, runningStage, runStage }
}
