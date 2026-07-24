// src/features/videoHub/hooks/useVideoHubData.js

import { useMemo } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider.js'

import { buildVideoHubContext } from '../logic/videoHub.context.js'
import { enrichVideoAnalysis } from '../logic/videoHub.logic.js'

const EMPTY_ARRAY = []

export default function useVideoHubData() {
  const core = useCoreData()

  const baseContext = useMemo(() => buildVideoHubContext(core), [core])
  const analysisRaw = core?.videoAnalysis || EMPTY_ARRAY
  const generalRaw = core?.videos || EMPTY_ARRAY

  const analysisEnriched = useMemo(() => {
    return enrichVideoAnalysis(analysisRaw, baseContext)
  }, [analysisRaw, baseContext])

  const context = useMemo(() => ({
    ...baseContext,
    videoAnalysis: analysisEnriched,
    videos: generalRaw,
  }), [baseContext, analysisEnriched, generalRaw])

  return {
    analysisRaw,
    analysisEnriched,
    generalRaw,
    context,
    loading: core?.sourceStatus
      ? ['videos', 'videoAnalysis'].some((key) => core.sourceStatus[key] === false)
      : Boolean(core?.loading),
    error: core?.sourceErrors?.videos ||
      core?.sourceErrors?.videoAnalysis ||
      core?.error ||
      null,
  }
}
