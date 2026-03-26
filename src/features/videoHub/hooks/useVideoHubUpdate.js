import { useMemo } from 'react'
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
    routerEntityType: 'videos',
    snackEntityType: 'video',
    id: active?.id,
    entityName: active?.name || active?.title || 'וידאו',
    requireAnyUpdated: true,
  })

  const pending = !!analysisUpdate?.pending || !!generalUpdate?.pending

  const run = (type, patch, meta = {}) => {
    const normalizedType = type === 'analysis' ? 'analysis' : 'general'
    const update = normalizedType === 'analysis' ? analysisUpdate : generalUpdate
    const videoId = meta?.videoId || active?.id

    return update.runUpdate(patch, {
      ...meta,
      id: videoId,
      videoId,
      createIfMissing: meta?.createIfMissing === true,
    })
  }

  return {
    run,
    pending,
  }
}
