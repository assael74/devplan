// teamProfile/sharedModules/videos/TeamVideosModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import DriveVideoPlayer from '../../../../../ui/domains/video/DriveVideoPlayer.js'

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
  EditDrawerComponent,
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
    editingVideo,
    watchVideo,

    setInsightsOpen,
    setEditingVideo,
    setWatchVideo,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleWatch,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx =
    toolbarWrapSx || teamVideosModuleSx.desktopToolbarWrap

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
            subtitle={
              allVideos.length === 0
                ? 'עדיין לא נוספו קטעי וידאו'
                : 'לא נמצאו תוצאות לפי הפילטרים שנבחרו'
            }
          />
        ) : (
          <ListComponent
            rows={sortedVideos}
            onEditVideo={video => setEditingVideo(video || null)}
            onWatchVideo={video => handleWatch(video || null)}
            onOpenNotes={video => console.log('open notes', video)}
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

      <EditDrawerComponent
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
