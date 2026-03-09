import { useEffect, useMemo, useState } from 'react'
import { useFilters } from '../../../../../../ui/patterns/filters/useFilters.js'
import { meetingsInitialFilters, meetingsFilterRules } from '../../../../../../shared/meetings/filters/meetingsFilters.config.js'
import { normalizeMeetings } from '../../../../../../shared/meetings/meetings.normalize.js'
import { buildMeetingsBucketsLimited } from '../logic/meetings.buckets.js'

export default function useMeetingsWorkspace(player) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const [videoOpen, setVideoOpen] = useState(false)
  const [videoLink, setVideoLink] = useState('')
  const [videoName, setVideoName] = useState('וידאו')

  const rawMeetings = useMemo(() => {
    return Array.isArray(player?.meetings) ? player.meetings : []
  }, [player?.meetings])

  const meetings = useMemo(() => normalizeMeetings(rawMeetings), [rawMeetings])

  const { filters, filtered, onChange, onReset } = useFilters(
    meetings,
    meetingsInitialFilters,
    meetingsFilterRules
  )

  const buckets = useMemo(
    () => buildMeetingsBucketsLimited(filtered, { upcomingLimit: 2 }),
    [filtered]
  )

  useEffect(() => {
    if (!filtered?.length) {
      setSelectedId(null)
      return
    }
    if (selectedId && filtered.some((m) => String(m.id) === String(selectedId))) return
    setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return filtered.find((m) => String(m.id) === String(selectedId)) || null
  }, [filtered, selectedId])

  const flatRightList = useMemo(() => {
    const out = []
    if (buckets?.next) out.push({ ...buckets.next, __bucket: 'next' })
    for (const m of buckets?.upcoming || []) out.push({ ...m, __bucket: 'upcoming' })
    for (const m of buckets?.done || []) out.push({ ...m, __bucket: 'done' })
    for (const m of buckets?.canceled || []) out.push({ ...m, __bucket: 'canceled' })
    return out
  }, [buckets])

  const onAdd = () => {
    setEditItem(null)
    setDrawerOpen(true)
  }

  const onEdit = (m) => {
    setEditItem(m)
    setDrawerOpen(true)
  }

  const onOpenVideo = (m) => {
    const link = m?.videoId || ''
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
