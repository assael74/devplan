// src/features/videoHub/sharedLogic/videoHubFilterGroups.logic.js

const safeArr = value => (Array.isArray(value) ? value : [])
const safeStr = value => String(value ?? '').trim()

const TAG_TYPE_COLORS = {
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
}

const TAG_TYPE_ICONS = {
  formation: 'formation',
  pitch_area: 'pitchArea',
  game_principle: 'gamePrinciple',
  action_technique: 'technique',
  situation: 'situation',
  position_role: 'positionRole',
  mental: 'mental',
}

const STATUS_META = {
  needs_tagging: {
    iconId: 'warning',
    color: '#F59E0B',
  },
  partial: {
    iconId: 'loading',
    color: '#D97706',
  },
  tagged: {
    iconId: 'check',
    color: '#16A34A',
  },
}

const SOURCE_META = {
  youtube: {
    iconId: 'videos',
    color: '#DC2626',
  },
  instagram: {
    iconId: 'videos',
    color: '#C13584',
  },
  tiktok: {
    iconId: 'videos',
    color: '#111827',
  },
  vimeo: {
    iconId: 'videos',
    color: '#2563EB',
  },
  drive: {
    iconId: 'videos',
    color: '#16A34A',
  },
  other: {
    iconId: 'tag',
    color: '#64748B',
  },
}

const MISSING_META = {
  without_category: {
    iconId: 'warning',
    color: '#F97316',
  },
  without_tags: {
    iconId: 'tag',
    color: '#D97706',
  },
}

const toOption = item => {
  const value = safeStr(item?.id || item?.value)
  const tagType = safeStr(item?.tagType)

  return {
    value,
    label: safeStr(item?.label || item?.labelH || item?.tagName || item?.name || item?.id),
    disabled: item?.disabled === true,
    iconId: safeStr(item?.iconId) || TAG_TYPE_ICONS[tagType] || '',
    tone: safeStr(item?.tone),
    color: safeStr(item?.color) || TAG_TYPE_COLORS[tagType] || '',
    tagType,
  }
}

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

export function normalizeVideoGeneralDrawerFilterChange(key, value, options = {}) {
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

  if (key === 'tagType') {
    const tagType = value === 'all' ? '' : safeStr(value)
    const tagIds = tagType
      ? safeArr(options.tagOptions)
          .filter(option => safeStr(option?.tagType) === tagType)
          .map(option => safeStr(option?.id || option?.value))
          .filter(Boolean)
      : []

    return {
      tagType,
      tags: tagIds,
      tagIds,
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
      options: cleanOptions(options.sourceOptions).map(option => ({
        ...option,
        ...(SOURCE_META[option.value] || SOURCE_META.other),
      })),
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
      options: cleanOptions(options.statusOptions).map(option => ({
        ...option,
        ...(STATUS_META[option.value] || {}),
      })),
    },
    {
      key: 'tagType',
      title: 'סוג תגית',
      multi: false,
      options: cleanOptions(options.tagTypeOptions).map(option => ({
        ...option,
        color: option.color || TAG_TYPE_COLORS[option.value] || '',
      })),
    },
    {
      key: 'tags',
      title: 'תגיות',
      multi: true,
      options: cleanOptions(options.tagOptions).map(option => {
        const tagType = safeStr(option.tagType)

        return {
          ...option,
          color: option.color || TAG_TYPE_COLORS[tagType] || '',
          iconId: option.iconId || TAG_TYPE_ICONS[tagType] || '',
        }
      }),
    },
    {
      key: 'missingTagging',
      title: 'חוסרים באפיון',
      multi: true,
      options: [
        { value: 'without_category', label: 'ללא קטגוריה', ...MISSING_META.without_category },
        { value: 'without_tags', label: 'ללא תגיות', ...MISSING_META.without_tags },
      ],
    },
  ].filter(group => group.options.length > 0)
}
