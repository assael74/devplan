// src/features/videoHub/components/filters/hooks/useVideoFilterOptions.js
import { useMemo } from 'react'
import { safeId, normalizeToArray, safeStr } from './filters.utils'
import { deriveSourceFromVideo } from '../../../videoHub.logic'

const toTagOption = (t) => {
  const id = safeId(t?.id)
  if (!id) return null
  return {
    id,
    label: safeStr(t?.tagName || t?.name || t?.slug || id),
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

export default function useVideoFilterOptions({ tab, context, filters, items }) {
  const clubs = context?.clubs || []
  const teamsAll = context?.teams || []
  const playersAll = context?.players || []
  const meetingsAll = context?.meetings || []
  const tagsAll = context?.tags || context?.analysisTags || context?.videoTags || []

  const arr = Array.isArray(items) ? items : []

  const teams = useMemo(() => {
    if (tab === 'general') return teamsAll
    if (!filters.clubId) return teamsAll
    return teamsAll.filter((t) => safeId(t.clubId) === safeId(filters.clubId))
  }, [tab, teamsAll, filters.clubId])

  const players = useMemo(() => {
    if (tab === 'general') return playersAll
    if (!filters.teamId) return playersAll
    return playersAll.filter((p) => safeId(p.teamId) === safeId(filters.teamId))
  }, [tab, playersAll, filters.teamId])

  const meetings = useMemo(() => {
    if (tab === 'general') return meetingsAll
    let out = meetingsAll
    if (filters.teamId) out = out.filter((m) => safeId(m.teamId) === safeId(filters.teamId))
    if (filters.playerId) {
      const pid = safeId(filters.playerId)
      out = out.filter((m) => normalizeToArray(m?.playerId).map(safeId).includes(pid))
    }
    return out
  }, [tab, meetingsAll, filters.teamId, filters.playerId])

  const tagOptions = useMemo(() => {
    const map = new Map()
    ;(Array.isArray(tagsAll) ? tagsAll : []).forEach((t) => {
      const opt = toTagOption(t)
      if (opt?.id) map.set(opt.id, opt)
    })

    const usedIds = new Set()
    arr.forEach((v) => {
      normalizeToArray(v?.tagIds).map(safeId).filter(Boolean).forEach((id) => usedIds.add(id))
    })

    const out = Array.from(usedIds)
      .map((id) => map.get(id) || { id, label: id, tagType: '', slug: '', isActive: true, raw: null })
      .filter(Boolean)

    out.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'he'))
    return out
  }, [tagsAll, arr])

  const sourceOptions = useMemo(() => {
    if (tab !== 'general') return []
    const set = new Set()
    arr.forEach((v) => set.add(deriveSourceFromVideo(v)))
    const out = Array.from(set)
      .filter(Boolean)
      .map((id) => ({ id, label: SOURCE_LABEL[id] || id }))
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
    sourceOptions,
    years: Array.isArray(years) ? years : [],
  }
}
