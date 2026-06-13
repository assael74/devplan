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

const TAG_TYPE_COLORS = {
  formation: '#7C3AED',
  pitch_area: '#0891B2',
  game_principle: '#2563EB',
  action_technique: '#16A34A',
  situation: '#F97316',
  position_role: '#0F766E',
  mental: '#D97706',
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

    const tagById = new Map(
      (options?.tagOptions || []).map(tag => [
        safeId(tag.id),
        tag,
      ])
    )

    const sourceById = new Map(
      (options?.sourceOptions || []).map(source => [
        safeId(source.id),
        source,
      ])
    )

    const chips = []

    const push = (key, label, value, meta = {}) => {
      if (!value) return
      chips.push({ key, label, value, ...meta })
    }

    const selectedTagType = safeStr(filters.tagType).trim()
    const tagsArr = Array.isArray(filters.tags)
      ? filters.tags
      : filters.tags
      ? [filters.tags]
      : []

    if (!(tab === 'general' && selectedTagType)) {
      tagsArr
        .map(value => safeStr(value).trim())
        .filter(Boolean)
        .forEach(tagId => {
          const tag = tagById.get(safeId(tagId))
          const label = safeStr(tag?.label) || safeStr(tag?.tagName) || tagId

          chips.push({
            key: `tags:${tagId}`,
            label: '\u05ea\u05d2',
            value: label,
            iconId: tag?.iconId,
            color: tag?.color,
          })
        })
    }

    push('q', '\u05d7\u05d9\u05e4\u05d5\u05e9', safeStr(filters.q).trim())

    if (tab === 'general') {
      const categoryById = new Map(
        (options?.primaryCategoryOptions || []).map(category => [
          safeId(category.id),
          category,
        ])
      )

      const tagTypeById = new Map(
        (options?.tagTypeOptions || []).map(tagType => [
          safeId(tagType.id),
          tagType,
        ])
      )

      const statusById = new Map(
        (options?.statusOptions || []).map(status => [
          safeId(status.id),
          status,
        ])
      )

      const src = safeStr(filters.source).trim()
      if (src) {
        const source = sourceById.get(safeId(src))
        push('source', '\u05de\u05e7\u05d5\u05e8', safeStr(source?.label) || src, {
          iconId: source?.iconId || SOURCE_META[src]?.iconId || SOURCE_META.other.iconId,
          color: source?.color || SOURCE_META[src]?.color || SOURCE_META.other.color,
        })
      }

      const primaryCategoryId = safeStr(filters.primaryCategoryId).trim()
      if (primaryCategoryId) {
        const category = categoryById.get(safeId(primaryCategoryId))

        push(
          'primaryCategoryId',
          '\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4',
          safeStr(category?.label) || primaryCategoryId,
          {
            iconId: category?.iconId,
            tone: category?.tone,
            color: category?.color,
          }
        )
      }

      const tagType = selectedTagType
      if (tagType) {
        const tagTypeOption = tagTypeById.get(safeId(tagType))

        push(
          'tagType',
          '\u05e1\u05d5\u05d2 \u05ea\u05d2\u05d9\u05ea',
          safeStr(tagTypeOption?.label) || tagType,
          {
            iconId: tagTypeOption?.iconId,
            color: tagTypeOption?.color || TAG_TYPE_COLORS[tagType],
            compact: true,
          }
        )
      }

      const taggingStatus = safeStr(filters.taggingStatus).trim()
      if (taggingStatus) {
        const status = statusById.get(safeId(taggingStatus))

        push(
          'taggingStatus',
          '\u05e1\u05d8\u05d8\u05d5\u05e1 \u05d0\u05e4\u05d9\u05d5\u05df',
          safeStr(status?.label) || taggingStatus,
          {
            iconId: status?.iconId || STATUS_META[taggingStatus]?.iconId,
            color: status?.color || STATUS_META[taggingStatus]?.color,
          }
        )
      }

      if (filters.onlyWithoutCategory) {
        chips.push({
          key: 'onlyWithoutCategory',
          label: '\u05d7\u05e1\u05e8',
          value: '\u05dc\u05dc\u05d0 \u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4',
          iconId: 'warning',
          color: '#F97316',
        })
      }

      if (filters.onlyWithoutTags) {
        chips.push({
          key: 'onlyWithoutTags',
          label: '\u05d7\u05e1\u05e8',
          value: '\u05dc\u05dc\u05d0 \u05ea\u05d2\u05d9\u05d5\u05ea',
          iconId: 'tag',
          color: '#D97706',
        })
      }

      return chips
    }

    push('year', '\u05e9\u05e0\u05d4', safeStr(filters.year))
    push('month', '\u05d7\u05d5\u05d3\u05e9', safeStr(filters.month))
    push('ym', '\u05d7\u05d5\u05d3\u05e9', safeStr(filters.ym))

    push(
      'clubId',
      '\u05de\u05d5\u05e2\u05d3\u05d5\u05df',
      (clubs || []).find(club => safeId(club.id) === safeId(filters.clubId))?.clubName || ''
    )

    push(
      'teamId',
      '\u05e7\u05d1\u05d5\u05e6\u05d4',
      (teamsAll || []).find(team => safeId(team.id) === safeId(filters.teamId))?.teamName || ''
    )

    push(
      'playerId',
      '\u05e9\u05d7\u05e7\u05df',
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
      '\u05e4\u05d2\u05d9\u05e9\u05d4',
      (() => {
        const meeting = (meetingsAll || []).find(item =>
          safeId(item.id) === safeId(filters.meetingId)
        )

        return meeting?.meetingDate || ''
      })()
    )

    if (filters.onlyUnlinked) {
      chips.push({ key: 'onlyUnlinked', label: '\u05dc\u05d0 \u05de\u05e9\u05d5\u05d9\u05da', value: '\u05db\u05df' })
    }

    return chips
  }, [filters, options, tab])

  const removeChip = useCallback(
    chipKey => {
      if (chipKey === 'q') return setCascade({ q: '' })

      if (tab === 'general') {
        if (chipKey === 'source') return setCascade({ source: '' })
        if (chipKey === 'primaryCategoryId') return setCascade({ primaryCategoryId: '' })
        if (chipKey === 'tagType') return setCascade({ tagType: '', tags: [], tagIds: [] })
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
