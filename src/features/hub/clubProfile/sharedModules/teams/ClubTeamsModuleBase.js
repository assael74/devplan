// clubProfile/sharedModules/teams/ClubTeamsModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'

import useClubTeamsModuleModel from './useClubTeamsModuleModel.js'
import { clubTeamsModuleSx } from './clubTeamsModule.sx.js'

export default function ClubTeamsModuleBase({
  entity,
  onOpenTeam,
  context,
  profileData,
  teamsInsightsRequest = 0,

  Section,
  isMobile = false,
  toolbarWrapSx,
  initialSortDirection = 'asc',

  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
  EditDrawerComponent,
}) {
  const model = useClubTeamsModuleModel({
    entity,
    context,
    profileData,
    teamsInsightsRequest,
    initialSortDirection,
  })

  const {
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
  } = model

  const Wrap = Section
  const finalToolbarWrapSx =
    toolbarWrapSx || clubTeamsModuleSx.desktopToolbarWrap

  return (
    <>
      <Wrap>
        <Box sx={finalToolbarWrapSx}>
          <ToolbarComponent
            summary={summary}
            filters={filters}
            totalCount={rows.length}
            filteredCount={filteredRows.length}
            onChangeSearch={value =>
              handleChangeFilters({ search: value || '' })
            }
            onToggleOnlyActive={() =>
              handleChangeFilters({ onlyActive: !filters.onlyActive })
            }
            onToggleOnlyProject={() =>
              handleChangeFilters({ onlyProject: !filters.onlyProject })
            }
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={handleChangeSortBy}
            onChangeSortDirection={handleChangeSortDirection}
          />
        </Box>

        {!filteredRows.length ? (
          <EmptyState
            title={isMobile ? 'אין קבוצות' : 'אין קבוצות להצגה'}
            subtitle={
              isMobile
                ? 'בדוק את הפילטרים או אפס את הסינון'
                : 'נסה לשנות פילטרים או לאפס את החיפוש'
            }
          />
        ) : (
          <ListComponent
            rows={filteredRows}
            profileData={profileData}
            onOpenTeam={onOpenTeam}
            onEditTeam={row => setEditingTeam(row?.team || row || null)}
          />
        )}
      </Wrap>

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={filteredRows}
        summary={summary}
        entity={liveClub}
      />

      <EditDrawerComponent
        open={!!editingTeam}
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSaved={() => {}}
        context={{ ...context, clubId: liveClub?.id, club: liveClub }}
      />
    </>
  )
}
