// src/features/tagsHub/logic/tags.logic.js

import {
  VIDEO_PRIMARY_CATEGORIES,
  VIDEO_SEED_TAGS,
  VIDEO_TAG_TYPES,
  VIDEO_TAG_TYPE_BY_ID,
} from '../../../shared/video/index.js'

const safeStr = value => String(value ?? '').trim()
const safeLower = value => safeStr(value).toLowerCase()

export const TAGS_SORT_OPTIONS = [
  {
    id: 'order',
    label: 'סדר ידני',
    idIcon: 'sort',
    defaultDirection: 'asc',
  },
  {
    id: 'name',
    label: 'שם תג',
    idIcon: 'tags',
    defaultDirection: 'asc',
  },
]

export const TAGS_DEFAULT_SORT = {
  by: 'order',
  direction: 'asc',
}

export function getTagsSortLabel(sortBy) {
  const opt = TAGS_SORT_OPTIONS.find(x => x.id === sortBy)
  return opt?.label || TAGS_SORT_OPTIONS[0].label
}

function sortByOrderThenName(list, sort = TAGS_DEFAULT_SORT) {
  const by = sort?.by || TAGS_DEFAULT_SORT.by
  const factor = sort?.direction === 'desc' ? -1 : 1

  return [...(Array.isArray(list) ? list : [])].sort((a, b) => {
    if (by === 'name') {
      return safeStr(a?.label || a?.tagName).localeCompare(
        safeStr(b?.label || b?.tagName),
        'he'
      ) * factor
    }

    const orderDiff = ((Number(a?.order) || 0) - (Number(b?.order) || 0)) * factor
    if (orderDiff !== 0) return orderDiff

    return safeStr(a?.label || a?.tagName).localeCompare(
      safeStr(b?.label || b?.tagName),
      'he'
    )
  })
}

export function normalizeTags() {
  const categories = VIDEO_PRIMARY_CATEGORIES.map(category => ({
    ...category,
    kind: 'category',
    label: category.label,
    issues: [],
  }))

  const types = VIDEO_TAG_TYPES.map(type => {
    const tags = VIDEO_SEED_TAGS
      .filter(tag => safeStr(tag.tagType) === type.id)
      .map(tag => ({
        ...tag,
        kind: 'tag',
        label: tag.tagName,
        type,
        issues: [],
      }))

    return {
      ...type,
      kind: 'type',
      label: type.label,
      tags,
      issues: tags.length ? [] : ['empty_type'],
    }
  })

  const invalidTags = VIDEO_SEED_TAGS
    .filter(tag => !VIDEO_TAG_TYPE_BY_ID[safeStr(tag.tagType)])
    .map(tag => ({
      ...tag,
      kind: 'tag',
      label: tag.tagName,
      issues: ['missing_type'],
    }))

  return {
    categories,
    types,
    invalidTags,
    stats: {
      categories: categories.length,
      types: types.length,
      tags: VIDEO_SEED_TAGS.length,
      invalidTags: invalidTags.length,
      emptyTypes: types.filter(type => type.tags.length === 0).length,
    },
  }
}

export function filterTags(model, uiFilters) {
  const f = uiFilters || {}
  const q = safeLower(f.q)
  const tagType = safeStr(f.tagType || 'all')

  const matches = item => {
    if (!q) return true

    return [
      item?.id,
      item?.label,
      item?.tagName,
      item?.slug,
      item?.tagType,
      item?.type?.label,
    ]
      .map(safeLower)
      .filter(Boolean)
      .some(value => value.includes(q))
  }

  const categories = (model?.categories || []).filter(matches)

  const types = (model?.types || [])
    .filter(type => tagType === 'all' || type.id === tagType)
    .map(type => ({
      ...type,
      tags: (type.tags || []).filter(tag => matches(tag) || matches(type)),
    }))
    .filter(type => matches(type) || type.tags.length > 0)

  const invalidTags = (model?.invalidTags || [])
    .filter(tag => tagType === 'all' || tag.tagType === tagType)
    .filter(matches)

  return {
    ...model,
    categories,
    types,
    invalidTags,
  }
}

export function buildTagsSections(model, opts = {}) {
  const sort = opts.sort || TAGS_DEFAULT_SORT
  const categories = sortByOrderThenName(model?.categories || [], sort)
  const types = sortByOrderThenName(model?.types || [], sort).map(type => ({
    ...type,
    tags: sortByOrderThenName(type.tags || [], sort),
  }))
  const invalidTags = sortByOrderThenName(model?.invalidTags || [], sort)

  return {
    stats: {
      categories: categories.length,
      types: types.length,
      tags: types.reduce((acc, type) => acc + (type.tags?.length || 0), 0),
      invalidTags: invalidTags.length,
      emptyTypes: types.filter(type => !type.tags?.length).length,
    },
    categories,
    types,
    invalidTags,
  }
}

export function buildEditMeta(tag) {
  return {
    readonly: true,
    source: 'shared/video',
    issues: Array.isArray(tag?.issues) ? tag.issues : [],
  }
}
