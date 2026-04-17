// src/features/videoHub/VideoHubPage.js

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box } from '@mui/joy'

import { hasActiveFilters } from '../../ui/patterns/filters/filters.logic.js'
import FiltersTrigger from '../../ui/patterns/filters/FiltersTrigger.js'
import { filterItemsByMobileVideoFilters } from './components/filters/mobile/videoMobileFilters.utils'
import VideoMobileFiltersDrawer from './components/filters/mobile/VideoMobileFiltersDrawer'

import { VIDEO_TAB } from './logic/videoHub.model'
import {
  enrichVideoAnalysis,
  filterVideoAnalysis,
  sortVideoAnalysis,
  filterVideosGeneral,
  sortVideosGeneral,
} from './logic/videoHub.logic'
import { videoHubSx as sx } from './sx/videoHub.sx'

import VideoTabsHeader from './components/VideoTabsHeader'
import VideoFiltersBar from './components/filters/VideoFiltersBar'

import VideoAnalysisList from './components/analysis/VideoAnalysisList'
import VideoGeneralList from './components/general/VideoGeneralList'

import EditDrawer from './components/general/editGeneralDrawer/EditDrawer'

import VideoShareModal from './components/modal/VideoShareModal'
import VideoHubFabMenu from './VideoHubFabMenu'

import VideoAttachDrawer from '../../ui/domains/video/videoAnalysis/attachDrawer/VideoAttachDrawer.js'
import VideoEditDrawer from '../../ui/domains/video/videoAnalysis/editDrawer/VideoEditDrawer.js'
import DriveVideoPlayer from '../../ui/domains/video/DriveVideoPlayer.js'

import { useCreateModal } from '../../ui/forms/create/CreateModalProvider'
import { useCoreData } from '../coreData/CoreDataProvider.js'
import { buildVideoHubContext } from './logic/videoHub.context.js'
import { buildTaskFabContext } from '../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../ui/forms/helpers/tasksForm.helpers.js'

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
  parentTagId: '',
  childTagId: '',
}

const DEFAULT_FILTERS_GENERAL = {
  q: '',
  source: '',
  sortBy: 'updatedAt',
  sortDir: 'desc',
  tags: [],
  parentTagId: '',
  childTagId: '',
}

export default function VideoHubPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width:900px)')
  const { openCreate } = useCreateModal()
  const core = useCoreData()

  const baseContext = useMemo(() => buildVideoHubContext(core), [core])

  const [tab, setTab] = useState(VIDEO_TAB.GENERAL)
  const [filtersAna, setFiltersAna] = useState(DEFAULT_FILTERS_ANALYSIS)
  const [filtersGen, setFiltersGen] = useState(DEFAULT_FILTERS_GENERAL)
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false)

  const { modal, open, openEdit, closeAll, setModal } = useVideoHubModal(tab)
  const active = modal?.active || null

  const { run } = useVideoHubUpdate(active)

  const analysisRaw = core?.videoAnalysis || []
  const generalRaw = core?.videos || []

  const analysisEnriched = useMemo(
    () => enrichVideoAnalysis(analysisRaw, baseContext),
    [analysisRaw, baseContext]
  )

  const context = useMemo(
    () => ({ ...baseContext, videoAnalysis: analysisEnriched, videos: generalRaw }),
    [baseContext, analysisEnriched, generalRaw]
  )

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'video',
      mode: tab,
      extra: context,
    })
  }, [location, tab, context])

  const filters = tab === VIDEO_TAB.ANALYSIS ? filtersAna : filtersGen
  const setFilters = tab === VIDEO_TAB.ANALYSIS ? setFiltersAna : setFiltersGen

  const filteredAna = useMemo(() => {
    const baseFilters = isMobile ? { ...filtersAna, q: '' } : filtersAna
    const out = filterVideoAnalysis(analysisEnriched, baseFilters)
    const sorted = sortVideoAnalysis(out, filtersAna.sortBy, filtersAna.sortDir)

    if (!isMobile) return sorted
    return filterItemsByMobileVideoFilters(sorted, filtersAna, context)
  }, [analysisEnriched, filtersAna, isMobile, context])

  const filteredGen = useMemo(() => {
    const baseFilters = isMobile ? { ...filtersGen, q: '' } : filtersGen
    const out = filterVideosGeneral(generalRaw, baseFilters)
    const sorted = sortVideosGeneral(out, filtersGen.sortBy, filtersGen.sortDir)

    if (!isMobile) return sorted
    return filterItemsByMobileVideoFilters(sorted, filtersGen, context)
  }, [generalRaw, filtersGen, isMobile, context])

  const mobileHasActiveFilters = useMemo(() => {
    return hasActiveFilters({
      q: filters?.q || '',
      parentTagId: filters?.parentTagId || '',
      childTagId: filters?.childTagId || '',
    })
  }, [filters])

  const handleWatch = useCallback((v) => open('watchOpen', v), [open])
  const handleAttach = useCallback((v) => open('attachOpen', v), [open])
  const handleOpenShare = useCallback((v) => open('shareOpen', v), [open])
  const handleEdit = useCallback((v) => openEdit(v), [openEdit])

  const closeShare = useCallback(() => closeAll(), [closeAll])
  const closeAttach = useCallback(() => closeAll(), [closeAll])
  const closeEditAnalysis = useCallback(() => closeAll(), [closeAll])
  const closeEditGeneral = useCallback(() => closeAll(), [closeAll])
  const closeWatch = useCallback(() => closeAll(), [closeAll])

  const onCreateAnalysis = useCallback(() => {
    openCreate('videoAnalysis', {}, context)
  }, [openCreate, context])

  const onCreateGeneral = useCallback(() => {
    openCreate('videos', {}, context)
  }, [openCreate, context])

  const onAddTask = useCallback((nextTaskContext = {}) => {
    openCreate(
      'task',
      buildTaskPresetDraft(nextTaskContext),
      { ...context, ...nextTaskContext },
      {
        surface: 'drawer',
        drawerAnchor: 'bottom',
        drawerWidth: 900,
      }
    )
  }, [openCreate, context])

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

  useEffect(() => {
    if (!isMobile && filtersDrawerOpen) {
      setFiltersDrawerOpen(false)
    }
  }, [isMobile, filtersDrawerOpen])

  return (
    <Box sx={sx.page}>
      <Box>
        <VideoTabsHeader tab={tab} onTab={setTab} />

        {isMobile ? (
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <FiltersTrigger
              hasActive={mobileHasActiveFilters}
              onClick={() => setFiltersDrawerOpen(true)}
              label="פילטרים"
            />
          </Box>
        ) : (
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
        )}
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

      {isMobile ? (
        <VideoMobileFiltersDrawer
          open={filtersDrawerOpen}
          onClose={() => setFiltersDrawerOpen(false)}
          filters={filters}
          onFilters={setFilters}
          context={context}
          total={total}
          shown={shown}
        />
      ) : null}

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

      <EditDrawer
        open={modal.editGeneralOpen}
        onClose={closeEditGeneral}
        video={active}
        context={context}
        entityType="general"
        onSaved={(patch, nextVideo) => {
          // optional local patch
        }}
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
        taskContext={taskContext}
        onCreateAnalysis={onCreateAnalysis}
        onCreateGeneral={onCreateGeneral}
        onAddTask={onAddTask}
      />
    </Box>
  )
}
