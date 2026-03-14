// C:\projects\devplan\src\features\hub\teamProfile\TeamProfilePage.js
import React, { useMemo } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import { Sheet, Typography, Box, CircularProgress } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import ProfileShell from '../../hub/sharedProfile/ProfileShell'

import { useVideoModal } from '../hooks/videoAnalysis/useVideoModal'
import { useVideoUpdate } from '../hooks/videoAnalysis/useVideoUpdate'

import { getTabFromUrl } from './teamProfile.routes'
import TeamHeader from './components/TeamHeader'
import TeamNav from './components/TeamNav'
import TeamModules from './components/TeamModules'
import TeamProfileFab from './components/TeamProfileFab'

import VideoAttachDrawer from '../../../ui/domains/video/videoAnalysis/attachDrawer/VideoAttachDrawer.js'
import VideoEditDrawer from '../../../ui/domains/video/videoAnalysis/editDrawer/VideoEditDrawer.js'
import DriveVideoPlayer from '../../../ui/domains/video/DriveVideoPlayer.js'

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

export default function TeamProfilePage() {
  const { teamId, tabKey } = useParams()
  const [sp] = useSearchParams()

  const {
    players,
    teams,
    clubs,
    meetings,
    payments,
    videos,
    performances,
    abilities,
    roles,
    tags,
    loading,
    error,
  } = useCoreData()

  const tab = useMemo(
    () => getTabFromUrl({ tabKeyParam: tabKey, searchParams: sp }),
    [tabKey, sp]
  )

  const { modal, open, openEdit, closeAll } = useVideoModal('analysis')

  const payload = modal?.payload || null
  const active = payload?.video || modal?.active || null
  const activeDoc = active?.video || active

  const { run } = useVideoUpdate(activeDoc)

  const entity = useMemo(() => {
    const t = (teams || []).find((x) => String(x.id) === String(teamId)) || null
    if (!t) return null
    const tid = String(t.id)
    return {
      ...t,
    }
  }, [teams, teamId])

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

  const context = useMemo(() => {
    if (!entity) return {}
    return {
      club: clubs?.find((c) => String(c.id) === String(entity.clubId)) || null,
      teams: teams,
      clubs: clubs,
      players: players,
      roles: roles,
      tags: tags,
      video: videoApi,
      videoActions: {
        watch: (video) => videoApi.openWatch({ video, context }),
        edit:  (p) => videoApi.openEdit(p),
        link:  (p) => videoApi.openAttach(p),
        share: (video) => videoApi.openShare?.(video),
      },
    }
  }, [entity, teams, clubs, players, roles, videoApi, tags])

  const counts = useMemo(() => {
    if (!entity) return {}
    return {
      games: entity.teamGames?.length || 0,
      meetings: entity.teamMeetings?.length || 0,
    }
  }, [entity])

  if (loading) {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">טוען קבוצה…</Typography>
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

  if (!entity) return <Navigate to="/hub" replace />

  return (
    <>
      <ProfileShell
        entity={entity}
        context={context}
        tab={tab}
        entityType={entity}
        headerProps={{ counts }}
        HeaderComp={TeamHeader}
        NavComp={TeamNav}
        RendererComp={TeamModules}
        FabComp={TeamProfileFab}
      />

      <VideoEditDrawer
        open={!!modal?.editAnalysisOpen}
        onClose={closeAll}
        video={activeDoc}
        context={payload?.context || context}
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
        video={activeDoc}
        context={payload?.context || context}
        onSave={async ({ video, patch }) => {
          if (!video?.id) return
          await videoApi.patchAnalysis(video, patch, { section: 'videoAttachDrawer' })
          closeAll()
        }}
      />

      <DriveVideoPlayer
        open={!!modal?.watchOpen}
        onClose={closeAll}
        videoLink={activeDoc?.link || activeDoc?.videoLink || ''}
        videoName={activeDoc?.name || activeDoc?.title || 'וידאו'}
        variant="analysis"
      />
    </>
  )
}
