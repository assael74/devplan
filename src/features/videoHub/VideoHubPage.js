// src/features/videoHub/VideoHubPage.js
import React, { useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import { VIDEO_TAB } from './videoHub.model'
import {
  enrichVideoAnalysis,
  filterVideoAnalysis,
  sortVideoAnalysis,
  filterVideosGeneral,
  sortVideosGeneral,
} from './videoHub.logic'
import { videoHubSx as sx } from './videoHub.sx'

import VideoTabsHeader from './components/VideoTabsHeader'
import VideoFiltersBar from './components/filters/VideoFiltersBar'

import VideoAnalysisList from './components/analysis/VideoAnalysisList'
import VideoGeneralList from './components/general/VideoGeneralList'

import VideoGeneralEditDrawer from './components/general/editGeneralDrawer/VideoGeneralEditDrawer'

import VideoShareModal from './components/modal/VideoShareModal'
import VideoHubFabMenu from './VideoHubFabMenu'

import VideoAttachDrawer from '../../ui/domains/video/videoAnalysis/attachDrawer/VideoAttachDrawer.js'
import VideoEditDrawer from '../../ui/domains/video/videoAnalysis/editDrawer/VideoEditDrawer.js'
import DriveVideoPlayer from '../../ui/domains/video/DriveVideoPlayer.js'

import { useCreateModal } from '../../ui/forms/create/CreateModalProvider'
import { useCoreData } from '../coreData/CoreDataProvider.js'
import { buildVideoHubContext } from './videoHub.context.js'

import { useVideoHubModal } from './hooks/useVideoHubModal.js'
import { useVideoHubUpdate } from './hooks/useVideoHubUpdate.js'

const DEFAULT_FILTERS_ANALYSIS = {
  q: '',
  contextType: '',
  objectType: '',
  clubId: '',
  teamId: '',
  playerId: '',
  meetingId: '',
  ym: '',
  year: '',
  month: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',
  onlyUnlinked: false,
  tags: [],
}

const DEFAULT_FILTERS_GENERAL = {
  q: '',
  source: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',
  tags: [],
}

export default function VideoHubPage() {
  const { openCreate } = useCreateModal()
  const core = useCoreData()

  const baseContext = useMemo(() => buildVideoHubContext(core), [core])

  const [tab, setTab] = useState(VIDEO_TAB.GENERAL)

  const [filtersAna, setFiltersAna] = useState(DEFAULT_FILTERS_ANALYSIS)
  const [filtersGen, setFiltersGen] = useState(DEFAULT_FILTERS_GENERAL)

  // ✅ single source of truth for modal state
  const { modal, open, openEdit, closeAll, setModal } = useVideoHubModal(tab)
  const active = modal?.active || null

  // ✅ update runner (explicit type)
  const { run } = useVideoHubUpdate(active)

  // raw
  const analysisRaw = core?.videoAnalysis || []
  const generalRaw = core?.videos || []

  // enrich analysis only
  const analysisEnriched = useMemo(
    () => enrichVideoAnalysis(analysisRaw, baseContext),
    [analysisRaw, baseContext]
  )

  // context
  const context = useMemo(
    () => ({ ...baseContext, videoAnalysis: analysisEnriched, videos: generalRaw }),
    [baseContext, analysisEnriched, generalRaw]
  )

  // derived
  const filteredAna = useMemo(() => {
    const out = filterVideoAnalysis(analysisEnriched, filtersAna)
    return sortVideoAnalysis(out, filtersAna.sortBy, filtersAna.sortDir)
  }, [analysisEnriched, filtersAna])

  const filteredGen = useMemo(() => {
    const out = filterVideosGeneral(generalRaw, filtersGen)
    return sortVideosGeneral(out, filtersGen.sortBy, filtersGen.sortDir)
  }, [generalRaw, filtersGen])

  // open handlers
  const handleWatch = useCallback((v) => open('watchOpen', v), [open])
  const handleAttach = useCallback((v) => open('attachOpen', v), [open])
  const handleOpenShare = useCallback((v) => open('shareOpen', v), [open])
  const handleEdit = useCallback((v) => openEdit(v), [openEdit])

  // close handlers (fix eslint no-undef)
  const closeShare = useCallback(() => closeAll(), [closeAll])
  const closeAttach = useCallback(() => closeAll(), [closeAll])
  const closeEditAnalysis = useCallback(() => closeAll(), [closeAll])
  const closeEditGeneral = useCallback(() => closeAll(), [closeAll])
  const closeWatch = useCallback(() => closeAll(), [closeAll])

  // create
  const onCreateAnalysis = useCallback(() => {
    openCreate('videoAnalysis', {}, context)
  }, [openCreate, context])

  const onCreateGeneral = useCallback(() => {
    // אם ה-provider אצלך מצפה ל-3 args, תיישר קו כאן כמו באנליזה
    openCreate('videos', {}, context)
  }, [openCreate, context])

  // filters ui
  const filters = tab === VIDEO_TAB.ANALYSIS ? filtersAna : filtersGen
  const setFilters = tab === VIDEO_TAB.ANALYSIS ? setFiltersAna : setFiltersGen

  const total = tab === VIDEO_TAB.ANALYSIS ? analysisEnriched.length : generalRaw.length
  const shown = tab === VIDEO_TAB.ANALYSIS ? filteredAna.length : filteredGen.length

  const VIDEO_ANALYSIS_EDIT_ADAPTER = {
    buildOriginal: (video) => ({
      id: video?.id || '',
      name: video?.name || video?.title || '',
      notes: video?.notes || '',
      tagIds: Array.isArray(video?.tagIds) ? video.tagIds : Array.isArray(video?.tags) ? video.tags : [],
    }),

    isDirty: (draft, original) => {
      if (!draft || !original) return false
      const a = (Array.isArray(draft.tagIds) ? draft.tagIds : []).slice().sort().join('|')
      const b = (Array.isArray(original.tagIds) ? original.tagIds : []).slice().sort().join('|')
      return (
        (draft.name || '') !== (original.name || '') ||
        (draft.notes || '') !== (original.notes || '') ||
        a !== b
      )
    },

    buildPatch: (draft, original) => {
      const patch = {}
      if ((draft?.name || '') !== (original?.name || '')) patch.name = draft?.name || ''
      if ((draft?.notes || '') !== (original?.notes || '')) patch.notes = draft?.notes || ''
      const a = (Array.isArray(draft?.tagIds) ? draft.tagIds : []).slice().sort().join('|')
      const b = (Array.isArray(original?.tagIds) ? original.tagIds : []).slice().sort().join('|')
      if (a !== b) patch.tagIds = Array.isArray(draft?.tagIds) ? draft.tagIds : []
      return patch
    },
  }

  return (
    <Box sx={sx.page}>
      <Box>
        <VideoTabsHeader tab={tab} onTab={setTab} />
        <Box sx={{ p: 1 }}>
          <VideoFiltersBar
            tab={tab}
            items={tab === VIDEO_TAB.ANALYSIS ? analysisEnriched : generalRaw}
            filters={filters}
            onFilters={setFilters}
            context={context}
            total={total}
            shown={shown}
          />
        </Box>
      </Box>

      <Box sx={sx.content} className="dpScrollThin">
        {tab === VIDEO_TAB.ANALYSIS ? (
          <VideoAnalysisList
            items={filteredAna}
            context={context}
            onLink={handleAttach}
            onEdit={handleEdit}
            onShare={handleOpenShare}
            onWatch={handleWatch}
          />
        ) : (
          <VideoGeneralList
            items={filteredGen}
            context={context}
            onEdit={handleEdit}
            onShare={handleOpenShare}
            onWatch={handleWatch}
          />
        )}
      </Box>

      <VideoShareModal
        open={modal.shareOpen}
        onClose={closeShare}
        video={active}
        onSave={closeShare}
      />

      <VideoAttachDrawer
        open={modal.attachOpen}
        onClose={closeAttach}
        video={active}
        context={context}
        onSave={({ video, patch }) =>
          run('analysis', patch, { section: 'videoAttachDrawer', videoId: video?.id })
        }
      />

      <VideoEditDrawer
        open={modal.editAnalysisOpen}
        onClose={closeEditAnalysis}
        video={active}
        context={context}
        adapter={VIDEO_ANALYSIS_EDIT_ADAPTER}
        onSave={({ video, patch }) =>
          run('analysis', patch, { section: 'videoEditDrawer', videoId: video?.id })
        }
      />

      <VideoGeneralEditDrawer
        open={modal.editGeneralOpen}
        onClose={closeEditGeneral}
        video={active}
        context={context}
        onSave={({ video, patch }) =>
          run('general', patch, { section: 'videoGeneralEditDrawer', videoId: video?.id })
        }
      />

      <DriveVideoPlayer
        open={modal.watchOpen}
        onClose={closeWatch}
        videoLink={active?.link || active?.videoLink || ''}
        videoName={active?.name || active?.title || 'וידאו'}
        variant={tab === VIDEO_TAB.ANALYSIS ? 'analysis' : 'general'}
      />

      <VideoHubFabMenu
        tab={tab}
        onCreateAnalysis={onCreateAnalysis}
        onCreateGeneral={onCreateGeneral}
      />
    </Box>
  )
}
