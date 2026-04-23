// teamProfile/desktop/modules/videos/TeamVideosModule.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import TeamVideosToolbar from './components/toolbar/TeamVideosToolbar.js'
import TeamVideosList from './components/TeamVideosList.js'

import TeamVideosInsightsDrawer from './components/insightsDrawer/TeamVideosInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'
import {
  createInitialTeamVideosFilters,
  resolveTeamVideosFiltersDomain,
  sortTeamVideosRows,
} from '../../../sharedLogic/videos'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

const asArr = (v) => (Array.isArray(v) ? v : [])

export default function TeamVideosModule({
  entity,
  context,
  videoInsightsRequest = 0,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const initialFilters = useMemo(() => createInitialTeamVideosFilters(), [])

  const [filters, setFilters] = useState(initialFilters)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [watchVideo, setWatchVideo] = useState(null)
  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })

  const tags = useMemo(() => {
    const a = asArr(context?.tags)
    if (a.length) return a

    const b = asArr(context?.tagsArr)
    if (b.length) return b

    return []
  }, [context?.tags, context?.tagsArr])

  const domain = useMemo(() => {
    return resolveTeamVideosFiltersDomain(liveTeam, filters, {
      tags,
      seasonStartYear: 2025,
    })
  }, [liveTeam, filters, tags])

  useEffect(() => {
    if (videoInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [videoInsightsRequest])

  const {
    summary,
    videos,
    allVideos,
    options,
    indicators,
  } = domain

  const sortedVideos = useMemo(() => {
    return sortTeamVideosRows(videos, sort)
  }, [videos, sort])

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialTeamVideosFilters())
  }

  const handleWatch = (video) => {
    if (!video) return
    setWatchVideo(video)
  }

  return (
    <>
      <SectionPanel>
        <Box
          sx={{
            position: 'sticky',
            top: -6,
            zIndex: 5,
            display: 'grid',
            gap: 1,
            borderRadius: 12,
            bgcolor: 'background.body',
            mb: 0.5,
            boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
          }}
        >
          <TeamVideosToolbar
            summary={summary}
            filters={filters}
            indicators={indicators}
            options={options}
            onChangeFilters={handleChangeFilters}
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={(value) => setSort((prev) => ({ ...prev, by: value }))}
            onChangeSortDirection={(value) => setSort((prev) => ({ ...prev, direction: value }))}
          />
        </Box>

        {sortedVideos.length === 0 ? (
          <EmptyState
            title="אין וידאו"
            subtitle={
              allVideos.length === 0
                ? 'עדיין לא נוספו קטעי וידאו'
                : 'לא נמצאו תוצאות לפי הפילטרים שנבחרו'
            }
          />
        ) : (
          <TeamVideosList
            rows={sortedVideos}
            onEditVideo={(video) => setEditingVideo(video || null)}
            onWatchVideo={(video) => handleWatch(video || null)}
            onOpenNotes={(video) => console.log('open notes', video)}
          />
        )}
      </SectionPanel>

      <TeamVideosInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        videos={sortedVideos}
        summary={summary}
        entity={liveTeam}
        tags={tags}
        seasonStartYear={2025}
      />

      <EditDrawer
        open={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSaved={() => {}}
        context={{ ...context, teamId: liveTeam?.id, team: liveTeam }}
      />

      <DriveVideoPlayer
        open={!!watchVideo}
        onClose={() => setWatchVideo(null)}
        videoLink={watchVideo?.link || ''}
        videoName={watchVideo?.name || 'וידאו'}
        variant="analysis"
      />
    </>
  )
}
