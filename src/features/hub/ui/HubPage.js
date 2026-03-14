// src/features/hub/ui/HubPage.js
import React, { useMemo, useCallback, useEffect } from 'react'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PreviewPanel from '../components/PreviewPanel'
import PlayersLayout from '../components/layout/PlayersLayout'
import HubFabMenu from '../components/navigation/HubFabMenu'
import HubToolbar from '../components/navigation/HubToolbar'

import PlayersListPane from '../components/lists/players/PlayersListPane.js'
import TeamsListPane from '../components/lists/teams/TeamsListPane.js'
import ClubsList from '../components/lists/clubs/ClubsList.js'
import HubStaffList from '../components/lists/staff/HubStaffList.js'
import HubScoutingList from '../components/lists/scout/HubScoutingList.js'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import { useHubState } from '../domain/hub.state'
import { hubPageSx } from './hubPage.sx'
import { buildRoutesByType, buildCountsByType } from './hub.routes'
import { useCreateModal } from '../../../ui/forms/create/CreateModalProvider'
import { buildTabsMeta, buildContextFromSelection, buildCreateHandlers } from './HubPage.helpers'

import { useVideoModal } from '../hooks/videoAnalysis/useVideoModal'
import { useVideoUpdate } from '../hooks/videoAnalysis/useVideoUpdate'

import VideoAttachDrawer from '../../../ui/domains/video/videoAnalysis/attachDrawer/VideoAttachDrawer.js'
import VideoEditDrawer from '../../../ui/domains/video/videoAnalysis/editDrawer/VideoEditDrawer.js'
import DriveVideoPlayer from '../../../ui/domains/video/DriveVideoPlayer.js'

const supportedPreviewTypes = new Set(['club', 'team', 'player', 'staff', 'scout'])

const VIDEO_ANALYSIS_EDIT_ADAPTER = {
  buildOriginal: (video) => ({
    id: video?.id || '',
    name: video?.name || video?.title || '',
    notes: video?.notes || '',
    tagIds: Array.isArray(video?.tagIds)
      ? video.tagIds
      : Array.isArray(video?.tags)
      ? video.tags
      : [],
  }),

  isDirty: (draft, original) => {
    const a = draft || {}
    const b = original || {}
    const tagsA = Array.isArray(a.tagIds) ? a.tagIds.join(',') : ''
    const tagsB = Array.isArray(b.tagIds) ? b.tagIds.join(',') : ''
    return (a.name || '') !== (b.name || '') || (a.notes || '') !== (b.notes || '') || tagsA !== tagsB
  },

  buildPatch: (draft, original) => {
    const a = draft || {}
    const b = original || {}
    const patch = {}

    if ((a.name || '') !== (b.name || '')) patch.name = a.name || ''
    if ((a.notes || '') !== (b.notes || '')) patch.notes = a.notes || ''

    const tagsA = Array.isArray(a.tagIds) ? a.tagIds : []
    const tagsB = Array.isArray(b.tagIds) ? b.tagIds : []
    if (tagsA.join(',') !== tagsB.join(',')) patch.tagIds = tagsA

    return patch
  },
}

export default function HubPage() {
  const navigate = useNavigate()
  const { openCreate } = useCreateModal()

  const { players, clubs, teams, roles, scouting, meetings, videoAnalysis, tags, loading, error } = useCoreData()
  const s = useHubState({
    corePlayers: players,
    coreClubs: clubs,
    coreTeams: teams,
    coreRoles: roles,
    coreScouting: scouting,
    coreMeetings: meetings,
  })

  const tabsMeta = useMemo(() => buildTabsMeta(s.MODE), [s.MODE])

  const routesByType = useMemo(() => buildRoutesByType(), [])
  const countsByType = useMemo(() => {
    const t = s.previewSelection?.type
    return supportedPreviewTypes.has(t) ? buildCountsByType(s.previewSelection) : {}
  }, [s.previewSelection])

  const context = useMemo(() => buildContextFromSelection(s.previewSelection), [s.previewSelection])

  const handlers = useMemo(() => {
    return buildCreateHandlers({
      openCreate,
      context,
      countsByType,
      routesByType,
      navigate,
    })
  }, [openCreate, context, countsByType, routesByType, navigate])

  const handleModeChange = useCallback(
    (next) => {
      const nextMode = next || s.MODE.PLAYERS
      if (nextMode === s.mode) return
      s.setMode(nextMode)
    },
    [s]
  )

  const { modal, open, openEdit, closeAll } = useVideoModal('analysis')

  const payload = modal?.payload || null
  const activeVideo = payload?.video || modal?.active || null

  const { run } = useVideoUpdate(activeVideo?.video)
  //console.log(teams.filter(p=>p.id === 'ילדים-ב-20250806-143709'))
  const videoApi = useMemo(() => {
    return {
      openWatch: (p) => open('watchOpen', p),
      openAttach: (p) => open('attachOpen', p),
      openEdit: (p) => openEdit(p),
      closeAll,

      patchAnalysis: (video, patch, meta) =>
        run('analysis', patch, {
          section: meta?.section || 'videoAnalysis',
          videoId: video?.id,
          ...meta,
        }),
    }
  }, [open, openEdit, closeAll, run])

  const previewContext = useMemo(() => {
    const sel = buildContextFromSelection(s.previewSelection) || {}
    return {
      ...sel,
      clubs: clubs || [],
      teams: teams || [],
      players: players || [],
      roles: roles || [],
      meetings: meetings || [],
      tags: tags || [],
      videoAnalysis: videoAnalysis || [],
      video: videoApi,
    }
  }, [s.previewSelection, clubs, teams, players, roles, meetings, tags, videoApi, videoAnalysis])

  const permissions = useMemo(() => ({ allowCreate: true }), [])

  const routes = useMemo(() => {
    const t = s.previewSelection?.type
    return supportedPreviewTypes.has(t) ? buildRoutesByType(s.previewSelection) : {}
  }, [s.previewSelection])

  const list = useMemo(() => {
    if (s.mode === s.MODE.CLUBS) {
      return (
        <ClubsList
          clubs={clubs || []}
          onSelect={(c) => s.handleSelectClub({ clubId: c.id, clubName: c.clubName })}
          selectedId={s.previewSelection?.type === 'club' ? s.previewSelection.data?.id : null}
        />
      )
    }

    if (s.mode === s.MODE.TEAMS) {
      return (
        <TeamsListPane
          teams={teams || []}
          onSelect={(t) =>
            s.handleSelectTeam({ teamId: t.id, teamName: t.teamName }, { clubId: t.clubId })
          }
          selectedId={s.previewSelection.type === 'team' ? s.previewSelection.data?.id : null}
        />
      )
    }

    if (s.mode === s.MODE.PLAYERS) {
      return (
        <PlayersListPane
          players={players || []}
          onSelect={s.handleSelectPlayer}
          selectedId={s.previewSelection.type === 'player' ? s.previewSelection.data?.id : null}
          onOpenActions={s.handleOpenActions}
        />
      )
    }

    if (s.mode === s.MODE.STAFF) {
      return <HubStaffList rows={s.staffRows} onSelect={s.handleSelectStaff} />
    }

    if (s.mode === s.MODE.SCOUTING) {
      return <HubScoutingList rows={s.scoutRows} onSelect={s.handleSelectScout} />
    }

    return null
  }, [
    s,
    clubs,
    teams,
    players,
    s.mode,
    s.previewSelection,
    s.staffRows,
    s.scoutRows,
    s.handleSelectClub,
    s.handleSelectTeam,
    s.handleSelectPlayer,
    s.handleOpenActions,
    s.handleSelectStaff,
    s.handleSelectScout,
  ])

  const preview = supportedPreviewTypes.has(s.previewSelection?.type) ? (
    <PreviewPanel
      selection={s.previewSelection}
      routesByType={{ [s.previewSelection?.type]: routes }}
      countsByType={countsByType}
      onOpenRoute={(route) => route && navigate(route)}
      context={previewContext}
      videoApi={videoApi}
    />
  ) : (
    <Sheet variant="soft" sx={{ p: 2, borderRadius: 12 }}>
      <Typography level="title-sm">תצוגה מקדימה</Typography>
      <Typography level="body-sm" sx={{ mt: 0.5, opacity: 0.75 }}>
        בחר ישות כדי לראות פרטים.
      </Typography>
    </Sheet>
  )

  if (loading) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען נתונים.</Typography>
        </Box>
      </Sheet>
    )
  }

  if (error) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Typography level="body-sm">שגיאה בטעינת נתונים</Typography>
      </Sheet>
    )
  }

  return (
    <Sheet sx={hubPageSx.page}>
      <HubToolbar
        mode={s.mode}
        onModeChange={handleModeChange}
        query={s.query}
        onQueryChange={s.setQuery}
        counts={s.counts}
        tabsMeta={tabsMeta}
      />

      <PlayersLayout list={list} preview={preview} />

      <HubFabMenu mode={s.mode} context={context} handlers={handlers} permissions={s.permissions} />

      <VideoEditDrawer
        open={!!modal?.editAnalysisOpen}
        onClose={closeAll}
        video={activeVideo?.video}
        context={payload?.context || previewContext}
        adapter={VIDEO_ANALYSIS_EDIT_ADAPTER}
        onSave={async ({ video, patch }) => {
          if (!video?.id) return
          await videoApi.patchAnalysis(video, patch, { section: 'videoEditDrawer' })
          // לא לסגור כאן אם ה-Drawer כבר סוגר
        }}
      />

      <VideoAttachDrawer
        open={!!modal?.attachOpen}
        onClose={closeAll}
        video={activeVideo?.video}
        context={payload?.context || previewContext}
        onSave={async ({ video, patch }) => {
          if (!video?.id) return
          await videoApi.patchAnalysis(video, patch, { section: 'videoAttachDrawer' })
          closeAll()
        }}
      />

      <DriveVideoPlayer
        open={!!modal?.watchOpen}
        onClose={closeAll}
        videoLink={activeVideo?.link || activeVideo?.videoLink || ''}
        videoName={activeVideo?.name || activeVideo?.title || 'וידאו'}
        variant="analysis"
      />
    </Sheet>
  )
}
