// playerProfile/sharedLogic/meetings/module/useMeetingsWorkspace.js

import { useEffect, useMemo, useState } from 'react'
import { normalizeMeetings } from './meetings.normalize.js'
import {
  applyMeetingsFilters,
  buildMeetingsFilterOptions,
  hasActiveMeetingsFilters,
} from './meetings.filters.js'

const initialFilters = {
  query: '',
  type: '',
  status: '',
  month: '',
  showCanceled: false,
}

function mergeFilters(prev, patch) {
  return {
    ...prev,
    ...(patch || {}),
  }
}

function buildIndicators(filters, filterOptions) {
  const out = []

  if (filters?.type) {
    const match = (filterOptions?.types || []).find(
      (item) => String(item.value) === String(filters.type)
    )

    out.push({
      key: 'type',
      value: filters.type,
      label: match?.label || 'סוג',
      idIcon: match?.idIcon || 'meetings',
    })
  }

  if (filters?.status) {
    const match = (filterOptions?.statuses || []).find(
      (item) => String(item.value) === String(filters.status)
    )

    out.push({
      key: 'status',
      value: filters.status,
      label: match?.label || 'סטטוס',
      idIcon: match?.idIcon || 'meetings',
    })
  }

  if (filters?.month) {
    const match = (filterOptions?.months || []).find(
      (item) => String(item.value) === String(filters.month)
    )

    out.push({
      key: 'month',
      value: filters.month,
      label: match?.label || filters.month,
      idIcon: 'calendar',
    })
  }

  if (filters?.query) {
    out.push({
      key: 'query',
      value: filters.query,
      label: `חיפוש: ${filters.query}`,
      idIcon: 'search',
    })
  }

  if (filters?.showCanceled) {
    out.push({
      key: 'showCanceled',
      value: true,
      label: 'כולל מבוטלות',
      idIcon: 'meetingCancel',
    })
  }

  return out
}

function getMeetingSortGroup(meeting) {
  const statusId = String(meeting?.statusId || '')
  const isCanceled = statusId === 'canceled'
  const isDone = statusId === 'done'
  const isUpcoming = !isCanceled && !isDone

  if (isUpcoming) return 1
  if (isDone) return 2
  return 3
}

function sortMeetingsForMobile(list) {
  const items = Array.isArray(list) ? [...list] : []

  items.sort((a, b) => {
    const groupA = getMeetingSortGroup(a)
    const groupB = getMeetingSortGroup(b)

    if (groupA !== groupB) return groupA - groupB

    const msA = Number.isFinite(a?.ms) ? a.ms : null
    const msB = Number.isFinite(b?.ms) ? b.ms : null

    if (groupA === 1) {
      if (msA == null && msB == null) return 0
      if (msA == null) return 1
      if (msB == null) return -1
      return msA - msB
    }

    if (msA == null && msB == null) return 0
    if (msA == null) return 1
    if (msB == null) return -1
    return msB - msA
  })

  return items
}

export default function useMeetingsWorkspace(player) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const [videoOpen, setVideoOpen] = useState(false)
  const [videoLink, setVideoLink] = useState('')
  const [videoName, setVideoName] = useState('וידאו')

  const [filters, setFilters] = useState(initialFilters)

  const rawMeetings = useMemo(() => {
    return Array.isArray(player?.meetings) ? player.meetings : []
  }, [player?.meetings])

  const meetings = useMemo(() => {
    return normalizeMeetings(rawMeetings)
  }, [rawMeetings])

  const filterOptions = useMemo(() => {
    return buildMeetingsFilterOptions(meetings)
  }, [meetings])

  const filtered = useMemo(() => {
    return applyMeetingsFilters(meetings, filters)
  }, [meetings, filters])

  const sortedMeetings = useMemo(() => {
    return sortMeetingsForMobile(filtered)
  }, [filtered])

  const hasActiveFilters = useMemo(() => {
    return hasActiveMeetingsFilters(filters)
  }, [filters])

  const indicators = useMemo(() => {
    return buildIndicators(filters, filterOptions)
  }, [filters, filterOptions])

  useEffect(() => {
    setFilters(initialFilters)
  }, [player?.id])

  useEffect(() => {
    if (!sortedMeetings.length) {
      setSelectedId(null)
      return
    }

    if (selectedId && sortedMeetings.some((m) => String(m.id) === String(selectedId))) {
      return
    }

    setSelectedId(sortedMeetings[0]?.id || null)
  }, [sortedMeetings, selectedId])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return sortedMeetings.find((m) => String(m.id) === String(selectedId)) || null
  }, [sortedMeetings, selectedId])

  const onChange = (patch) => {
    setFilters((prev) => mergeFilters(prev, patch))
  }

  const onReset = () => {
    setFilters(initialFilters)
  }

  const onClearFilter = (key) => {
    if (!key) return

    setFilters((prev) => ({
      ...prev,
      [key]: initialFilters?.[key],
    }))
  }

  const onAdd = () => {
    setEditItem(null)
    setDrawerOpen(true)
  }

  const onEdit = (m) => {
    setEditItem(m || null)
    setDrawerOpen(true)
  }

  const onOpenVideo = (m) => {
    const link = m?.videoId || m?.videoLink || ''
    if (!link) return

    setVideoLink(link)
    setVideoName(m?.typeLabel ? `וידאו — ${m.typeLabel}` : 'וידאו')
    setVideoOpen(true)
  }

  return {
    meetings,
    filters,
    filterOptions,
    filtered: sortedMeetings,
    indicators,
    hasActiveFilters,
    onChange,
    onReset,
    onClearFilter,

    selectedId,
    setSelectedId,
    selected,

    flatRightList: sortedMeetings,

    drawerOpen,
    setDrawerOpen,
    editItem,
    onAdd,
    onEdit,

    videoOpen,
    setVideoOpen,
    videoLink,
    videoName,
    onOpenVideo,
  }
}
