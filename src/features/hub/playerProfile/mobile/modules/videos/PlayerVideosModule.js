// playerProfile/mobile/modules/videos/PlayerVideosModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import PlayerVideosToolbar from './components/toolbar/PlayerVideosToolbar.js'
import PlayerVideosList from './components/PlayerVideosList.js'

import PlayerVideosInsightsDrawer from './components/insightsDrawer/PlayerVideosInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'

import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'
import {
  createInitialPlayerVideosFilters,
  resolvePlayerVideosFiltersDomain,
} from './../../../sharedLogic'

import { profileSx as sx } from './../../sx/profile.sx'

const asArr = (v) => (Array.isArray(v) ? v : [])

export default function PlayerVideosModule({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const initialFilters = useMemo(() => createInitialPlayerVideosFilters(), [])

  const [filters, setFilters] = useState(initialFilters)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [watchVideo, setWatchVideo] = useState(null)

  const tags = useMemo(() => {
    const a = asArr(context?.tags)
    if (a.length) return a

    const b = asArr(context?.tagsArr)
    if (b.length) return b

    return []
  }, [context?.tags, context?.tagsArr])

  const domain = useMemo(() => {
    return resolvePlayerVideosFiltersDomain(livePlayer, filters, {
      tags,
      seasonStartYear: 2025,
    })
  }, [livePlayer, filters, tags])

  const {
    summary,
    videos,
    allVideos,
    options,
    indicators,
  } = domain

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialPlayerVideosFilters())
  }

  const handleWatch = (video) => {
    if (!video) return
    setWatchVideo(video)
  }
  //console.log(livePlayer)
  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <PlayerVideosToolbar
          summary={summary}
          filters={filters}
          indicators={indicators}
          options={options}
          onOpenInsights={() => setInsightsOpen(true)}
          onChangeFilters={handleChangeFilters}
          onResetFilters={handleResetFilters}
        />
      </Box>

      {videos.length === 0 ? (
        <EmptyState
          title="אין וידאו"
          subtitle={
            allVideos.length === 0
              ? 'עדיין לא נוספו קטעי וידאו'
              : 'לא נמצאו תוצאות לפי הפילטרים שנבחרו'
          }
        />
      ) : (
        <PlayerVideosList
          rows={videos}
          onEditVideo={(video) => setEditingVideo(video || null)}
          onWatchVideo={(video) => handleWatch(video || null)}
          onOpenNotes={(video) => console.log('open notes', video)}
        />
      )}

      <PlayerVideosInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        videos={videos}
        summary={summary}
        entity={livePlayer}
        tags={tags}
        seasonStartYear={2025}
      />

      <EditDrawer
        open={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSaved={() => {}}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />

      <DriveVideoPlayer
        open={!!watchVideo}
        onClose={() => setWatchVideo(null)}
        videoLink={watchVideo?.link || ''}
        videoName={watchVideo?.name || 'וידאו'}
        variant="analysis"
      />
    </SectionPanelMobile>
  )
}
