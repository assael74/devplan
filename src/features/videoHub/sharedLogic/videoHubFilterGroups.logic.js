// src/features/videoHub/sharedLogic/videoHubFilterGroups.logic.js

const safeArr = value => (Array.isArray(value) ? value : [])
const safeStr = value => String(value ?? '').trim()

const toOption = item => ({
  value: safeStr(item?.id || item?.value),
  label: safeStr(item?.label || item?.labelH || item?.tagName || item?.name || item?.id),
  disabled: item?.disabled === true,
})

const cleanOptions = options =>
  safeArr(options)
    .map(toOption)
    .filter(option => option.value && option.label)

export function buildVideoGeneralDrawerFilters(filters = {}) {
  const missingTagging = []

  if (filters.onlyWithoutCategory) {
    missingTagging.push('without_category')
  }

  if (filters.onlyWithoutTags) {
    missingTagging.push('without_tags')
  }

  return {
    source: safeStr(filters.source),
    primaryCategoryId: safeStr(filters.primaryCategoryId),
    tagType: safeStr(filters.tagType),
    taggingStatus: safeStr(filters.taggingStatus),
    tags: safeArr(filters.tags || filters.tagIds).map(safeStr).filter(Boolean),
    missingTagging,
  }
}

export function hasVideoGeneralDrawerFilters(filters = {}) {
  return Boolean(
    safeStr(filters.source) ||
      safeStr(filters.primaryCategoryId) ||
      safeStr(filters.tagType) ||
      safeStr(filters.taggingStatus) ||
      safeArr(filters.tags).length ||
      safeArr(filters.missingTagging).length
  )
}

export function normalizeVideoGeneralDrawerFilterChange(key, value) {
  if (key === 'missingTagging') {
    const values = safeArr(value).map(safeStr)

    return {
      onlyWithoutCategory: values.includes('without_category'),
      onlyWithoutTags: values.includes('without_tags'),
    }
  }

  if (key === 'tags') {
    return {
      tags: safeArr(value).map(safeStr).filter(Boolean),
      tagIds: safeArr(value).map(safeStr).filter(Boolean),
    }
  }

  return {
    [key]: value === 'all' ? '' : value || '',
  }
}

export function buildVideoGeneralFilterGroups(options = {}) {
  return [
    {
      key: 'source',
      title: 'מקור',
      multi: false,
      options: cleanOptions(options.sourceOptions),
    },
    {
      key: 'primaryCategoryId',
      title: 'קטגוריה ראשית',
      multi: false,
      options: cleanOptions(options.primaryCategoryOptions),
    },
    {
      key: 'taggingStatus',
      title: 'סטטוס אפיון',
      multi: false,
      options: cleanOptions(options.statusOptions),
    },
    {
      key: 'tagType',
      title: 'סוג תגית',
      multi: false,
      options: cleanOptions(options.tagTypeOptions),
    },
    {
      key: 'tags',
      title: 'תגיות',
      multi: true,
      options: cleanOptions(options.tagOptions),
    },
    {
      key: 'missingTagging',
      title: 'חוסרים באפיון',
      multi: true,
      options: [
        { value: 'without_category', label: 'ללא קטגוריה' },
        { value: 'without_tags', label: 'ללא תגיות' },
      ],
    },
  ].filter(group => group.options.length > 0)
}
