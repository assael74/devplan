// C:\projects\devplan\src\features\hub\teamProfile\modules\videos\TeamVideosModule.js
import React, { useMemo, useCallback } from 'react'
import { Box, Typography, Sheet, Chip } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { iconUi } from '../../../../../ui/core/icons/iconUi'
import VideoAnalysisCard from '../../../../../ui/domains/video/videoAnalysis/VideoAnalysisCard.js'
import ListVideosToolbarRow from '../../../../../ui/patterns/listVideosToolbar/ListVideosToolbarRow.js'
import StickySectionsByMonth from '../../../../../ui/patterns/stickySections/StickySectionsByMonth.js'
import { enrichVideoAnalysisForTeam } from '../../../../../shared/videoAnalysis/videoAnalysis.enrich.js'

import { vidModuleSx } from './videos.sx'
import { resolveTeamVideosDomain, getMonthKey, getMonthLabel } from './teamVideos.domain.logic.js'

const asArr = (v) => (Array.isArray(v) ? v : [])

export default function TeamVideosModule({ entity, context, videoActions }) {
  const team = entity || null

  const [query, setQuery] = React.useState('')
  const [sortId, setSortId] = React.useState('date_desc')

  const sortOptions = [
    { id: 'date_desc', label: 'תאריך · מהחדש לישן' },
    { id: 'date_asc', label: 'תאריך · מהישן לחדש' },
    { id: 'title_asc', label: 'שם · א-ת' },
  ]

  const tags = useMemo(() => {
    const a = asArr(context?.tags)
    if (a.length) return a
    const b = asArr(context?.tagsArr)
    if (b.length) return b
    return []
  }, [context?.tags, context?.tagsArr])

  const { summary, videos, state } = useMemo(
    () => resolveTeamVideosDomain(team, {}, { tags }),
    [team, tags]
  )

  const items = (videos || []).map((row) => row?.video || row)

  const filtered = items.filter((v) => {
    if (!query) return true
    const t = `${v?.title || v?.name || ''}`.toLowerCase()
    return t.includes(query.toLowerCase())
  })

  const actions = useMemo(() => {
    const v = videoActions || context?.videoActions || {}
    return {
      onWatch: typeof v.watch === 'function' ? v.watch : null,
      onEdit: typeof v.edit === 'function' ? v.edit : null,
      onLink: typeof v.link === 'function' ? v.link : null,
      onShare: typeof v.share === 'function' ? v.share : null,
    }
  }, [videoActions, context?.videoActions])

  const handleWatch = useCallback((video) => actions.onWatch && actions.onWatch(video), [actions.onWatch])
  const handleShare = useCallback((video) => actions.onShare && actions.onShare(video), [actions.onShare])

  const handleEdit = useCallback(
    (video) => actions.onEdit && actions.onEdit({ video, entity: team, context }),
    [actions.onEdit, team, context]
  )

  const handleLink = useCallback(
    (video) => actions.onLink && actions.onLink({ video, entity: team, context }),
    [actions.onLink, team, context]
  )

  const hasVideos = (summary?.totalVideos || 0) > 0

  if (!hasVideos && state !== 'PARTIAL') {
    return (
      <SectionPanel>
        <EmptyState title="אין וידאו" desc="לא נמצאו נתוני וידאו לקבוצה" />
      </SectionPanel>
    )
  }

  const topTags = Array.isArray(summary?.topTagsAll) ? summary.topTagsAll : []

  return (
    <SectionPanel>
      <Box sx={vidModuleSx.root}>
        <Sheet {...vidModuleSx.statsPanel}>
          <Box sx={vidModuleSx.statsHeaderRow}>
            <Box sx={vidModuleSx.titleRow}>
              <Typography level="h3" noWrap startDecorator={iconUi({ id: 'video' })}>
                וידאו
              </Typography>
            </Box>

            <Box sx={vidModuleSx.kpisRow}>
              <Chip size="sm" variant="soft">
                {summary?.totalVideos || 0}
              </Chip>
              {!!summary?.month && (
                <Chip size="sm" variant="outlined">
                  {summary.month}
                </Chip>
              )}
            </Box>
          </Box>

          {!!topTags.length && (
            <Box sx={vidModuleSx.topTagsRow}>
              {topTags.slice(0, 6).map((x) => {
                const label = x?.tag?.tagName || x?.tag?.label || x?.tag?.name || x?.id || 'תג'
                return (
                  <Chip key={String(x?.id || label)} size="sm" variant="outlined">
                    {label} · {x?.count || 0}
                  </Chip>
                )
              })}
            </Box>
          )}
        </Sheet>

        {/* scroll only the cards area */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5 }}>
          <ListVideosToolbarRow
            title="כרטיסי וידאו"
            query={query}
            onQuery={setQuery}
            sortId={sortId}
            sortOptions={sortOptions}
            onSort={setSortId}
          />

          <StickySectionsByMonth
            items={filtered}
            getMonthKey={getMonthKey}
            getMonthLabel={getMonthLabel}
            headerTop={44} // תואם לגובה toolbar (אפשר לכייל)
            renderItem={(v) => {
              const videoEnriched = enrichVideoAnalysisForTeam(v, team, context)
              return (
                <VideoAnalysisCard
                  key={String(v?.id)}
                  video={videoEnriched}
                  preset="teamPreview"
                  from="teamPreview"
                  onWatch={handleWatch}
                  onShare={handleShare}
                  onEdit={handleEdit}
                  onLink={handleLink}
                  context={context}
                />
              )
            }}
          />
        </Box>
      </Box>
    </SectionPanel>
  )
}
