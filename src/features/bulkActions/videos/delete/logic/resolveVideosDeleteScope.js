// src/features/bulkActions/videos/delete/logic/resolveVideosDeleteScope.js

const asArray = value => (Array.isArray(value) ? value : [])

const getVideoId = video => {
  return video?.id || video?.videoId || ''
}

export function resolveVideosDeleteScope(params = {}) {
  const {
    videos = [],
    selectedVideoIds = [],
  } = params

  const sourceVideos = asArray(videos)
  const selectedIds = new Set(
    asArray(selectedVideoIds).filter(Boolean)
  )

  return sourceVideos.filter(video => {
    const videoId = getVideoId(video)

    return videoId && selectedIds.has(videoId)
  })
}
