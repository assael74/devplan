// clubProfile/sharedModules/players/useClubPlayersModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import usePlayerRowImageModel from '../../../sharedProfile/hooks/usePlayerRowImageModel.js'

import {
  CLUB_PLAYERS_DEFAULT_FILTERS,
  filterClubPlayersRows,
  buildClubPlayerRows,
  sortClubPlayersRows,
} from '../../sharedLogic/players/index.js'

export default function useClubPlayersModuleModel({
  entity,
  context,
  profileData,
  playersInsightsRequest = 0,
}) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []

    return clubs.find(club => club?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

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
  const [filters, setFilters] = useState(CLUB_PLAYERS_DEFAULT_FILTERS)

  const [sort, setSort] = useState({
    by: 'level',
    direction: 'desc',
  })

  const { rows, summary } = useMemo(() => {
    return buildClubPlayerRows({
      club: liveClub,
      players: profileData?.players || [],
      performanceById: profileData?.playersScoring?.byId || {},
    })
  }, [liveClub, profileData])

  const filteredRows = useMemo(() => {
    const filtered = filterClubPlayersRows(rows, filters, {
      performanceById: profileData?.playersScoring?.byId || {},
    })

    return sortClubPlayersRows(filtered, sort)
  }, [rows, filters, sort, profileData])

  useEffect(() => {
    if (playersInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [playersInsightsRequest])

  const handleChangeFilters = patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(CLUB_PLAYERS_DEFAULT_FILTERS)
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


  return {
    liveClub,

    rows,
    summary,
    filteredRows,

    filters,
    sort,

    insightsOpen,
    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly,

    setInsightsOpen,
    setOpenImg,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleAvatarClick,
    handleAfterImageSave,
  }
}
