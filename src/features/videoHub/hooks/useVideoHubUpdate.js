import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function useVideoHubUpdate(active) {
  const analysisUpdate = useUpdateAction({
    routerEntityType: 'videoAnalysis',
    snackEntityType: 'video',
    id: active?.id,
    entityName: active?.name || active?.title || 'וידאו',
    requireAnyUpdated: true,
  })

  const generalUpdate = useUpdateAction({
    routerEntityType: 'videoGeneral',
    snackEntityType: 'video',
    id: active?.id,
    entityName: active?.name || active?.title || 'וידאו',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = type === 'analysis' ? analysisUpdate : generalUpdate
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
