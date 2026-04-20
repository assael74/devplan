// ui/domains/video/videoAnalysis/desktop/sharedLogic/videoAssignment.utils.js

import { VIDEOANALYSIS_ASSIGNMENTS } from '../../../../../../shared/videoAnalysis/videoAnalysis.constants.js'

const safe = (value) => (value == null ? '' : String(value).trim())

const buildAssignmentKey = (objectType, contextType) => {
  const a = safe(objectType).toLowerCase()
  const b = safe(contextType).toLowerCase()
  return a && b ? `${a}:${b}` : ''
}

const ASSIGNMENTS_MAP = new Map(
  (Array.isArray(VIDEOANALYSIS_ASSIGNMENTS) ? VIDEOANALYSIS_ASSIGNMENTS : []).map((item) => [
    buildAssignmentKey(item?.objectType, item?.contextType),
    item,
  ])
)

export function getVideoAssignmentModel(video) {
  const key = buildAssignmentKey(video?.objectType, video?.contextType)
  return ASSIGNMENTS_MAP.get(key) || null
}

export function getVideoAssignmentId(video) {
  return getVideoAssignmentModel(video)?.id || ''
}

export function getVideoAssignmentIcon(video, fallback = 'videos') {
  return getVideoAssignmentModel(video)?.idIcon || fallback
}

export function getVideoAssignmentText(video, fallback = 'ללא שיוך') {
  const model = getVideoAssignmentModel(video)
  return model?.labelH || model?.label || fallback
}
