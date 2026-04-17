//preview/previewDomainCard/domains/player/meetings/PlayerMeetingsDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import {
  resolvePlayerMeetingsDomain,
  filterPlayerMeetings,
} from './logic/playerMeetings.domain.logic.js'
import PlayerMeetingsKpi from './components/PlayerMeetingsKpi.js'
import PlayerMeetingsFilters from './components/PlayerMeetingsFilters.js'
import PlayerMeetingsTable from './components/PlayerMeetingsTable.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'
import NewVideoFormDrawer from './components/newVideoForm/NewVideoFormDrawer.js'

export default function PlayerMeetingsDomainModal({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const { rows, summary } = useMemo(() => resolvePlayerMeetingsDomain(livePlayer), [livePlayer])

  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [videoFilter, setVideoFilter] = useState('all')
  const [activeMeeting, setActiveMeeting] = useState(null)
  const [openCreateMeeting, setOpenCreateMeeting] = useState(false)
  const [openCreateVideo, setOpenCreateVideo] = useState(null)

  const filtered = useMemo(
    () =>
      filterPlayerMeetings(rows, {
        q,
        typeFilter,
        statusFilter,
        videoFilter,
      }),
    [rows, q, typeFilter, statusFilter, videoFilter]
  )

  const handleReset = () => {
    setQ('')
    setTypeFilter('all')
    setStatusFilter('all')
    setVideoFilter('all')
  }

  const handleEdit = (meeting) => {
    setActiveMeeting(meeting)
  }

  const handleCreateVideo = (meeting) => {
    setOpenCreateVideo(meeting)
  }

  return (
    <>
      <Box sx={{ minWidth: 0, display: 'grid', gap: 1 }}>
        <Box sx={{ position: 'sticky', top: -15, zIndex: 5, borderRadius: 12, bgcolor: 'background.body' }}>
          <PlayerMeetingsKpi entity={livePlayer} summary={summary} filteredCount={filtered.length} />

          <PlayerMeetingsFilters
            q={q}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            videoFilter={videoFilter}
            onChangeQ={setQ}
            onChangeTypeFilter={setTypeFilter}
            onChangeStatusFilter={setStatusFilter}
            onChangeVideoFilter={setVideoFilter}
            onReset={handleReset}
            onCreateMeeting={() => setOpenCreateMeeting(true)}
          />
        </Box>

        <PlayerMeetingsTable
          rows={filtered}
          onEditMeeting={handleEdit}
          onCreateVideo={handleCreateVideo}
        />
      </Box>

      <NewFormDrawer
        open={openCreateMeeting}
        onClose={() => setOpenCreateMeeting(false)}
        onSaved={() => setOpenCreateMeeting(false)}
        context={{ ...context, playerId: entity?.id || '', entity: livePlayer }}
      />

      <NewVideoFormDrawer
        open={!!openCreateVideo}
        meeting={openCreateVideo}
        onClose={() => setOpenCreateVideo(null)}
        onSaved={() => setOpenCreateVideo(null)}
        context={{ ...context, playerId: entity?.id || '', meeting: openCreateVideo }}
      />

      <EditDrawer
        open={!!activeMeeting}
        meeting={activeMeeting}
        context={context}
        onClose={() => setActiveMeeting(null)}
        onSaved={() => setActiveMeeting(null)}
      />
    </>
  )
}
