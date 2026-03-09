// src/features/hub/components/preview/previewDomainCard/domains/player/videos/PlayerVideosDomainModal.js
import React, { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/joy'
import { getMonthKey, getMonthLabel } from './playerVideos.domain.logic.js'

import VideoAnalysisCard from '../../../../../../../../ui/domains/video/videoAnalysis/VideoAnalysisCard.js'
import ListVideosToolbarRow from '../../../../../../../../ui/patterns/listVideosToolbar/ListVideosToolbarRow.js'
import StickySectionsByMonth from '../../../../../../../../ui/patterns/stickySections/StickySectionsByMonth.js'

import { enrichVideoAnalysisForPlayer } from '../../../../../../../../shared/videoAnalysis/videoAnalysis.enrich'

export default function PlayerVideosDomainModal({
  entity,
  context,
  videoActions,
  onClose,
}) {
  const player = entity

  const [query, setQuery] = useState('')
  const [sortId, setSortId] = useState('date_desc')

  const sortOptions = useMemo(() => ([
    { id: 'date_desc', label: 'תאריך · מהחדש לישן' },
    { id: 'date_asc', label: 'תאריך · מהישן לחדש' },
    { id: 'title_asc', label: 'שם · א-ת' },
  ]), [])

  const items = useMemo(
    () => (Array.isArray(player?.videos) ? player.videos : []),
    [player?.videos]
  )

  const tags = useMemo(() => {
    const t = context?.tags
    const t2 = context?.tagsArr
    return Array.isArray(t) ? t : Array.isArray(t2) ? t2 : []
  }, [context?.tags, context?.tagsArr])

  const actions = useMemo(() => {
    const v = videoActions || {}
    return {
      onWatch: typeof v.watch === 'function' ? v.watch : null,
      onEdit: typeof v.edit === 'function' ? v.edit : null,
      onLink: typeof v.link === 'function' ? v.link : null,
      onShare: typeof v.share === 'function' ? v.share : null,
    }
  }, [videoActions])

  const handoff = (fn, payload) => {
    if (!fn) return
    const snap = payload
    onClose?.()
    queueMicrotask(() => fn(snap))
  }

  const onEdit = (video) => handoff(actions.onEdit, { video, entity: player, context })
  const onLink = (video) => handoff(actions.onLink, { video, entity: player, context })

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    if (!q) return items
    return items.filter((v) => {
      const title = String(v?.title || v?.name || '').toLowerCase()
      return title.includes(q)
    })
  }, [items, query])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortId === 'title_asc') {
      arr.sort((a, b) => String(a?.title || a?.name || '').localeCompare(String(b?.title || b?.name || '')))
      return arr
    }
    const dir = sortId === 'date_asc' ? 1 : -1
    arr.sort((a, b) => {
      const da = new Date(a?.date || a?.videoDate || a?.createdAt || 0).getTime()
      const db = new Date(b?.date || b?.videoDate || b?.createdAt || 0).getTime()
      return (da - db) * dir
    })
    return arr
  }, [filtered, sortId])

  return (
    <Box sx={{ width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <ListVideosToolbarRow
        query={query}
        onQuery={setQuery}
        sortId={sortId}
        onSort={setSortId}
        sortOptions={sortOptions}
        tags={tags}
        context={context}
      />

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1, pt: 1 }}>
        {!sorted.length ? (
          <Typography level="body-sm" sx={{ opacity: 0.75 }}>
            אין קטעי וידאו לשחקן
          </Typography>
        ) : (
          <StickySectionsByMonth
            items={sorted}
            getMonthKey={getMonthKey}
            getMonthLabel={getMonthLabel}
            headerTop={0}
            gridSx={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              justifyContent: 'start',
            }}
            renderItem={(video) => {
              const videoEnriched = enrichVideoAnalysisForPlayer(video, player, context)
              return (
                <VideoAnalysisCard
                  key={video?.id}
                  video={videoEnriched}
                  preset="domainModal"
                  from="domainModal"
                  onWatch={actions.onWatch}
                  onEdit={onEdit}
                  onLink={onLink}
                  onShare={actions.onShare}
                  context={context}
                />
              )
            }}
          />
        )}
      </Box>
    </Box>
  )
}
