// src/ui/video/sharedLogic/videoCard.model.js

import { getDrivePreviewUrl, getDriveThumbUrl } from '../../../../../shared/media/driveLinks.js'
import {
  getVideoTaggingStatusLabel,
  normalizeVideoForUi,
  VIDEO_SEED_TAG_BY_ID,
  VIDEO_TAG_TYPE_BY_ID,
  VIDEO_TAGGING_STATUS,
} from '../../../../../shared/video/index.js'
import { VIDEOANALYSIS_ASSIGNMENTS } from '../../../../../shared/videoAnalysis/videoAnalysis.constants.js'

export const VIDEO_CARD_TAG_TYPE_COLORS = {
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
}

const safeArr = value => (Array.isArray(value) ? value : value ? [value] : [])
const safeStr = value => String(value ?? '').trim()

const buildAssignmentKey = (objectType, contextType) => {
  const a = safeStr(objectType).toLowerCase()
  const b = safeStr(contextType).toLowerCase()

  return a && b ? `${a}:${b}` : ''
}

const ASSIGNMENTS_MAP = new Map(
  safeArr(VIDEOANALYSIS_ASSIGNMENTS).map(item => [
    buildAssignmentKey(item?.objectType, item?.contextType),
    item,
  ])
)

function getFromMapOrObject(bucket, key) {
  if (!bucket || !key) return null
  if (typeof bucket.get === 'function') return bucket.get(key) || null
  if (typeof bucket === 'object') return bucket[key] || null

  return null
}

export function getVideoCardTagLabel(tag, fallback = 'תג') {
  return safeStr(tag?.tagName || tag?.name || tag?.label || tag || fallback)
}

export function getVideoCardLink(video) {
  return safeStr(video?.videoUrl || video?.videoLink || video?.link || video?.url)
}

export function getVideoCardThumb(video) {
  if (video?.thumbnailUrl) return video.thumbnailUrl

  const base = getDriveThumbUrl(getVideoCardLink(video))
  if (!base) return ''

  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

export function getVideoCardPreview(video) {
  return getDrivePreviewUrl(getVideoCardLink(video))
}

export function getVideoCardTitle(video, fallback = 'קטע וידאו') {
  return safeStr(video?.title || video?.name || fallback)
}

export function getVideoCardDescription(video) {
  return safeStr(video?.description || video?.notes || '')
}

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

export function resolveVideoCardTagRecords(video, tagsById) {
  const fullTags = safeArr(video?.tagsFull)
    .map(tag => {
      const seedTag = VIDEO_SEED_TAG_BY_ID[safeStr(tag?.id)]
      return seedTag ? { ...tag, ...seedTag } : tag
    })
    .filter(tag => safeStr(tag?.id) || getVideoCardTagLabel(tag))

  if (fullTags.length) return fullTags

  const tagIds = safeArr(video?.tagIds || video?.tags)
    .map(safeStr)
    .filter(Boolean)

  return tagIds
    .map(id => VIDEO_SEED_TAG_BY_ID[id] || getFromMapOrObject(tagsById, id) || { id, tagName: id })
    .filter(tag => getVideoCardTagLabel(tag))
}

export function resolveVideoCardTagTypes(tagRecords) {
  const seen = new Set()

  return safeArr(tagRecords)
    .map(tag => VIDEO_TAG_TYPE_BY_ID[safeStr(tag?.tagType)] || null)
    .filter(Boolean)
    .filter(tagType => {
      if (seen.has(tagType.id)) return false

      seen.add(tagType.id)
      return true
    })
}

function formatDate(value) {
  if (!value) return ''

  const ms =
    typeof value === 'number'
      ? value
      : value?.seconds
      ? value.seconds * 1000
      : typeof value?.toMillis === 'function'
      ? value.toMillis()
      : Number(value)

  if (!Number.isFinite(ms) || !ms) return ''

  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(ms))
  } catch {
    return ''
  }
}

function formatYmToHebrewLabel(value) {
  const raw = safeStr(value)
  if (!raw) return ''

  const normalized = raw.replace('/', '-').replace('_', '-').trim()

  let year = ''
  let month = ''

  if (/^\d{4}-\d{1,2}$/.test(normalized)) {
    const parts = normalized.split('-')
    year = parts[0]
    month = parts[1]
  } else if (/^\d{1,2}-\d{4}$/.test(normalized)) {
    const parts = normalized.split('-')
    month = parts[0]
    year = parts[1]
  } else if (/^\d{6}$/.test(normalized)) {
    year = normalized.slice(0, 4)
    month = normalized.slice(4, 6)
  } else {
    return raw
  }

  const monthNumber = Number(month)

  if (!year || !Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return raw
  }

  const monthNames = [
    '',
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ]

  return `${monthNames[monthNumber]} ${year}`
}

export function getVideoCardDateLabel(video, fallback = '—') {
  const monthLabel = safeStr(video?.monthLabel)
  if (monthLabel) return monthLabel

  const ymLabel = formatYmToHebrewLabel(video?.ym)
  if (ymLabel) return ymLabel

  return formatDate(video?.updatedAt || video?.createdAt) || fallback
}

export function buildVideoCardModel({
  video,
  tagsById,
  tagLimit = 3,
  tagTypeLimit = 2,
}) {
  const vm = normalizeVideoForUi(video)
  const tagRecords = resolveVideoCardTagRecords(vm, tagsById)
  const tagTypes = resolveVideoCardTagTypes(tagRecords)
  const tagLabels = tagRecords.map(getVideoCardTagLabel).filter(Boolean)

  const visibleTags = tagRecords.slice(0, tagLimit)
  const visibleTagLabels = tagLabels.slice(0, tagLimit)
  const visibleTagTypes = tagTypes.slice(0, tagTypeLimit)

  const preview = getVideoCardPreview(vm)
  const thumb = getVideoCardThumb(vm)

  const isMissing = vm.taggingStatus === VIDEO_TAGGING_STATUS.NEEDS_TAGGING
  const isPartial = vm.taggingStatus === VIDEO_TAGGING_STATUS.PARTIAL

  return {
    vm,
    title: getVideoCardTitle(vm),
    description: getVideoCardDescription(vm),
    assignment: getVideoAssignmentModel(vm),
    assignmentId: getVideoAssignmentId(vm),
    assignmentIcon: getVideoAssignmentIcon(vm),
    assignmentText: getVideoAssignmentText(vm),
    tagRecords,
    tagLabels,
    tagTypes,
    visibleTags,
    visibleTagLabels,
    visibleTagTypes,
    hiddenTagsCount: Math.max(tagRecords.length - visibleTags.length, 0),
    hiddenTagTypesCount: Math.max(tagTypes.length - visibleTagTypes.length, 0),
    thumb,
    preview,
    canPreview: Boolean(preview),
    statusLabel: getVideoTaggingStatusLabel(vm.taggingStatus),
    isMissing,
    isPartial,
    primaryCategory: vm.primaryCategory || null,
    dateLabel: getVideoCardDateLabel(vm),
    updatedLabel: formatDate(vm.updatedAt || vm.createdAt),
  }
}
