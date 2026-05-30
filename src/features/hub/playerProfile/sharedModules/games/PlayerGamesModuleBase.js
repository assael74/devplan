// playerProfile/sharedModules/games/PlayerGamesModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'

import usePlayerGamesModuleModel from './usePlayerGamesModuleModel.js'
import { playerGamesModuleSx } from './playerGamesModule.sx.js'

export default function PlayerGamesModuleBase({
  entity,
  context,
  profileData,
  gamesInsightsRequest = 0,
  seasonStartYear = 2025,

  Section,
  toolbarWrapSx,

  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
  EntryEditDrawerComponent,
  EditDrawerComponent,
}) {
  const model = usePlayerGamesModuleModel({
    entity,
    context,
    profileData,
    gamesInsightsRequest,
    seasonStartYear,
  })

  const {
    livePlayer,
    liveTeam,
    playerScoring,

    summary,
    options,
    indicators,
    calculationGames,
    sortedGames,

    filters,
    sort,

    insightsOpen,
    editingEntryGame,
    editingGame,

    hasRows,
    hasAnyGames,

    setInsightsOpen,
    setEditingEntryGame,
    setEditingGame,
    setEditingStatsGame,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleEditGame,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx =
    toolbarWrapSx || playerGamesModuleSx.desktopToolbarWrap

  return (
    <>
      <Wrap>
        <Box sx={finalToolbarWrapSx}>
          <ToolbarComponent
            summary={summary}
            filters={filters}
            indicators={indicators}
            options={options}
            onChangeFilters={handleChangeFilters}
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={handleChangeSortBy}
            onChangeSortDirection={handleChangeSortDirection}
          />
        </Box>

        {!hasRows ? (
          <EmptyState
            title="אין משחקים"
            subtitle={
              hasAnyGames
                ? 'לא נמצאו משחקים לפי הפילטרים שנבחרו'
                : 'עדיין לא נוספו משחקים לשחקן'
            }
          />
        ) : (
          <ListComponent
            rows={sortedGames}
            player={livePlayer}
            scoring={playerScoring}
            onEdit={handleEditGame}
            onEditEntry={game => setEditingEntryGame(game || null)}
            onEditStatsGame={game => setEditingStatsGame(game || null)}
          />
        )}
      </Wrap>

      <EntryEditDrawerComponent
        open={!!editingEntryGame}
        game={editingEntryGame}
        onClose={() => setEditingEntryGame(null)}
        onSaved={() => setEditingEntryGame(null)}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />

      <EditDrawerComponent
        open={!!editingGame}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSaved={() => setEditingGame(null)}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        summary={summary}
        games={calculationGames}
        player={livePlayer}
        team={liveTeam}
        scoring={playerScoring}
        profileData={profileData}
      />
    </>
  )
}
