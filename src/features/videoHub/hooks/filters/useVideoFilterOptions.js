// videoHub/components/filters/hooks/useVideoFilterOptions.js

import { useMemo } from 'react'

import { safeId, normalizeToArray, safeStr } from './filters.utils'
import { deriveSourceFromVideo } from '../../logic/videoHub.logic'
import {
  buildVideoGeneralFilterOptions,
} from '../../sharedLogic/videoHubGeneralFilters.logic.js'

const toTagOption = t => {
  const id = safeId(t?.id)
  if (!id) return null

  return {
    id,
    label: safeStr(t?.tagName || t?.name || t?.label || t?.slug || id),
    tagType: safeStr(t?.tagType || ''),
    slug: safeStr(t?.slug || ''),
    isActive: t?.isActive !== false,
    raw: t,
  }
}

const SOURCE_LABEL = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  vimeo: 'Vimeo',
  drive: 'Google Drive',
  other: 'אחר',
}

const EMPTY_ARRAY = []

export default function useVideoFilterOptions({ tab, context, filters, items }) {
  const clubs = context?.clubs || EMPTY_ARRAY
  const teamsAll = context?.teams || EMPTY_ARRAY
  const playersAll = context?.players || EMPTY_ARRAY
  const meetingsAll = context?.meetings || EMPTY_ARRAY
  const tagsAll = context?.tags || context?.analysisTags || context?.videoTags || EMPTY_ARRAY

  const arr = Array.isArray(items) ? items : EMPTY_ARRAY

  const professionalGeneralOptions = useMemo(() => {
    if (tab !== 'general') return null
    return buildVideoGeneralFilterOptions(arr)
  }, [tab, arr])

  const teams = useMemo(() => {
    if (tab === 'general') return teamsAll
    if (!filters.clubId) return teamsAll
    return teamsAll.filter(t => safeId(t.clubId) === safeId(filters.clubId))
  }, [tab, teamsAll, filters.clubId])

  const players = useMemo(() => {
    if (tab === 'general') return playersAll
    if (!filters.teamId) return playersAll
    return playersAll.filter(p => safeId(p.teamId) === safeId(filters.teamId))
  }, [tab, playersAll, filters.teamId])

  const meetings = useMemo(() => {
    if (tab === 'general') return meetingsAll

    let out = meetingsAll

    if (filters.teamId) {
      out = out.filter(m => safeId(m.teamId) === safeId(filters.teamId))
    }

    if (filters.playerId) {
      const pid = safeId(filters.playerId)
      out = out.filter(m => normalizeToArray(m?.playerId).map(safeId).includes(pid))
    }

    return out
  }, [tab, meetingsAll, filters.teamId, filters.playerId])

  const tagOptions = useMemo(() => {
    if (tab === 'general') {
      return professionalGeneralOptions?.tagOptions || []
    }

    const map = new Map()

    ;(Array.isArray(tagsAll) ? tagsAll : []).forEach(t => {
      const opt = toTagOption(t)
      if (opt?.id) map.set(opt.id, opt)
    })

    const usedIds = new Set()

    arr.forEach(v => {
      normalizeToArray(v?.tagIds)
        .map(safeId)
        .filter(Boolean)
        .forEach(id => usedIds.add(id))
    })

    const out = Array.from(usedIds)
      .map(id => map.get(id) || {
        id,
        label: id,
        tagType: '',
        slug: '',
        isActive: true,
        raw: null,
      })
      .filter(Boolean)

    out.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'he'))

    return out
  }, [tab, tagsAll, arr, professionalGeneralOptions])

  const tagTypeOptions = useMemo(() => {
    if (tab !== 'general') return []
    return professionalGeneralOptions?.tagTypeOptions || []
  }, [tab, professionalGeneralOptions])

  const primaryCategoryOptions = useMemo(() => {
    if (tab !== 'general') return []
    return professionalGeneralOptions?.primaryCategoryOptions || []
  }, [tab, professionalGeneralOptions])

  const statusOptions = useMemo(() => {
    if (tab !== 'general') return []
    return professionalGeneralOptions?.statusOptions || []
  }, [tab, professionalGeneralOptions])

  const sortOptions = useMemo(() => {
    if (tab !== 'general') return []
    return professionalGeneralOptions?.sortOptions || []
  }, [tab, professionalGeneralOptions])

  const sourceOptions = useMemo(() => {
    if (tab !== 'general') return []

    const set = new Set()

    arr.forEach(v => set.add(deriveSourceFromVideo(v)))

    const out = Array.from(set)
      .filter(Boolean)
      .map(id => ({ id, label: SOURCE_LABEL[id] || id }))

    out.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'he'))

    return out
  }, [tab, arr])

  const years = useMemo(() => [], [])

  return {
    clubs,
    teamsAll,
    playersAll,
    meetingsAll,
    teams,
    players,
    meetings,

    tagOptions,
    tagTypeOptions,
    primaryCategoryOptions,
    statusOptions,
    sortOptions,
    sourceOptions,

    years: Array.isArray(years) ? years : [],
  }
}
