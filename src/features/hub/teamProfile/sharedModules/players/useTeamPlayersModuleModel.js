// teamProfile/sharedModules/players/useTeamPlayersModuleModel.js

import { useEffect, useMemo, useRef, useState } from 'react'

import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

import {
  filterTeamPlayersRows,
  sortTeamPlayersRows,
  mergeRowsWithPerformance,
  mergeSummaryWithPerformanceBuckets,
  scheduleIdle,
  cancelIdle,
} from '../../sharedLogic/players'

import {
  useTeamPlayersInsightsModel,
} from '../../sharedUi/insights/teamPlayers/useTeamPlayersInsightsModel.js'

import {
  emptyTeamPlayersFilters,
  getInsightsStatus,
  performanceScopeInitial,
} from './teamPlayersModule.constants.js'

export default function useTeamPlayersModuleModel({
  entity,
  context,
  profileData,
  playersInsightsRequest = 0,
  onPlayersInsightsStatusChange,
}) {
  const initialInsightsRequestRef = useRef(playersInsightsRequest)
  const didMountRef = useRef(false)
  const lastInsightsStatusRef = useRef('')

  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []

    return teams.find(t => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const calculationGames = useMemo(() => {
    return profileData?.games?.playedLeagueGames || []
  }, [profileData?.games?.playedLeagueGames])

  const rows = profileData?.players?.rows || []
  const summary = profileData?.players?.summary || {}

  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editingPosition, setEditingPosition] = useState(null)
  const [filters, setFilters] = useState(emptyTeamPlayersFilters)
  const [insightsEnabled, setInsightsEnabled] = useState(false)

  const [sort, setSort] = useState({
    by: 'level',
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
      performanceRows: insightsModel?.playerPerformanceRows,
    })
  }, [rows, insightsModel?.playerPerformanceRows])

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

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    if (
      playersInsightsRequest > 0 &&
      playersInsightsRequest !== initialInsightsRequestRef.current &&
      insightsReady
    ) {
      setInsightsOpen(true)
    }
  }, [playersInsightsRequest, insightsReady])

  const handleChangeFilters = patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(emptyTeamPlayersFilters)
  }

  const handleChangeSortBy = value => {
    setSort(prev => ({
      ...prev,
      by: value,
    }))
  }

  const handleChangeSortDirection = value => {
    setSort(prev => ({
      ...prev,
      direction: value,
    }))
  }

  const handleAvatarClick = row => {
    setImgRow(row)
    setRowPhoto(row?.photo || '')
    setOpenImg(true)
  }

  const handleAfterImageSave = url => {
    const next = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
    setRowPhoto(next)
  }

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

    setInsightsOpen,
    setEditingPlayer,
    setEditingPosition,
    setOpenImg,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleAvatarClick,
    handleAfterImageSave,
  }
}
