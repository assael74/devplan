import { normalizeTags } from '../../tags/tags.normalize.js'
import { buildTagsIndex } from '../../tags/tags.parenting.js'
import { VIDEO_INSIGHTS_DEFAULT_TAG_TYPE } from './videoInsights.constants.js'

const safe = (v) => (v == null ? '' : String(v))
const safeArr = (v) => (Array.isArray(v) ? v : [])
const norm = (v) => safe(v).trim().toLowerCase()

export const toPct = (part, total) => {
  const p = Number(part || 0)
  const t = Number(total || 0)
  if (!t) return 0
  return Math.round((p / t) * 100)
}

export const sortByLabelHe = (a, b) => safe(a?.label).localeCompare(safe(b?.label), 'he')

export const sortByTotalDescThenLabel = (a, b) => {
  const diff = Number(b?.total || 0) - Number(a?.total || 0)
  if (diff !== 0) return diff
  return sortByLabelHe(a, b)
}

export const getVideoType = (video) => {
  const assignmentType = norm(video?.assignmentType)
  const objectType = norm(video?.objectType)
  const contextType = norm(video?.contextType)

  if (assignmentType === 'meeting') return 'meeting'
  if (objectType === 'meeting') return 'meeting'
  if (contextType === 'meeting') return 'meeting'

  return 'analysis'
}

export const buildTagsByIdObject = (tags = []) => {
  const normalized = normalizeTags(tags)
  const map = buildTagsIndex(normalized)
  return Object.fromEntries(Array.from(map.entries()))
}

export const ensureVideoTagsFull = ({ video, tagsById = {}, tags = [] }) => {
  const tagsFull = safeArr(video?.tagsFull).filter(Boolean)
  if (tagsFull.length) return tagsFull

  const fallbackById =
    Object.keys(tagsById || {}).length
      ? tagsById
      : Object.fromEntries(normalizeTags(tags).map((t) => [String(t.id), t]))

  const tagIds = Array.isArray(video?.tagIds)
    ? video.tagIds
    : Array.isArray(video?.tags)
    ? video.tags
    : []

  return tagIds.map((id) => fallbackById[String(id)]).filter(Boolean)
}

export const getTagId = (tag) => safe(tag?.id || tag?.tagId || tag?.slug).trim()

export const getTagLabel = (tag) => safe(tag?.tagName || tag?.labelH || tag?.label || tag?.name).trim()

export const getTagKind = (tag) => norm(tag?.kind)

export const isCategoryTag = (tag, tagType = VIDEO_INSIGHTS_DEFAULT_TAG_TYPE) =>
  getTagKind(tag) === 'group' && (!tagType || safe(tag?.tagType).trim() === tagType)

export const isTopicTag = (tag, tagType = VIDEO_INSIGHTS_DEFAULT_TAG_TYPE) =>
  getTagKind(tag) === 'tag' && (!tagType || safe(tag?.tagType).trim() === tagType)

export const getTopicParentId = (tag) => safe(tag?.parentId).trim()

export const getTopicParentLabel = (tag, tagsById = {}) => {
  const parentId = getTopicParentId(tag)
  if (!parentId) return ''

  const parent = tagsById[parentId]
  return getTagLabel(parent) || safe(tag?.parentLabel).trim()
}

export const extractVideoTopicRelations = ({
  video,
  tagsById = {},
  tags = [],
  tagType = VIDEO_INSIGHTS_DEFAULT_TAG_TYPE,
}) => {
  const tagsFull = ensureVideoTagsFull({ video, tagsById, tags })

  const categoriesMap = new Map()
  const topicsMap = new Map()

  for (const rawTag of tagsFull) {
    if (isCategoryTag(rawTag, tagType)) {
      const id = getTagId(rawTag)
      if (!id) continue

      categoriesMap.set(id, {
        id,
        label: getTagLabel(rawTag) || 'קטגוריה',
        iconId: safe(rawTag?.iconId).trim(),
        color: safe(rawTag?.color).trim(),
      })
      continue
    }

    if (isTopicTag(rawTag, tagType)) {
      const id = getTagId(rawTag)
      if (!id) continue

      const parentId = getTopicParentId(rawTag)
      const parent = parentId ? tagsById[parentId] : null
      const parentLabel = getTagLabel(parent) || getTopicParentLabel(rawTag, tagsById)

      topicsMap.set(id, {
        id,
        label: getTagLabel(rawTag) || 'נושא',
        parentId,
        parentLabel,
        iconId: safe(rawTag?.iconId).trim(),
        color: safe(rawTag?.color).trim(),
      })

      if (parentId) {
        const parentColor = safe(parent?.color).trim()
        const parentIconId = safe(parent?.iconId).trim()

        if (!categoriesMap.has(parentId)) {
          categoriesMap.set(parentId, {
            id: parentId,
            label: parentLabel || 'קטגוריה',
            iconId: parentIconId,
            color: parentColor,
          })
        }
      }
    }
  }

  return {
    categories: Array.from(categoriesMap.values()),
    topics: Array.from(topicsMap.values()),
  }
}
