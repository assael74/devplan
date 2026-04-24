// clubProfile/mobile/modules/teams/ClubTeamsModule.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import ClubTeamsToolbar from './components/toolbar/ClubTeamsToolbar.js'
import ClubTeamsList from './components/ClubTeamsList.js'
import ClubTeamsInsightsDrawer from './components/insightsDrawer/ClubTeamsInsightsDrawer.js'

import {
  CLUB_TEAMS_DEFAULT_FILTERS,
  applyClubTeamsFilters,
  buildClubTeamRows,
  sortClubTeamsRows,
} from '../../../sharedLogic/teams/index.js'

import { profileSx as sx } from './../../sx/profile.sx'

export default function ClubTeamsModule({
  entity,
  onOpenTeam,
  context,
  teamsInsightsOpen,
  setTeamsInsightsOpen,
  teamsInsightsRequest = 0,
}) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((club) => club?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [filters, setFilters] = useState(CLUB_TEAMS_DEFAULT_FILTERS)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [sort, setSort] = useState({
    by: 'name',
    direction: 'asc',
  })

  const { rows, summary } = useMemo(() => {
    return buildClubTeamRows({ club: liveClub })
  }, [liveClub])

  const filteredRows = useMemo(() => {
    const filtered = applyClubTeamsFilters(rows, filters)
    return sortClubTeamsRows(filtered, sort)
  }, [rows, filters, sort])

  useEffect(() => {
    if (teamsInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [teamsInsightsRequest])

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <ClubTeamsToolbar
          summary={summary}
          filters={filters}
          totalCount={rows.length}
          filteredCount={filteredRows.length}
          onChangeSearch={(value) =>
            setFilters((prev) => ({ ...prev, search: value || '' }))
          }
          onToggleOnlyActive={() =>
            setFilters((prev) => ({ ...prev, onlyActive: !prev.onlyActive }))
          }
          onToggleOnlyProject={() =>
            setFilters((prev) => ({ ...prev, onlyProject: !prev.onlyProject }))
          }
          onResetFilters={() => setFilters(CLUB_TEAMS_DEFAULT_FILTERS)}
          sortBy={sort.by}
          sortDirection={sort.direction}
          onChangeSortBy={(value) => setSort((prev) => ({ ...prev, by: value }))}
          onChangeSortDirection={(value) =>
            setSort((prev) => ({ ...prev, direction: value }))
          }
        />
      </Box>

      {!filteredRows.length ? (
        <EmptyState
          title="אין קבוצות"
          subtitle="בדוק את הפילטרים או אפס את הסינון"
        />
      ) : (
        <ClubTeamsList
          rows={filteredRows}
          onOpenTeam={onOpenTeam}
          onEditTeam={(row) => setEditingTeam(row?.team || row || null)}
        />
      )}

      <ClubTeamsInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={filteredRows}
        summary={summary}
        entity={liveClub}
      />
    </SectionPanelMobile>
  )
}
