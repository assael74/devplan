// clubProfile/desktop/modules/teams/ClubTeamsModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { buildClubTeamRows } from './logic/clubTeams.logic.js'
import {
  CLUB_TEAMS_DEFAULT_FILTERS,
  applyClubTeamsFilters,
} from './logic/clubTeams.filters.js'

import ClubTeamsToolbar from './components/ClubTeamsToolbar.js'
import ClubTeamsList from './components/ClubTeamsList.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import ClubTeamsInsightsDrawer from './components/insightsDrawer/ClubTeamsInsightsDrawer.js'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('clubs')

export default function ClubTeamsModule({
  entity,
  context,
}) {
  const liveClub = useMemo(() => {
    const clubs = Array.isArray(context?.clubs) ? context.clubs : []
    return clubs.find((club) => club?.id === entity?.id) || entity || null
  }, [context?.clubs, entity])

  const [filters, setFilters] = useState(CLUB_TEAMS_DEFAULT_FILTERS)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)

  const { rows, summary } = useMemo(() => {
    return buildClubTeamRows({club: liveClub})
  }, [liveClub])

  const filteredRows = useMemo(() => {
    return applyClubTeamsFilters(rows, filters)
  }, [rows, filters])

  return (
    <>
      <SectionPanel>
        <Box
          sx={{
            position: 'sticky',
            top: -6,
            zIndex: 5,
            display: 'grid',
            gap: 1,
            borderRadius: 12,
            bgcolor: 'background.body',
            mb: 0.5,
            boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
          }}
        >
          <ClubTeamsToolbar
            summary={summary}
            filters={filters}
            filteredCount={filteredRows.length}
            onOpenInsights={() => setInsightsOpen(true)}
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
          />
        </Box>

        {!filteredRows.length ? (
          <EmptyState
            title="אין קבוצות להצגה"
            subtitle="נסה לשנות פילטרים או לאפס את החיפוש"
          />
        ) : (
          <ClubTeamsList
            rows={filteredRows}
            onEditTeam={(team) => setEditingTeam(team || null)}
          />
        )}
      </SectionPanel>

      <ClubTeamsInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={rows}
        summary={summary}
        entity={liveClub}
      />

      <EditDrawer
        open={!!editingTeam}
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSaved={() => {}}
        context={{ ...context, clubId: liveClub?.id, club: liveClub }}
      />
    </>
  )
}
