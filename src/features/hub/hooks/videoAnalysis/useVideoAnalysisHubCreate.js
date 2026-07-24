// src/features/hub/hooks/videoAnalysis/useVideoAnalysisHubCreate.js

import {
  resolveStaticEntityType,
  resolveVideoAnalysisCreateName,
  useHubCreateAction,
} from '../shared/index.js'

const resolveVideoAnalysisType = resolveStaticEntityType('videoAnalysis')

export default function useVideoAnalysisHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolveVideoAnalysisType,
    notificationEntityType: 'videoAnalysis',
    resolveEntityName: resolveVideoAnalysisCreateName,
  })

  return {
    saving,
    runCreateVideoAnalysis: runCreate,
  }
}
