// src/features/videoHub/components/filters/hooks/useVideoFiltersController.js
import { useMemo, useCallback } from 'react'
import { safeId, safeStr } from './filters.utils'
import { getSortLabel } from '../filters.constants'

const DEFAULTS_ANALYSIS = {
  q: '',
  contextType: '',
  objectType: '',
  clubId: '',
  teamId: '',
  playerId: '',
  meetingId: '',
  ym: '',
  year: '',
  month: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',
  onlyUnlinked: false,
  tags: [],
}

const DEFAULTS_GENERAL = {
  q: '',
  source: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',
  tags: [],
}

export default function useVideoFiltersController({ tab, filters, onFilters, options }) {
  const setCascade = useCallback(
    (patch) => {
      onFilters((prev) => {
        const next = { ...prev, ...patch }

        // analysis-only cascades
        if (tab !== 'general') {
          if ('clubId' in patch) {
            next.teamId = ''
            next.playerId = ''
            next.meetingId = ''
          }
          if ('teamId' in patch) {
            next.playerId = ''
            next.meetingId = ''
          }
          if ('playerId' in patch) {
            next.meetingId = ''
          }

          // time logic for analysis only
          if ('ym' in patch && patch.ym) {
            next.year = ''
            next.month = ''
          }
          if (('year' in patch || 'month' in patch) && (patch.year || patch.month)) {
            next.ym = ''
          }
        }

        return next
      })
    },
    [onFilters, tab]
  )

  const clearAll = useCallback(() => {
    onFilters(() => (tab === 'general' ? { ...DEFAULTS_GENERAL } : { ...DEFAULTS_ANALYSIS }))
  }, [onFilters, tab])

  const activeChips = useMemo(() => {
    const { clubs, teamsAll, playersAll, meetingsAll } = options
    const tagLabelById = new Map((options?.tagOptions || []).map((t) => [safeId(t.id), safeStr(t.label)]))
    const sourceLabelById = new Map((options?.sourceOptions || []).map((s) => [safeId(s.id), safeStr(s.label)]))

    const chips = []
    const push = (key, label, value) => {
      if (!value) return
      chips.push({ key, label, value })
    }

    const tagsArr = Array.isArray(filters.tags) ? filters.tags : filters.tags ? [filters.tags] : []
    tagsArr
      .map((x) => safeStr(x).trim())
      .filter(Boolean)
      .forEach((tagId) => {
        const label = tagLabelById.get(safeId(tagId)) || tagId
        chips.push({ key: `tags:${tagId}`, label: 'תג', value: label })
      })

    push('q', 'חיפוש', safeStr(filters.q).trim())

    if (tab === 'general') {
      const src = safeStr(filters.source).trim()
      if (src) {
        push('source', 'סורס', sourceLabelById.get(safeId(src)) || src)
      }
      return chips
    }

    // analysis chips
    push('year', 'שנה', safeStr(filters.year))
    push('month', 'חודש', safeStr(filters.month))
    push('ym', 'חודש', safeStr(filters.ym))

    push(
      'clubId',
      'מועדון',
      clubs.find((c) => safeId(c.id) === safeId(filters.clubId))?.clubName || ''
    )
    push(
      'teamId',
      'קבוצה',
      teamsAll.find((t) => safeId(t.id) === safeId(filters.teamId))?.teamName || ''
    )
    push(
      'playerId',
      'שחקן',
      (() => {
        const p = playersAll.find((x) => safeId(x.id) === safeId(filters.playerId))
        return p ? [p.playerFirstName, p.playerLastName].filter(Boolean).join(' ') : ''
      })()
    )
    push(
      'meetingId',
      'פגישה',
      (() => {
        const m = meetingsAll.find((x) => safeId(x.id) === safeId(filters.meetingId))
        return m?.meetingDate || ''
      })()
    )

    if (filters.onlyUnlinked) chips.push({ key: 'onlyUnlinked', label: 'לא משויך', value: 'כן' })

    return chips
  }, [filters, options, tab])

  const removeChip = useCallback(
    (chipKey) => {
      if (chipKey === 'q') return setCascade({ q: '' })

      if (tab === 'general') {
        if (chipKey === 'source') return setCascade({ source: '' })
      } else {
        if (chipKey === 'ym') return setCascade({ ym: '' })
        if (chipKey === 'year') return setCascade({ year: '' })
        if (chipKey === 'month') return setCascade({ month: '' })
        if (chipKey === 'onlyUnlinked') return setCascade({ onlyUnlinked: false })
        if (chipKey === 'clubId') return setCascade({ clubId: '' })
        if (chipKey === 'teamId') return setCascade({ teamId: '' })
        if (chipKey === 'playerId') return setCascade({ playerId: '' })
        if (chipKey === 'meetingId') return setCascade({ meetingId: '' })
      }

      if (String(chipKey).startsWith('tags:')) {
        const val = String(chipKey).slice('tags:'.length)
        return setCascade({
          tags: (Array.isArray(filters.tags) ? filters.tags : filters.tags ? [filters.tags] : [])
            .map((x) => safeStr(x))
            .filter((x) => x && x !== val),
        })
      }
    },
    [setCascade, filters.tags, tab]
  )

  const sortLabel = useMemo(() => getSortLabel(filters.sortBy), [filters.sortBy])

  return { setCascade, clearAll, activeChips, removeChip, sortLabel }
}
