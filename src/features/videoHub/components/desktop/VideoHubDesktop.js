// src/features/videoHub/components/desktop/VideoHubDesktop.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mui/joy'

import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { deleteActions } from '../../../../ui/domains/entityLifecycle/delete/deleteActions.js'

import {
  VideosBulkDeleteModal,
} from '../../../bulkActions/videos/delete/index.js'

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
  primaryCategoryId: '',
  categoryIds: [],
  tagIds: [],
  tagType: '',
  taggingStatus: '',
  onlyWithoutCategory: false,
  onlyWithoutTags: false,
  sortBy: 'needs_tagging_first',
  sortDir: 'desc',
  tags: [],
  parentTagId: '',
  childTagId: '',
}

export default function VideoHubDesktop() {
  const location = useLocation()
  const { openCreate } = useCreateModal()
  const core = useCoreData()
  const { notify } = useSnackbar()

  const baseContext = useMemo(() => {
    return buildVideoHubContext(core)
  }, [core])

  const [tab, setTab] = useState(VIDEO_TAB.GENERAL)
  const [filtersAna, setFiltersAna] = useState(DEFAULT_FILTERS_ANALYSIS)
  const [filtersGen, setFiltersGen] = useState(DEFAULT_FILTERS_GENERAL)
  const [generalCardView, setGeneralCardView] = useState('full')
  const [videoSelectionMode, setVideoSelectionMode] = useState(false)
  const [selectedVideoIds, setSelectedVideoIds] = useState([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const selectedVideoIdsSet = useMemo(() => {
    return new Set(selectedVideoIds)
  }, [selectedVideoIds])

  const selectedVideos = useMemo(() => {
    return generalRaw.filter(video => {
      const videoId = video?.id || video?.videoId || video?.docId
      return selectedVideoIdsSet.has(videoId)
    })
  }, [generalRaw, selectedVideoIdsSet])

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

  const startVideoSelection = useCallback(() => {
    if (tab !== VIDEO_TAB.GENERAL) return

    setVideoSelectionMode(true)
    setSelectedVideoIds([])
    setDeleteError('')
  }, [tab])

  const cancelVideoSelection = useCallback(() => {
    if (deleteLoading) return

    setVideoSelectionMode(false)
    setSelectedVideoIds([])
    setDeleteModalOpen(false)
    setDeleteError('')
  }, [deleteLoading])

  const toggleVideoSelection = useCallback(videoId => {
    if (!videoId) return

    setSelectedVideoIds(current => {
      if (current.includes(videoId)) {
        return current.filter(id => id !== videoId)
      }

      return [...current, videoId]
    })
  }, [])

  const openVideosDeleteModal = useCallback(() => {
    if (!selectedVideoIds.length) return

    setDeleteError('')
    setDeleteModalOpen(true)
  }, [selectedVideoIds.length])

  const closeVideosDeleteModal = useCallback(() => {
    if (deleteLoading) return

    setDeleteModalOpen(false)
    setDeleteError('')
  }, [deleteLoading])

  const confirmVideosBulkDelete = useCallback(async plan => {
    const ids = Array.isArray(plan?.videoIds)
      ? plan.videoIds.filter(Boolean)
      : []

    if (!ids.length || deleteLoading) return

    setDeleteLoading(true)
    setDeleteError('')

    try {
      const result = await deleteActions.videosBulk({ ids })

      notify({
        status: 'success',
        action: 'delete',
        entityType: 'videoGeneral',
        entityName: `${ids.length} קטעי וידאו`,
        message: `${ids.length} קטעי וידאו נמחקו בהצלחה`,
        details: `נמחקו ${result?.totalRemoved ?? ids.length} רשומות`,
      })

      setDeleteModalOpen(false)
      setVideoSelectionMode(false)
      setSelectedVideoIds([])
    } catch (error) {
      const message =
        error?.message ||
        'מחיקת קטעי הווידאו נכשלה'

      setDeleteError(message)

      notify({
        status: 'error',
        action: 'delete',
        entityType: 'videoGeneral',
        entityName: `${ids.length} קטעי וידאו`,
        message: 'שגיאה במחיקת קטעי הווידאו',
        details: message,
      })
    } finally {
      setDeleteLoading(false)
    }
  }, [
    deleteLoading,
    notify,
  ])

  useEffect(() => {
    if (tab === VIDEO_TAB.GENERAL) return

    setVideoSelectionMode(false)
    setSelectedVideoIds([])
    setDeleteModalOpen(false)
    setDeleteError('')
  }, [tab])

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

            selectionMode={videoSelectionMode}
            selectedCount={selectedVideoIds.length}
            onStartSelection={startVideoSelection}
            onCancelSelection={cancelVideoSelection}
            onOpenDelete={openVideosDeleteModal}
            cardView={generalCardView}
            onCardView={setGeneralCardView}
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
            cardView={generalCardView}

            selectionMode={videoSelectionMode}
            selectedVideoIds={selectedVideoIds}
            onToggleSelect={toggleVideoSelection}
          />
        )}
      </Box>

      <VideosBulkDeleteModal
        open={deleteModalOpen}
        onClose={closeVideosDeleteModal}
        videos={generalRaw}
        selectedVideoIds={selectedVideoIds}
        loading={deleteLoading}
        error={deleteError}
        onConfirmDelete={confirmVideosBulkDelete}
      />

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
