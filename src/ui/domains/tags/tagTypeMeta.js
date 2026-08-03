import { VIDEO_TAG_TYPE_BY_ID } from '../../../shared/video/index.js'

const safeId = value => String(value ?? '').trim()

export const TAG_TYPE_COLORS = Object.freeze({
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
})

export function getTagTypeMeta(tag) {
  const tagType = safeId(tag?.tagType)
  const typeMeta = VIDEO_TAG_TYPE_BY_ID[tagType] || null

  return {
    tagType,
    color: TAG_TYPE_COLORS[tagType] || '',
    iconId: typeMeta?.iconId || '',
    label: typeMeta?.label || tagType,
  }
}
