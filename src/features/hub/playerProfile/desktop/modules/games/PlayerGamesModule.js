// playerProfile/desktop/modules/games/PlayerGamesModule.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import PlayerGamesToolbar from './components/toolbar/PlayerGamesToolbar.js'
import PlayerGamesList from './components/PlayerGamesList.js'
import PlayerGamesInsightsDrawer from './components/insightsDrawer/PlayerGamesInsightsDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'

import {
  createInitialPlayerGamesFilters,
  resolvePlayerGamesFiltersDomain,
  sortPlayerGamesRows
} from './../../../sharedLogic'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export default function PlayerGamesModule({
  entity,
  context,
  gamesInsightsRequest = 0,
}) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const initialFilters = useMemo(() => createInitialPlayerGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })

  const domain = useMemo(() => {
    return resolvePlayerGamesFiltersDomain(livePlayer, filters, {
      seasonStartYear: 2025,
    })
  }, [livePlayer, filters])

  const { summary, games, options, indicators } = domain || {}

  const sortedGames = useMemo(() => {
    return sortPlayerGamesRows(games, sort)
  }, [games, sort])

  useEffect(() => {
    if (gamesInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [gamesInsightsRequest])

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialPlayerGamesFilters())
  }

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0
  const hasAnyGames = Array.isArray(livePlayer?.playerGames) && livePlayer.playerGames.length > 0

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
          <PlayerGamesToolbar
            summary={summary}
            filters={filters}
            indicators={indicators}
            options={options}
            onChangeFilters={handleChangeFilters}
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={(value) => setSort((prev) => ({ ...prev, by: value }))}
            onChangeSortDirection={(value) => setSort((prev) => ({ ...prev, direction: value }))}
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
          <PlayerGamesList
            rows={sortedGames}
            onEditEntryGame={(game) => setEditingEntryGame(game || null)}
          />
        )}
      </SectionPanel>

      <EntryEditDrawer
        open={!!editingEntryGame}
        game={editingEntryGame}
        onClose={() => setEditingEntryGame(null)}
        onSaved={() => {}}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />

      <PlayerGamesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        summary={summary}
        games={sortedGames}
        entity={livePlayer}
      />
    </>
  )
}
