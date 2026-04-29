// src/features/videoHub/components/desktop/VideoHubDesktop.js

import React, { useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mui/joy'

import { VIDEO_TAB } from '../../logic/videoHub.model.js'
import {
  enrichVideoAnalysis,
  filterVideoAnalysis,
  sortVideoAnalysis,
  filterVideosGeneral,
  sortVideosGeneral,
} from '../../logic/videoHub.logic.js'
import { VIDEO_ANALYSIS_EDIT_ADAPTER } from '../../logic/videoHub.editAdapters.js'
import { videoHubSx as sx } from '../../sx/videoHub.sx.js'

import VideoTabsHeader from './VideoTabsHeader.js'
import VideoFiltersBar from './filters/VideoFiltersBar.js'

import VideoAnalysisList from './VideoAnalysisList.js'
import VideoGeneralList from './VideoGeneralList.js'

import VideoHubGlobalLayer from '../../sharedUi/VideoHubGlobalLayer.js'
import VideoHubDrawersLayer from '../../sharedUi/VideoHubDrawersLayer.js'

import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider.js'
import { useCoreData } from '../../../coreData/CoreDataProvider.js'

import { buildVideoHubContext } from '../../logic/videoHub.context.js'
import { buildTaskFabContext } from '../../../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

import { useVideoHubModal } from '../../hooks/useVideoHubModal.js'
import { useVideoHubUpdate } from '../../hooks/useVideoHubUpdate.js'

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

export default function VideoHubDesktop() {
  const location = useLocation()
  const { openCreate } = useCreateModal()
  const core = useCoreData()

  const baseContext = useMemo(() => {
    return buildVideoHubContext(core)
  }, [core])

  const [tab, setTab] = useState(VIDEO_TAB.GENERAL)
  const [filtersAna, setFiltersAna] = useState(DEFAULT_FILTERS_ANALYSIS)
  const [filtersGen, setFiltersGen] = useState(DEFAULT_FILTERS_GENERAL)

  const { modal, open, openEdit, closeAll } = useVideoHubModal(tab)
  const active = modal?.active || null

  const { run } = useVideoHubUpdate(active)

  const analysisRaw = core?.videoAnalysis || []
  const generalRaw = core?.videos || []

  const analysisEnriched = useMemo(() => {
    return enrichVideoAnalysis(analysisRaw, baseContext)
  }, [analysisRaw, baseContext])

  const context = useMemo(() => {
    return {
      ...baseContext,
      videoAnalysis: analysisEnriched,
      videos: generalRaw,
    }
  }, [baseContext, analysisEnriched, generalRaw])

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
    const out = filterVideoAnalysis(analysisEnriched, filtersAna)
    return sortVideoAnalysis(out, filtersAna.sortBy, filtersAna.sortDir)
  }, [analysisEnriched, filtersAna])

  const filteredGen = useMemo(() => {
    const out = filterVideosGeneral(generalRaw, filtersGen)
    return sortVideosGeneral(out, filtersGen.sortBy, filtersGen.sortDir)
  }, [generalRaw, filtersGen])

  const handleWatch = useCallback((video) => {
    open('watchOpen', video)
  }, [open])

  const handleAttach = useCallback((video) => {
    open('attachOpen', video)
  }, [open])

  const handleOpenShare = useCallback((video) => {
    open('shareOpen', video)
  }, [open])

  const handleEdit = useCallback((video) => {
    openEdit(video)
  }, [openEdit])

  const closeShare = useCallback(() => {
    closeAll()
  }, [closeAll])

  const closeAttach = useCallback(() => {
    closeAll()
  }, [closeAll])

  const closeEditAnalysis = useCallback(() => {
    closeAll()
  }, [closeAll])

  const closeEditGeneral = useCallback(() => {
    closeAll()
  }, [closeAll])

  const closeWatch = useCallback(() => {
    closeAll()
  }, [closeAll])

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
    )
  }, [openCreate, context])

  const total = tab === VIDEO_TAB.ANALYSIS
    ? analysisEnriched.length
    : generalRaw.length

  const shown = tab === VIDEO_TAB.ANALYSIS
    ? filteredAna.length
    : filteredGen.length

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

      <VideoHubDrawersLayer
        modal={modal}
        active={active}
        context={context}
        analysisEditAdapter={VIDEO_ANALYSIS_EDIT_ADAPTER}
        onCloseAttach={closeAttach}
        onCloseEditAnalysis={closeEditAnalysis}
        onCloseEditGeneral={closeEditGeneral}
        onSaveAttach={({ video, patch }) =>
          run('analysis', patch, {
            section: 'videoAttachDrawer',
            videoId: video?.id,
          })
        }
        onSaveEditAnalysis={({ video, patch }) =>
          run('analysis', patch, {
            section: 'videoEditDrawer',
            videoId: video?.id,
          })
        }
        onSavedEditGeneral={() => {}}
      />

      <VideoHubGlobalLayer
        tab={tab}
        modal={modal}
        active={active}
        taskContext={taskContext}
        onCloseShare={closeShare}
        onCloseWatch={closeWatch}
        onCreateAnalysis={onCreateAnalysis}
        onCreateGeneral={onCreateGeneral}
        onAddTask={onAddTask}
      />
    </Box>
  )
}
