import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import DriveVideoPlayer from '../../../../../ui/domains/video/DriveVideoPlayer.js'
import VideoEditDrawer, {
  VIDEO_EDIT_DRAWER_MODE,
} from '../../../sharedProfile/videoEdit/VideoEditDrawer.js'

import useTeamVideosModuleModel from './useTeamVideosModuleModel.js'
import { teamVideosModuleSx } from './teamVideosModule.sx.js'

export default function TeamVideosModuleBase({
  entity,
  context,
  videoInsightsRequest = 0,
  Section,
  toolbarWrapSx,
  seasonStartYear = 2025,
  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
}) {
  const model = useTeamVideosModuleModel({
    entity,
    context,
    videoInsightsRequest,
    seasonStartYear,
  })

  const {
    liveTeam,
    tags,
    summary,
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
  const finalToolbarWrapSx = toolbarWrapSx || teamVideosModuleSx.desktopToolbarWrap
  const drawerContext = { ...context, teamId: liveTeam?.id, team: liveTeam }

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

        {sortedVideos.length === 0 ? (
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
        entity={liveTeam}
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
