// playerProfile/sharedLogic/meetings/module/meetings.filters.js

import { toKey } from './meetings.utils.js'
import { MEETING_TYPES, MEETING_STATUSES } from '../../../../../../shared/meetings/meetings.constants.js'

function buildCountMap(items, getter) {
  const map = {}

  for (const item of items || []) {
    const value = getter(item)
    const key = toKey(value)
    if (!key) continue

    if (!map[key]) {
      map[key] = {
        value,
        count: 0,
      }
    }

    map[key].count += 1
  }

  return map
}

function mapToOptions(map, getLabel) {
  return Object.values(map)
    .sort((a, b) => String(getLabel(a.value)).localeCompare(String(getLabel(b.value)), 'he'))
    .map((item) => ({
      value: item.value,
      label: getLabel(item.value),
      count: item.count,
    }))
}

function buildFixedOptions(baseItems, countMap, getValue, getLabel) {
  return (baseItems || []).map((item) => {
    const value = getValue(item)
    const key = toKey(value)

    return {
      value,
      label: getLabel(item),
      count: countMap[key]?.count || 0,
      idIcon: item?.idIcon || '',
      disabled: Boolean(item?.disabled),
    }
  })
}

export function applyMeetingsFilters(list, filters) {
  const items = Array.isArray(list) ? list : []
  const f = filters || {}

  const typeKey = toKey(f.type)
  const statusKey = toKey(f.status)
  const monthKey = toKey(f.month)
  const queryKey = toKey(f.query)
  const showCanceled = Boolean(f.showCanceled)

  return items.filter((m) => {
    const meetingStatusKey = toKey(m?.statusId)

    if (!showCanceled && meetingStatusKey === 'canceled') return false
    if (typeKey && toKey(m?.typeId || m?.type) !== typeKey) return false
    if (statusKey && meetingStatusKey !== statusKey) return false
    if (monthKey && toKey(m?.monthKey) !== monthKey) return false

    if (queryKey) {
      const blob = [
        m?.typeLabel,
        m?.statusLabel,
        m?.notes,
        m?.meetingDate,
        m?.meetingHour,
        m?.timeLabel,
      ]
        .filter(Boolean)
        .join(' ')

      if (!toKey(blob).includes(queryKey)) return false
    }

    return true
  })
}

export function buildMeetingsFilterOptions(list) {
  const items = Array.isArray(list) ? list : []

  const typeMap = buildCountMap(items, (m) => m?.typeId || m?.type)
  const statusMap = buildCountMap(items, (m) => m?.statusId)
  const monthMap = buildCountMap(items, (m) => m?.monthKey)

  return {
    types: buildFixedOptions(
      MEETING_TYPES,
      typeMap,
      (item) => item.id,
      (item) => item.labelH
    ),

    statuses: buildFixedOptions(
      MEETING_STATUSES,
      statusMap,
      (item) => item.id,
      (item) => item.labelH
    ),

    months: mapToOptions(monthMap, (value) => String(value || '')),
  }
}

export function hasActiveMeetingsFilters(filters) {
  return Boolean(
    filters?.type ||
      filters?.status ||
      filters?.month ||
      filters?.query ||
      filters?.showCanceled
  )
}
