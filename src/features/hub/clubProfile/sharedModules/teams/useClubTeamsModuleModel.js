// clubProfile/sharedModules/teams/useClubTeamsModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  CLUB_TEAMS_DEFAULT_FILTERS,
  applyClubTeamsFilters,
  buildClubTeamRows,
  sortClubTeamsRows,
} from '../../sharedLogic/teams/index.js'

export default function useClubTeamsModuleModel({
  entity,
  context,
  profileData,
  teamsInsightsRequest = 0,
  initialSortDirection = 'asc',
}) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []

    return clubs.find(club => club?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [filters, setFilters] = useState(CLUB_TEAMS_DEFAULT_FILTERS)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)

  const [sort, setSort] = useState({
    by: 'name',
    direction: initialSortDirection,
  })

  const { rows, summary } = useMemo(() => {
    return buildClubTeamRows({
      club: liveClub,
      teams: profileData?.teams || [],
      profileData,
    })
  }, [liveClub, profileData])

  const filteredRows = useMemo(() => {
    const filtered = applyClubTeamsFilters(rows, filters)

    return sortClubTeamsRows(filtered, sort)
  }, [rows, filters, sort])

  useEffect(() => {
    if (teamsInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [teamsInsightsRequest])

  const handleChangeFilters = patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(CLUB_TEAMS_DEFAULT_FILTERS)
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
    editingTeam,

    setInsightsOpen,
    setEditingTeam,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
  }
}
