// teamProfile/sharedModules/players/useTeamPlayersModuleModel.js

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import usePlayerRowImageModel from '../../../sharedProfile/hooks/usePlayerRowImageModel.js'
import {
  createEntity,
  deleteEntity,
  unwrapActionResult,
} from '../../../application/index.js'
import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

import {
  filterTeamPlayersRows,
  sortTeamPlayersRows,
  mergeRowsWithPerformance,
  mergeSummaryWithPerformanceBuckets,
  scheduleIdle,
  cancelIdle,
} from '../../sharedLogic/players'

import { useTeamPlayersInsightsModel } from '../../sharedUi/insights/teamPlayers/useTeamPlayersInsightsModel.js'

import {
  TEAM_PLAYERS_VIEW_MODES,
  emptyTeamPlayersFilters,
  getInsightsStatus,
  performanceScopeInitial,
} from './teamPlayersModule.constants.js'

function getPlayerId(row = {}) {
  return row?.id || row?.playerId || row?.player?.id || ''
}

function cleanError(error) {
  return String(error?.message || error || 'אירעה שגיאה לא צפויה')
}

function getImportRows(payload = {}) {
  return Array.isArray(payload?.players) ? payload.players : []
}

export default function useTeamPlayersModuleModel({
  entity,
  context,
  profileData,
  playersInsightsRequest = 0,
  playersImportRequest = 0,
  onPlayersInsightsStatusChange,
  bulkEnabled = false,
}) {
  const { notify } = useSnackbar()

  const initialInsightsRequestRef = useRef(playersInsightsRequest)
  const initialImportRequestRef = useRef(playersImportRequest)
  const didMountInsightsRef = useRef(false)
  const didMountImportRef = useRef(false)
  const lastInsightsStatusRef = useRef('')

  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find(team => team?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const calculationGames = useMemo(() => {
    return profileData?.games?.playedLeagueGames || []
  }, [profileData?.games?.playedLeagueGames])

  const rows = profileData?.players?.rows || []
  const summary = profileData?.players?.summary || {}

  const {
    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly,
    setOpenImg,
    handleAvatarClick,
    handleAfterImageSave,
  } = usePlayerRowImageModel()
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editingPosition, setEditingPosition] = useState(null)
  const [filters, setFilters] = useState(emptyTeamPlayersFilters)
  const [viewMode, setViewMode] = useState(TEAM_PLAYERS_VIEW_MODES.OVERVIEW)
  const [insightsEnabled, setInsightsEnabled] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [importSaving, setImportSaving] = useState(false)
  const [importError, setImportError] = useState('')

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [sort, setSort] = useState({
    by: 'squadRole',
    direction: 'desc',
  })

  useEffect(() => {
    setInsightsEnabled(false)

    if (!liveTeam || !rows.length) return undefined

    const handle = scheduleIdle(() => {
      setInsightsEnabled(true)
    })

    return () => {
      cancelIdle(handle)
    }
  }, [liveTeam?.id, rows.length])

  const insightsModel = useTeamPlayersInsightsModel({
    rows,
    summary,
    team: liveTeam,
    enabled: insightsEnabled,
    defer: false,
    performanceScope: performanceScopeInitial,
  })

  const playersInsightsStatus = getInsightsStatus({
    rows,
    enabled: insightsEnabled,
    model: insightsModel,
  })

  const insightsReady = playersInsightsStatus === 'ready'

  useEffect(() => {
    if (typeof onPlayersInsightsStatusChange !== 'function') return
    if (lastInsightsStatusRef.current === playersInsightsStatus) return

    lastInsightsStatusRef.current = playersInsightsStatus
    onPlayersInsightsStatusChange(playersInsightsStatus)
  }, [playersInsightsStatus, onPlayersInsightsStatusChange])

  const rowsWithPerformance = useMemo(() => {
    return mergeRowsWithPerformance({
      rows,
      team: liveTeam,
      performanceRows: insightsModel?.playerPerformanceRows,
    })
  }, [rows, liveTeam, insightsModel?.playerPerformanceRows])

  const summaryWithPerformance = useMemo(() => {
    return mergeSummaryWithPerformanceBuckets({
      summary,
      rows: rowsWithPerformance,
    })
  }, [summary, rowsWithPerformance])

  const filteredRows = useMemo(() => {
    const filtered = filterTeamPlayersRows(rowsWithPerformance, filters)
    return sortTeamPlayersRows(filtered, sort)
  }, [rowsWithPerformance, filters, sort])

  const selectedPlayerIdsSet = useMemo(() => {
    return new Set(selectedPlayerIds)
  }, [selectedPlayerIds])

  const selectedCount = selectedPlayerIds.length

  const filteredPlayerIds = useMemo(() => {
    return filteredRows.map(getPlayerId).filter(Boolean)
  }, [filteredRows])

  const allFilteredSelected = Boolean(
    filteredPlayerIds.length &&
    filteredPlayerIds.every(id => selectedPlayerIdsSet.has(id))
  )

  useEffect(() => {
    if (!didMountInsightsRef.current) {
      didMountInsightsRef.current = true
      return
    }

    if (
      playersInsightsRequest > 0 &&
      playersInsightsRequest !== initialInsightsRequestRef.current &&
      insightsReady
    ) {
      initialInsightsRequestRef.current = playersInsightsRequest
      setInsightsOpen(true)
    }
  }, [playersInsightsRequest, insightsReady])

  useEffect(() => {
    if (!didMountImportRef.current) {
      didMountImportRef.current = true
      return
    }

    if (
      !bulkEnabled ||
      playersImportRequest <= 0 ||
      playersImportRequest === initialImportRequestRef.current
    ) {
      return
    }

    initialImportRequestRef.current = playersImportRequest
    setImportError('')
    setImportOpen(true)
  }, [playersImportRequest, bulkEnabled])

  useEffect(() => {
    const validIds = new Set(rowsWithPerformance.map(getPlayerId).filter(Boolean))
    setSelectedPlayerIds(current => current.filter(id => validIds.has(id)))
  }, [rowsWithPerformance])

  const handleChangeFilters = patch => {
    setFilters(previous => ({
      ...previous,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(emptyTeamPlayersFilters)
  }

  const handleChangeSortBy = value => {
    setSort(previous => ({
      ...previous,
      by: value,
    }))
  }

  const handleChangeSortDirection = value => {
    setSort(previous => ({
      ...previous,
      direction: value,
    }))
  }

  const handleChangeViewMode = value => {
    setViewMode(value || TEAM_PLAYERS_VIEW_MODES.OVERVIEW)
  }


  const handleStartSelection = useCallback(() => {
    if (!bulkEnabled) return

    setSelectedPlayerIds([])
    setSelectionMode(true)
  }, [bulkEnabled])

  const handleCancelSelection = useCallback(() => {
    if (deleteLoading) return

    setSelectedPlayerIds([])
    setSelectionMode(false)
  }, [deleteLoading])

  const handleTogglePlayerSelection = useCallback(playerId => {
    if (!selectionMode || !playerId) return

    setSelectedPlayerIds(current => {
      if (current.includes(playerId)) {
        return current.filter(id => id !== playerId)
      }

      return [...current, playerId]
    })
  }, [selectionMode])

  const handleToggleSelectAll = useCallback(() => {
    setSelectedPlayerIds(current => {
      if (allFilteredSelected) {
        const filteredIdsSet = new Set(filteredPlayerIds)
        return current.filter(id => !filteredIdsSet.has(id))
      }

      return Array.from(new Set([
        ...current,
        ...filteredPlayerIds,
      ]))
    })
  }, [allFilteredSelected, filteredPlayerIds])

  const handleOpenDelete = useCallback(() => {
    if (!selectedPlayerIds.length) return

    setDeleteError('')
    setDeleteOpen(true)
  }, [selectedPlayerIds])

  const handleCloseDelete = useCallback(() => {
    if (deleteLoading) return

    setDeleteOpen(false)
    setDeleteError('')
  }, [deleteLoading])

  const handleConfirmDelete = useCallback(async plan => {
    if (deleteLoading || !plan?.playerIds?.length) return

    setDeleteLoading(true)
    setDeleteError('')

    try {
      const result = unwrapActionResult(await deleteEntity({
        entityType: 'playersBulk',
        ids: plan.playerIds,
      }))

      const imageFailures = Number(result?.images?.failed) || 0

      setDeleteOpen(false)
      setSelectionMode(false)
      setSelectedPlayerIds([])

      notify({
        status: imageFailures ? 'warning' : 'success',
        action: 'delete',
        entityType: 'player',
        message: imageFailures
          ? `${plan.playerIds.length} שחקנים נמחקו. ${imageFailures} תמונות לא נמחקו מהאחסון.`
          : `${plan.playerIds.length} שחקנים נמחקו בהצלחה.`,
      })
    } catch (error) {
      const message = cleanError(error)

      setDeleteError(message)

      notify({
        status: 'error',
        action: 'delete',
        entityType: 'player',
        message,
      })
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteLoading, notify])

  const handleCloseImport = useCallback(() => {
    if (importSaving) return

    setImportOpen(false)
    setImportError('')
  }, [importSaving])

  const handleImportPlayers = useCallback(async ({ payload }) => {
    if (importSaving) return

    const importRows = getImportRows(payload)

    if (!importRows.length) {
      setImportError('לא נמצאו שחקנים חדשים לייבוא')
      return
    }

    const teamId = payload?.teamId || liveTeam?.id || liveTeam?.teamId || ''
    const clubId = payload?.clubId || liveTeam?.clubId || liveTeam?.club?.id || ''

    if (!teamId) {
      setImportError('לא נמצא מזהה קבוצה')
      return
    }

    if (!clubId) {
      setImportError('לא נמצא מזהה מועדון')
      return
    }

    const players = importRows.map(player => ({
      ...player,
      teamId,
      clubId,
    }))

    setImportSaving(true)
    setImportError('')

    try {
      const result = unwrapActionResult(await createEntity({
        entityType: 'players',
        draft: {
          players,
          teamId,
          clubId,
        },
      }))

      setImportOpen(false)

      notify({
        status: 'success',
        action: 'create',
        entityType: 'player',
        message: `${result?.total || players.length} שחקנים יובאו בהצלחה.`,
      })
    } catch (error) {
      const message = cleanError(error)

      setImportError(message)

      notify({
        status: 'error',
        action: 'create',
        entityType: 'player',
        message,
      })
    } finally {
      setImportSaving(false)
    }
  }, [importSaving, liveTeam, notify])

  return {
    liveTeam,
    calculationGames,

    rows,
    summary,
    rowsWithPerformance,
    summaryWithPerformance,
    filteredRows,

    filters,
    sort,
    viewMode,

    insightsModel,
    insightsReady,
    playersInsightsStatus,

    insightsOpen,
    editingPlayer,
    editingPosition,

    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly,

    selectionMode,
    selectedPlayerIds,
    selectedPlayerIdsSet,
    selectedCount,
    allFilteredSelected,

    setInsightsOpen,
    setEditingPlayer,
    setEditingPosition,
    setOpenImg,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleChangeViewMode,
    handleAvatarClick,
    handleAfterImageSave,

    handleStartSelection,
    handleCancelSelection,
    handleTogglePlayerSelection,
    handleToggleSelectAll,
    handleOpenDelete,

    importDrawerProps: {
      open: importOpen,
      onClose: handleCloseImport,
      team: liveTeam,
      existingPlayers: rowsWithPerformance,
      saving: importSaving,
      error: importError,
      onPreviewReady: handleImportPlayers,
    },

    deleteModalProps: {
      open: deleteOpen,
      onClose: handleCloseDelete,
      team: liveTeam,
      players: rowsWithPerformance,
      selectedPlayerIds,
      loading: deleteLoading,
      error: deleteError,
      onConfirmDelete: handleConfirmDelete,
    },
  }
}
