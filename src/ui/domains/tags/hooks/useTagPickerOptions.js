// ui/domains/tags/hooks/useTagPickerOptions.js

import { useMemo } from 'react'
import { VIDEO_TAG_TYPE_BY_ID } from '../../../../shared/video/index.js'

const safeId = value => String(value ?? '').trim()
const safeLabel = value => String(value ?? '').trim()

const PROFESSIONAL_VIDEO_TYPES = new Set([
  'formation',
  'pitch_area',
  'game_principle',
  'action_technique',
  'situation',
  'position_role',
  'mental',
])

const normalizeType = value => {
  const type = String(value ?? '').trim().toLowerCase()

  if (type === 'analysis' || type === 'general') return type

  if (type === 'videoanalysis' || type === 'analysisvideo') return 'analysis'
  if (type === 'videogeneral' || type === 'videageneral' || type === 'generalvideo') {
    return 'general'
  }

  if (
    type === 'videogeneralprofessional' ||
    type === 'professionalvideo' ||
    type === 'video_professional'
  ) {
    return 'videoGeneralProfessional'
  }

  if (PROFESSIONAL_VIDEO_TYPES.has(type)) return 'videoGeneralProfessional'

  return 'general'
}

function getProfessionalGroupName(tag) {
  const tagType = safeId(tag?.tagType)
  return VIDEO_TAG_TYPE_BY_ID[tagType]?.label || tagType || 'ללא סוג'
}

function buildLegacyBucket({ allOptions, selectedIds, scopeType }) {
  const scoped = allOptions.filter(tag => normalizeType(tag?.tagType) === scopeType)

  const tagsById = new Map()
  scoped.forEach(tag => {
    const id = safeId(tag?.id)
    if (id) tagsById.set(id, tag)
  })

  const ids = (Array.isArray(selectedIds) ? selectedIds : []).map(safeId).filter(Boolean)
  const selectedTags = ids.map(id => tagsById.get(id)).filter(Boolean)

  const groupsById = new Map()
  scoped.forEach(tag => {
    if (tag?.kind === 'group') {
      const id = safeId(tag?.id)
      if (!id) return
      groupsById.set(id, safeLabel(tag?.tagName || tag?.slug || 'קטגוריה'))
    }
  })

  const selectedSet = new Set(ids)

  const availableOptions = scoped
    .filter(tag => tag?.kind === 'tag')
    .filter(tag => !selectedSet.has(safeId(tag?.id)))
    .map(tag => ({
      ...tag,
      groupName: groupsById.get(safeId(tag?.parentId)) || 'ללא קטגוריה',
    }))

  return {
    scopedOptions: scoped,
    tagsById,
    selectedTags,
    groupsById,
    availableOptions,
  }
}

function buildProfessionalVideoBucket({ allOptions, selectedIds }) {
  const scoped = allOptions
    .filter(tag => PROFESSIONAL_VIDEO_TYPES.has(safeId(tag?.tagType)))
    .map(tag => ({
      ...tag,
      kind: 'tag',
      groupName: getProfessionalGroupName(tag),
    }))

  const tagsById = new Map()
  scoped.forEach(tag => {
    const id = safeId(tag?.id)
    if (id) tagsById.set(id, tag)
  })

  const ids = (Array.isArray(selectedIds) ? selectedIds : []).map(safeId).filter(Boolean)
  const selectedTags = ids.map(id => tagsById.get(id)).filter(Boolean)
  const selectedSet = new Set(ids)

  const availableOptions = scoped
    .filter(tag => !selectedSet.has(safeId(tag?.id)))
    .sort((a, b) => {
      const at = safeLabel(a?.groupName)
      const bt = safeLabel(b?.groupName)

      if (at !== bt) return at.localeCompare(bt, 'he')

      const ao = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0
      const bo = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0

      if (ao !== bo) return ao - bo

      return safeLabel(a?.tagName || a?.slug).localeCompare(
        safeLabel(b?.tagName || b?.slug),
        'he'
      )
    })

  return {
    scopedOptions: scoped,
    tagsById,
    selectedTags,
    groupsById: new Map(),
    availableOptions,
  }
}

export function useTagPickerOptions({ options, selectedIds }) {
  const allOptions = useMemo(() => (Array.isArray(options) ? options : []), [options])

  const buckets = useMemo(() => {
    return {
      analysis: buildProfessionalVideoBucket({
        allOptions,
        selectedIds,
      }),

      general: buildLegacyBucket({
        allOptions,
        selectedIds,
        scopeType: 'general',
      }),

      videoGeneralProfessional: buildProfessionalVideoBucket({
        allOptions,
        selectedIds,
      }),
    }
  }, [allOptions, selectedIds])

  return buckets
}
