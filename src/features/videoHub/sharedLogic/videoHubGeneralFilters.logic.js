// src/features/videoHub/sharedLogic/videoHubGeneralFilters.logic.js

import {
  VIDEO_PRIMARY_CATEGORIES,
  VIDEO_SEED_TAGS,
  VIDEO_TAG_TYPES,
  getVideoPrimaryCategory,
  normalizeVideoForUi,
  resolveVideoTaggingStatus,
} from '../../../shared/video/index.js'

const safeStr = value => String(value ?? '').trim()
const safeLower = value => safeStr(value).toLowerCase()
const safeArr = value => (Array.isArray(value) ? value : value ? [value] : [])

export const VIDEO_GENERAL_DEFAULT_FILTERS = {
  q: '',
  source: '',
  primaryCategoryId: '',
  categoryIds: [],
  tagIds: [],
  tagType: '',
  taggingStatus: '',
  onlyWithoutCategory: false,
  onlyWithoutTags: false,
  sortBy: 'needs_tagging_first',
  sortDir: 'desc',
}

export const VIDEO_GENERAL_SORT_OPTIONS = [
  { id: 'needs_tagging_first', label: 'דורש אפיון תחילה' },
  { id: 'updated_desc', label: 'עודכן לאחרונה' },
  { id: 'created_desc', label: 'נוצר לאחרונה' },
  { id: 'title_asc', label: 'שם' },
]

export const VIDEO_TAGGING_STATUS_OPTIONS = [
  { id: 'needs_tagging', label: 'דורש אפיון' },
  { id: 'partial', label: 'אפיון חלקי' },
  { id: 'tagged', label: 'מאופיין' },
]

export function buildVideoSeedTagById() {
  return new Map(VIDEO_SEED_TAGS.map(tag => [safeStr(tag.id), tag]))
}

export function getVideoTagLabel(tag) {
  return safeStr(tag?.tagName || tag?.name || tag?.label || tag)
}

export function resolveVideoTagIds(video = {}) {
  return safeArr(video.tagIds || video.tags || video.videoTagIds || video.videoTags)
    .map(safeStr)
    .filter(Boolean)
}

export function resolveVideoTagObjects(video = {}, tagsById = buildVideoSeedTagById()) {
  return resolveVideoTagIds(video)
    .map(id => tagsById.get(id) || null)
    .filter(Boolean)
}

export function buildVideoGeneralFilterOptions(items = []) {
  const arr = Array.isArray(items) ? items : []
  const usedSourceIds = new Set()
  const usedTagIds = new Set()
  const seedTagsById = buildVideoSeedTagById()

  for (const rawVideo of arr) {
    const video = normalizeVideoForUi(rawVideo)

    if (video.source || video.sourceType) {
      usedSourceIds.add(safeStr(video.sourceType || video.source))
    }

    for (const tagId of resolveVideoTagIds(video)) {
      usedTagIds.add(tagId)
    }
  }

  const tagOptions = Array.from(usedTagIds)
    .map(id => seedTagsById.get(id) || null)
    .filter(Boolean)
    .sort((a, b) => {
      const typeA = safeStr(a.tagType)
      const typeB = safeStr(b.tagType)
      if (typeA !== typeB) return typeA.localeCompare(typeB, 'he')
      return Number(a.order || 0) - Number(b.order || 0)
    })

  return {
    primaryCategoryOptions: VIDEO_PRIMARY_CATEGORIES,
    tagTypeOptions: VIDEO_TAG_TYPES,
    tagOptions,
    statusOptions: VIDEO_TAGGING_STATUS_OPTIONS,
    sortOptions: VIDEO_GENERAL_SORT_OPTIONS,
  }
}

export function buildVideoSearchText(video = {}, tagsById = buildVideoSeedTagById()) {
  const vm = normalizeVideoForUi(video)
  const primaryCategory = getVideoPrimaryCategory(vm.primaryCategoryId)
  const tags = resolveVideoTagObjects(vm, tagsById)

  return [
    vm.title,
    vm.name,
    vm.description,
    vm.notes,
    vm.comment,
    vm.link,
    vm.videoUrl,
    vm.source,
    vm.sourceType,
    primaryCategory?.label,
    ...safeArr(vm.categoryIds),
    ...tags.map(getVideoTagLabel),
    ...tags.map(tag => tag.slug),
    ...tags.map(tag => tag.tagType),
  ]
    .filter(Boolean)
    .join(' ')
}

export function matchVideoGeneralFilters(video = {}, filters = {}) {
  const vm = normalizeVideoForUi(video)
  const f = { ...VIDEO_GENERAL_DEFAULT_FILTERS, ...(filters || {}) }
  const tagsById = buildVideoSeedTagById()

  const query = safeLower(f.q)
  if (query) {
    const searchText = safeLower(buildVideoSearchText(vm, tagsById))
    if (!searchText.includes(query)) return false
  }

  const status = resolveVideoTaggingStatus(vm)

  if (safeStr(f.taggingStatus) && status !== safeStr(f.taggingStatus)) {
    return false
  }

  if (f.onlyWithoutCategory && vm.primaryCategoryId) {
    return false
  }

  if (f.onlyWithoutTags && resolveVideoTagIds(vm).length > 0) {
    return false
  }

  if (safeStr(f.primaryCategoryId) && vm.primaryCategoryId !== safeStr(f.primaryCategoryId)) {
    return false
  }

  const selectedCategoryIds = safeArr(f.categoryIds).map(safeStr).filter(Boolean)
  if (selectedCategoryIds.length) {
    const categorySet = new Set(safeArr(vm.categoryIds).map(safeStr))
    if (!selectedCategoryIds.every(id => categorySet.has(id))) return false
  }

  const selectedTagType = safeStr(f.tagType)
  const selectedTagIds = safeArr(f.tagIds || f.tags).map(safeStr).filter(Boolean)
  if (selectedTagIds.length && !selectedTagType) {
    const tagSet = new Set(resolveVideoTagIds(vm))
    if (!selectedTagIds.every(id => tagSet.has(id))) return false
  }

  if (selectedTagType) {
    const tags = resolveVideoTagObjects(vm, tagsById)
    if (!tags.some(tag => safeStr(tag.tagType) === selectedTagType)) return false
  }

  return true
}

export function filterVideoGeneralByProfessionalModel(items = [], filters = {}) {
  return (Array.isArray(items) ? items : []).filter(video =>
    matchVideoGeneralFilters(video, filters)
  )
}
