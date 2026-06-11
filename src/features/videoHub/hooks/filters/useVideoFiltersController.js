// videoHub/components/filters/hooks/useVideoFiltersController.js

import { useMemo, useCallback } from 'react'
import { safeId, safeStr } from './filters.utils'
import { getSortLabel } from '../../logic/filters.constants'
import { getSortOptionLabel } from '../../../../ui/patterns/sort/sort.utils.js'

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
  primaryCategoryId: '',
  categoryIds: [],
  tagIds: [],
  tagType: '',
  taggingStatus: '',
  onlyWithoutCategory: false,
  onlyWithoutTags: false,
  sortBy: 'needs_tagging_first',
  sortDir: 'desc',
  tags: [],
}

export default function useVideoFiltersController({
  tab,
  filters,
  onFilters,
  options,
}) {
  const setCascade = useCallback(
    patch => {
      onFilters(prev => {
        const next = { ...prev, ...patch }

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
    onFilters(() => (tab === 'general'
      ? { ...DEFAULTS_GENERAL }
      : { ...DEFAULTS_ANALYSIS }
    ))
  }, [onFilters, tab])

  const activeChips = useMemo(() => {
    const { clubs, teamsAll, playersAll, meetingsAll } = options || {}

    const tagLabelById = new Map(
      (options?.tagOptions || []).map(tag => [
        safeId(tag.id),
        safeStr(tag.label),
      ])
    )

    const sourceLabelById = new Map(
      (options?.sourceOptions || []).map(source => [
        safeId(source.id),
        safeStr(source.label),
      ])
    )

    const chips = []

    const push = (key, label, value) => {
      if (!value) return
      chips.push({ key, label, value })
    }

    const tagsArr = Array.isArray(filters.tags)
      ? filters.tags
      : filters.tags
      ? [filters.tags]
      : []

    tagsArr
      .map(value => safeStr(value).trim())
      .filter(Boolean)
      .forEach(tagId => {
        const label = tagLabelById.get(safeId(tagId)) || tagId
        chips.push({ key: `tags:${tagId}`, label: 'תג', value: label })
      })

    push('q', 'חיפוש', safeStr(filters.q).trim())

    if (tab === 'general') {
      const categoryLabelById = new Map(
        (options?.primaryCategoryOptions || []).map(category => [
          safeId(category.id),
          safeStr(category.label),
        ])
      )

      const tagTypeLabelById = new Map(
        (options?.tagTypeOptions || []).map(tagType => [
          safeId(tagType.id),
          safeStr(tagType.label),
        ])
      )

      const statusLabelById = new Map(
        (options?.statusOptions || []).map(status => [
          safeId(status.id),
          safeStr(status.label),
        ])
      )

      const src = safeStr(filters.source).trim()
      if (src) {
        push('source', 'מקור', sourceLabelById.get(safeId(src)) || src)
      }

      const primaryCategoryId = safeStr(filters.primaryCategoryId).trim()
      if (primaryCategoryId) {
        push(
          'primaryCategoryId',
          'קטגוריה',
          categoryLabelById.get(safeId(primaryCategoryId)) || primaryCategoryId
        )
      }

      const tagType = safeStr(filters.tagType).trim()
      if (tagType) {
        push(
          'tagType',
          'סוג תגית',
          tagTypeLabelById.get(safeId(tagType)) || tagType
        )
      }

      const taggingStatus = safeStr(filters.taggingStatus).trim()
      if (taggingStatus) {
        push(
          'taggingStatus',
          'סטטוס אפיון',
          statusLabelById.get(safeId(taggingStatus)) || taggingStatus
        )
      }

      if (filters.onlyWithoutCategory) {
        chips.push({
          key: 'onlyWithoutCategory',
          label: 'חסר',
          value: 'ללא קטגוריה',
        })
      }

      if (filters.onlyWithoutTags) {
        chips.push({
          key: 'onlyWithoutTags',
          label: 'חסר',
          value: 'ללא תגיות',
        })
      }

      return chips
    }

    push('year', 'שנה', safeStr(filters.year))
    push('month', 'חודש', safeStr(filters.month))
    push('ym', 'חודש', safeStr(filters.ym))

    push(
      'clubId',
      'מועדון',
      (clubs || []).find(club => safeId(club.id) === safeId(filters.clubId))?.clubName || ''
    )

    push(
      'teamId',
      'קבוצה',
      (teamsAll || []).find(team => safeId(team.id) === safeId(filters.teamId))?.teamName || ''
    )

    push(
      'playerId',
      'שחקן',
      (() => {
        const player = (playersAll || []).find(item =>
          safeId(item.id) === safeId(filters.playerId)
        )

        return player
          ? [player.playerFirstName, player.playerLastName].filter(Boolean).join(' ')
          : ''
      })()
    )

    push(
      'meetingId',
      'פגישה',
      (() => {
        const meeting = (meetingsAll || []).find(item =>
          safeId(item.id) === safeId(filters.meetingId)
        )

        return meeting?.meetingDate || ''
      })()
    )

    if (filters.onlyUnlinked) {
      chips.push({ key: 'onlyUnlinked', label: 'לא משויך', value: 'כן' })
    }

    return chips
  }, [filters, options, tab])

  const removeChip = useCallback(
    chipKey => {
      if (chipKey === 'q') return setCascade({ q: '' })

      if (tab === 'general') {
        if (chipKey === 'source') return setCascade({ source: '' })
        if (chipKey === 'primaryCategoryId') return setCascade({ primaryCategoryId: '' })
        if (chipKey === 'tagType') return setCascade({ tagType: '' })
        if (chipKey === 'taggingStatus') return setCascade({ taggingStatus: '' })

        if (chipKey === 'onlyWithoutCategory') {
          return setCascade({ onlyWithoutCategory: false })
        }

        if (chipKey === 'onlyWithoutTags') {
          return setCascade({ onlyWithoutTags: false })
        }
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

        const nextTags = (Array.isArray(filters.tags) ? filters.tags : filters.tags ? [filters.tags] : [])
          .map(item => safeStr(item))
          .filter(item => item && item !== val)

        return setCascade({
          tags: nextTags,
          tagIds: nextTags,
        })
      }

      return null
    },
    [setCascade, filters.tags, tab]
  )

  const sortLabel = useMemo(() => {
    const optionLabel = getSortOptionLabel(
      options?.sortOptions || [],
      filters.sortBy,
      ''
    )

    return optionLabel || getSortLabel(filters.sortBy)
  }, [filters.sortBy, options?.sortOptions])

  return {
    setCascade,
    clearAll,
    activeChips,
    removeChip,
    sortLabel,
  }
}
