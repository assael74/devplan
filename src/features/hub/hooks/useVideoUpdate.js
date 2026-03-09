// features/hub/hooks/useVideoHubUpdate.js
import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function useVideoUpdate(active) {
  const analysisUpdate = useUpdateAction({
    routerEntityType: 'videoAnalysis',
    snackEntityType: 'video',
    id: active?.id,
    entityName: active?.name || active?.title || 'וידאו',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = analysisUpdate
    const videoId = meta?.videoId || active?.id
    const shouldCreate = Array.isArray(patch?.tagIds)

    return update.runUpdate(patch, {
      ...meta,
      id: videoId,
      videoId,
      createIfMissing: shouldCreate,
    })
  }

  return { run }
}
