import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import DriveVideoPlayer from '../../../../../ui/domains/video/DriveVideoPlayer.js'
import VideoEditDrawer, {
  VIDEO_EDIT_DRAWER_MODE,
} from '../../../sharedProfile/videoEdit/VideoEditDrawer.js'

import usePlayerVideosModuleModel from './usePlayerVideosModuleModel.js'
import { playerVideosModuleSx } from './playerVideosModule.sx.js'

export default function PlayerVideosModuleBase({
  entity,
  context,
  videoInsightsRequest = 0,
  seasonStartYear = 2025,
  Section,
  toolbarWrapSx,
  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
}) {
  const model = usePlayerVideosModuleModel({
    entity,
    context,
    videoInsightsRequest,
    seasonStartYear,
  })

  const {
    livePlayer,
    tags,
    summary,
    videos,
    allVideos,
    options,
    indicators,
    sortedVideos,
    filters,
    sort,
    insightsOpen,
    attachingVideo,
    editingVideo,
    watchVideo,
    setInsightsOpen,
    setAttachingVideo,
    setEditingVideo,
    setWatchVideo,
    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleWatch,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx = toolbarWrapSx || playerVideosModuleSx.desktopToolbarWrap
  const drawerContext = { ...context, playerId: livePlayer?.id, player: livePlayer }

  return (
    <>
      <Wrap>
        <Box sx={finalToolbarWrapSx}>
          <ToolbarComponent
            summary={summary}
            filters={filters}
            indicators={indicators}
            options={options}
            onChangeFilters={handleChangeFilters}
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={handleChangeSortBy}
            onChangeSortDirection={handleChangeSortDirection}
          />
        </Box>

        {videos.length === 0 ? (
          <EmptyState
            title="אין וידאו"
            subtitle={allVideos.length === 0 ? 'עדיין לא נוספו קטעי וידאו' : 'לא נמצאו תוצאות לפי הפילטרים שנבחרו'}
          />
        ) : (
          <ListComponent
            rows={sortedVideos}
            onLinkVideo={video => setAttachingVideo(video || null)}
            onEditVideo={video => setEditingVideo(video || null)}
            onWatchVideo={video => handleWatch(video || null)}
          />
        )}
      </Wrap>

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        videos={sortedVideos}
        summary={summary}
        entity={livePlayer}
        tags={tags}
        seasonStartYear={seasonStartYear}
      />

      <VideoEditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.ATTACH}
        entityType="analysis"
        open={Boolean(attachingVideo)}
        video={attachingVideo}
        context={drawerContext}
        onClose={() => setAttachingVideo(null)}
      />

      <VideoEditDrawer
        mode={VIDEO_EDIT_DRAWER_MODE.ANALYSIS_EDIT}
        entityType="analysis"
        open={Boolean(editingVideo)}
        video={editingVideo}
        context={drawerContext}
        onClose={() => setEditingVideo(null)}
      />

      <DriveVideoPlayer
        open={Boolean(watchVideo)}
        onClose={() => setWatchVideo(null)}
        videoLink={watchVideo?.link || ''}
        videoName={watchVideo?.name || 'וידאו'}
        variant="analysis"
      />
    </>
  )
}
