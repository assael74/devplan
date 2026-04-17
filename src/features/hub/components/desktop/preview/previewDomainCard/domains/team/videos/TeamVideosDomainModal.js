// domains/team/games/TeamVideosDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import { resolveTeamVideosDomain } from './logic/teamVideos.domain.logic.js'
import TeamVideosKpi from './components/TeamVideosKpi.js'
import TeamVideosFilters from './components/TeamVideosFilters.js'
import TeamVideosTable from './components/TeamVideosTable.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'

import DriveVideoPlayer from '../../../../../../../../../ui/domains/video/DriveVideoPlayer.js'

export default function TeamVideosDomainModal({
  entity,
  context,
  onClose,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])
  const team = entity || null

  const [q, setQ] = useState('')
  const [month, setMonth] = useState('all')
  const [onlyTagged, setOnlyTagged] = useState(false)
  const [onlyKey, setOnlyKey] = useState(false)

  const [editingVideo, setEditingVideo] = useState(null)
  const [watchVideo, setWatchVideo] = useState(null)
  const [openCreateVideo, setOpenCreateVideo] = useState(false)

  const tags = useMemo(() => {
    const t1 = context?.tags
    const t2 = context?.tagsArr
    return Array.isArray(t1) ? t1 : Array.isArray(t2) ? t2 : []
  }, [context?.tags, context?.tagsArr])

  const derivedSeasonYear = useMemo(() => {
    const now = new Date()
    return now.getMonth() + 1 >= 8
      ? now.getFullYear()
      : now.getFullYear() - 1
  }, [])

  const resolved = useMemo(
    () =>
      resolveTeamVideosDomain(
        team,
        {
          q,
          month: month === 'all' ? '' : month,
          onlyTagged,
          onlyKey,
        },
        { tags, seasonStartYear: derivedSeasonYear }
      ),
    [team, q, month, onlyTagged, onlyKey, tags, derivedSeasonYear]
  )

  const { summary, options, videos } = resolved

  const handleReset = () => {
    setQ('')
    setMonth('all')
    setOnlyTagged(false)
    setOnlyKey(false)
  }

  const handleWatch = (video) => {
    if (!video) return
    setWatchVideo(video)
  }

  const handleEdit = (video) => {
    if (!video) return
    setEditingVideo(video)
  }

  const handleEditSaved = (patch, updatedVideo) => {
    setEditingVideo(updatedVideo || null)
  }

  const handleOpenCreate = () => {
    setOpenCreateVideo(true)
  }

  const handleCloseCreate = () => {
    setOpenCreateVideo(false)
  }

  const handleCreateSaved = () => {
    setOpenCreateVideo(false)
  }

  return (
    <Box sx={{ minWidth: 0, display: 'grid', gap: 1 }}>
      <Box
        sx={{
          position: 'sticky',
          top: -15,
          zIndex: 5,
          borderRadius: 'xl',
          bgcolor: 'background.body',
        }}
      >
        <TeamVideosKpi
          entity={team}
          summary={summary}
          filteredCount={videos.length}
        />

        <TeamVideosFilters
          q={q}
          month={month}
          monthOptions={options?.months || []}
          onlyTagged={onlyTagged}
          onlyKey={onlyKey}
          onChangeQ={setQ}
          onChangeMonth={setMonth}
          onChangeOnlyTagged={setOnlyTagged}
          onChangeOnlyKey={setOnlyKey}
          onReset={handleReset}
          onCreateVideo={handleOpenCreate}
        />
      </Box>

      <TeamVideosTable
        rows={videos}
        onWatch={handleWatch}
        onEdit={handleEdit}
      />

      <EditDrawer
        open={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSaved={handleEditSaved}
        context={context}
      />

      <NewFormDrawer
        open={openCreateVideo}
        onClose={handleCloseCreate}
        onSaved={handleCreateSaved}
        context={{ ...context, teamId: team?.id || '', team: liveTeam }}
      />

      <DriveVideoPlayer
        open={!!watchVideo}
        onClose={() => setWatchVideo(null)}
        videoLink={watchVideo?.link || ''}
        videoName={watchVideo?.name || 'וידאו'}
        variant="analysis"
      />
    </Box>
  )
}
