// ui/domains/video/videoAnalysis/mobile/sharedLogic/videoMedia.utils.js

import { getDriveThumbUrl, getDrivePreviewUrl } from '../../../../../../shared/media/driveLinks.js'

const safe = (value) => (value == null ? '' : String(value).trim())

export function getVideoLink(video) {
  return safe(video?.link || video?.videoLink || video?.url || video?.videoUrl)
}

export function getVideoThumb(video) {
  const link = getVideoLink(video)
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

export function getVideoPreview(video) {
  const link = getVideoLink(video)
  return getDrivePreviewUrl(link)
}

export function getHasPlayableVideo(video) {
  return !!getVideoPreview(video)
}
