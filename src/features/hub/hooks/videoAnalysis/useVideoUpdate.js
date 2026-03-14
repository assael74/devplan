// features/hub/hooks/videoAnalysis/useVideoHubUpdate.js

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'

export function useVideoUpdate(active, fallbackId = '') {
  const resolvedId = fallbackId || active?.id || ''

  const analysisUpdate = useUpdateAction({
    routerEntityType: 'videoAnalysis',
    snackEntityType: 'video',
    id: resolvedId,
    entityName: active?.name || active?.title || 'וידאו',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = analysisUpdate
    const videoId = meta?.videoId || resolvedId
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
