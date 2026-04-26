// src/features/videoHub/components/mobile/VideoHubMobile.js

import React, { useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Typography } from '@mui/joy'

import { VIDEO_TAB } from '../../logic/videoHub.model.js'
import {
  enrichVideoAnalysis,
  filterVideoAnalysis,
  sortVideoAnalysis,
  filterVideosGeneral,
  sortVideosGeneral,
} from '../../logic/videoHub.logic.js'
import { buildVideoHubContext } from '../../logic/videoHub.context.js'
import { VIDEO_ANALYSIS_EDIT_ADAPTER } from '../../logic/videoHub.editAdapters.js'

import { useCoreData } from '../../../coreData/CoreDataProvider.js'
import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider.js'
import { buildTaskFabContext } from '../../../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

import { useVideoHubModal } from '../../hooks/useVideoHubModal.js'
import { useVideoHubUpdate } from '../../hooks/useVideoHubUpdate.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import VideoHubEntryCard from './entry/VideoHubEntryCard.js'
import VideoMobileScreen from './screen/VideoMobileScreen.js'
import VideoHubGlobalLayer from '../../sharedUi/VideoHubGlobalLayer.js'
import VideoHubDrawersLayer from '../../sharedUi/VideoHubDrawersLayer.js'

import { pageSx as sx } from './page.sx.js'

const ALL_ID = 'all'

const DEFAULT_FILTERS_GENERAL = {
  q: '',
  source: ALL_ID,
  sortBy: 'updatedAt',
  sortDir: 'desc',
  tags: [],
  parentTagId: ALL_ID,
  childTagId: '',
}

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
  parentTagId: ALL_ID,
  childTagId: '',
}

function normalizeFiltersForCore(filters) {
  return {
    ...filters,
    source: filters?.source === ALL_ID ? '' : filters?.source || '',
    parentTagId: filters?.parentTagId === ALL_ID ? '' : filters?.parentTagId || '',
  }
}

export default function VideoHubMobile() {
  const location = useLocation()
  const core = useCoreData()
  const { openCreate } = useCreateModal()

  const [selectedMode, setSelectedMode] = useState('')
  const [filtersGen, setFiltersGen] = useState(DEFAULT_FILTERS_GENERAL)
  const [filtersAna, setFiltersAna] = useState(DEFAULT_FILTERS_ANALYSIS)

  const activeMode = selectedMode || VIDEO_TAB.GENERAL

  const { modal, open, openEdit, closeAll } = useVideoHubModal(activeMode)
  const active = modal?.active || null

  const { run } = useVideoHubUpdate(active)

  const baseContext = useMemo(() => {
    return buildVideoHubContext(core)
  }, [core])

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
      mode: selectedMode || 'mobileEntry',
      extra: context,
    })
  }, [location, selectedMode, context])

  const filteredGen = useMemo(() => {
    const normalized = normalizeFiltersForCore(filtersGen)
    const out = filterVideosGeneral(generalRaw, normalized)

    return sortVideosGeneral(out, filtersGen.sortBy, filtersGen.sortDir)
  }, [generalRaw, filtersGen])

  const filteredAna = useMemo(() => {
    const normalized = normalizeFiltersForCore(filtersAna)
    const out = filterVideoAnalysis(analysisEnriched, normalized)

    return sortVideoAnalysis(out, filtersAna.sortBy, filtersAna.sortDir)
  }, [analysisEnriched, filtersAna])

  const generalCount = generalRaw.length
  const analysisCount = analysisEnriched.length

  const handleWatch = useCallback((video) => {
    open('watchOpen', video)
  }, [open])

  const handleEdit = useCallback((video) => {
    openEdit(video)
  }, [openEdit])

  const handleShare = useCallback((video) => {
    open('shareOpen', video)
  }, [open])

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
      {
        surface: 'drawer',
        drawerAnchor: 'bottom',
        drawerWidth: 900,
      }
    )
  }, [openCreate, context])

  const setActiveFilters = selectedMode === VIDEO_TAB.ANALYSIS
    ? setFiltersAna
    : setFiltersGen

  const activeFilters = selectedMode === VIDEO_TAB.ANALYSIS
    ? filtersAna
    : filtersGen

  const handleChangeSource = useCallback((value) => {
    setActiveFilters((prev) => ({
      ...prev,
      source: value || ALL_ID,
    }))
  }, [setActiveFilters])

  const handleChangeTag = useCallback((value) => {
    setActiveFilters((prev) => ({
      ...prev,
      parentTagId: value || ALL_ID,
    }))
  }, [setActiveFilters])

  const handleChangeSortBy = useCallback((value) => {
    setActiveFilters((prev) => ({
      ...prev,
      sortBy: value || 'updatedAt',
    }))
  }, [setActiveFilters])

  const handleChangeSortDirection = useCallback((value) => {
    setActiveFilters((prev) => ({
      ...prev,
      sortDir: value || 'desc',
    }))
  }, [setActiveFilters])

  const handleResetFilters = useCallback(() => {
    if (selectedMode === VIDEO_TAB.ANALYSIS) {
      setFiltersAna(DEFAULT_FILTERS_ANALYSIS)
      return
    }

    setFiltersGen(DEFAULT_FILTERS_GENERAL)
  }, [selectedMode])

  if (selectedMode) {
    const isGeneral = selectedMode === VIDEO_TAB.GENERAL
    const rawItems = isGeneral ? generalRaw : analysisEnriched
    const items = isGeneral ? filteredGen : filteredAna

    return (
      <>
        <VideoMobileScreen
          mode={selectedMode}
          rawItems={rawItems}
          items={items}
          total={rawItems.length}
          shown={items.length}
          filters={activeFilters}
          sortBy={activeFilters.sortBy}
          sortDirection={activeFilters.sortDir}
          onBack={() => setSelectedMode('')}
          onWatch={handleWatch}
          onEdit={handleEdit}
          onShare={handleShare}
          onChangeSource={handleChangeSource}
          onChangeTag={handleChangeTag}
          onChangeSortBy={handleChangeSortBy}
          onChangeSortDirection={handleChangeSortDirection}
          onResetFilters={handleResetFilters}
        />

        <VideoHubDrawersLayer
          modal={modal}
          active={active}
          context={context}
          isMobile={true}
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
          tab={selectedMode}
          modal={modal}
          active={active}
          taskContext={taskContext}
          onCloseShare={closeShare}
          onCloseWatch={closeWatch}
          onCreateAnalysis={onCreateAnalysis}
          onCreateGeneral={onCreateGeneral}
          onAddTask={onAddTask}
        />
      </>
    )
  }

  return (
    <Box sx={sx.page}>
      <Box sx={sx.scroll} className="dpScrollThin">
        <Box sx={{ mb: 1.5, px: 0.5 }}>
          <Box sx={sx.titleRow}>
            <Box sx={sx.titleIcon}>
              {iconUi({ id: 'videos', size: 'lg' })}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography level="h3" noWrap>
                מרכז וידאו
              </Typography>

              <Typography level="body-sm" sx={sx.subtitle}>
                בחר אזור עבודה. לכל אזור תהיה רשימה, פילטרים ומיון מותאמים.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.4 }}>
          <VideoHubEntryCard
            tone="general"
            iconId="videoGeneral"
            title="וידאו כללי"
            description="מאגר הסרטונים הכללי של המועדון: צפייה, עריכה, שיתוף וסידור תגיות."
            count={generalCount}
            countLabel="סרטונים"
            secondaryLabel="מאגר כללי"
            onClick={() => setSelectedMode(VIDEO_TAB.GENERAL)}
          />

          <VideoHubEntryCard
            tone="analysis"
            iconId="videoAnalysis"
            title="ניתוחי וידאו"
            description="סרטונים מקצועיים עם שיוך לשחקנים, קבוצות, פגישות ותהליכי אנליזה."
            count={analysisCount}
            countLabel="ניתוחים"
            secondaryLabel="שיוך מקצועי"
            onClick={() => setSelectedMode(VIDEO_TAB.ANALYSIS)}
          />
        </Box>
      </Box>
    </Box>
  )
}
