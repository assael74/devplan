// shared/tags/tags.constants.js
import { getEntityColors } from '../../ui/core/theme/Colors'

export const TAG_TYPE_OPTIONS = [
  { id: 'analysis', labelH: 'תג ניתוח וידאו', idIcon: 'videoAnalysis', color: getEntityColors('videoAnalysis').bg  },
  { id: 'general', labelH: 'תג וידאו כללי', idIcon: 'videoGeneral', color: getEntityColors('videoGeneral').bg },
]

export const TAG_PARENTS_OPTIONS = [
  { id: 'parents', labelH: 'תגים ראשיים', idIcon: 'parents'  },
  { id: 'children', labelH: 'תתי תג', idIcon: 'children' },
]
