// playerProfile/sharedLogic/meetings/module/useMeetingsWorkspace.js

import { useEffect, useMemo, useState } from 'react'
import { meetingsInitialFilters } from '../../../../../../shared/meetings/filters/meetingsFilters.config.js'
import { normalizeMeetings } from './meetings.normalize.js'
import { applyMeetingsFilters } from './meetings.filters.js'
import { buildMeetingsBucketsLimited } from './meetings.buckets.js'

function mergeFilters(prev, patch) {
  return {
    ...prev,
    ...(patch || {}),
  }
}

export default function useMeetingsWorkspace(player) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const [videoOpen, setVideoOpen] = useState(false)
  const [videoLink, setVideoLink] = useState('')
  const [videoName, setVideoName] = useState('וידאו')

  const [filters, setFilters] = useState(meetingsInitialFilters)

  const rawMeetings = useMemo(() => {
    return Array.isArray(player?.meetings) ? player.meetings : []
  }, [player?.meetings])

  const meetings = useMemo(() => {
    return normalizeMeetings(rawMeetings)
  }, [rawMeetings])

  const filtered = useMemo(() => {
    return applyMeetingsFilters(meetings, filters)
  }, [meetings, filters])

  const buckets = useMemo(() => {
    return buildMeetingsBucketsLimited(filtered, { upcomingLimit: 2 })
  }, [filtered])

  useEffect(() => {
    setFilters(meetingsInitialFilters)
  }, [player?.id])

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null)
      return
    }

    if (selectedId && filtered.some((m) => String(m.id) === String(selectedId))) {
      return
    }

    if (buckets?.next?.id != null) {
      setSelectedId(buckets.next.id)
      return
    }

    setSelectedId(filtered[0]?.id || null)
  }, [filtered, selectedId, buckets])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return filtered.find((m) => String(m.id) === String(selectedId)) || null
  }, [filtered, selectedId])

  const flatRightList = useMemo(() => {
    const out = []

    if (buckets?.next) {
      out.push({ ...buckets.next, __bucket: 'next' })
    }

    for (const m of buckets?.upcoming || []) {
      out.push({ ...m, __bucket: 'upcoming' })
    }

    for (const m of buckets?.done || []) {
      out.push({ ...m, __bucket: 'done' })
    }

    for (const m of buckets?.canceled || []) {
      out.push({ ...m, __bucket: 'canceled' })
    }

    return out
  }, [buckets])

  const onChange = (patch) => {
    setFilters((prev) => mergeFilters(prev, patch))
  }

  const onReset = () => {
    setFilters(meetingsInitialFilters)
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
    filtered,
    onChange,
    onReset,

    selectedId,
    setSelectedId,
    selected,

    flatRightList,

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
