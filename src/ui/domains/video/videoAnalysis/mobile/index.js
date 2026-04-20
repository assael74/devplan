export { default as VideoAnalysisMobileCard } from './videoCard/VideoAnalysisMobileCard.js'
//export { default as VideoAnalysisMobileRow } from './videoRow/VideoAnalysisMobileRow.js'

export {
  getVideoAssignmentModel,
  getVideoAssignmentId,
  getVideoAssignmentIcon,
  getVideoAssignmentText,
} from './sharedLogic/videoAssignment.utils.js'

export {
  getVideoTitle,
  getVideoDateLabel,
  getVideoTagLabel,
  getVideoNotes,
  getVideoHasNotes,
  getVisibleVideoTags,
  getExtraVideoTagsCount,
} from './sharedLogic/videoDisplay.utils.js'

export {
  getVideoLink,
  getVideoThumb,
  getVideoPreview,
  getHasPlayableVideo,
} from './sharedLogic/videoMedia.utils.js'
