// playerProfile/mobile/modules/games/playerGamesModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import PlayerGamesToolbar from './components/PlayerGamesToolbar.js'
import PlayerGamesList from './components/PlayerGamesList.js'
import PlayerGamesInsightsDrawer from './components/insightsDrawer/PlayerGamesInsightsDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'

import {
  createInitialPlayerGamesFilters,
  resolvePlayerGamesFiltersDomain,
} from './../../../sharedLogic'

import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerGamesModule({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const initialFilters = useMemo(() => createInitialPlayerGamesFilters(), [])

  const [filters, setFilters] = useState(initialFilters)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingEntryGame, setEditingEntryGame] = useState(null)

  const domain = useMemo(() => {
    return resolvePlayerGamesFiltersDomain(livePlayer, filters, {
      seasonStartYear: 2025,
    })
  }, [livePlayer, filters])

  const { summary, games, options, indicators } = domain || {}

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialPlayerGamesFilters())
  }

  const hasRows = Array.isArray(games) && games.length > 0
  const hasAnyGames = Array.isArray(livePlayer?.playerGames) && livePlayer.playerGames.length > 0

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <PlayerGamesToolbar
          summary={summary}
          filters={filters}
          indicators={indicators}
          options={options}
          onOpenInsights={() => setInsightsOpen(true)}
          onChangeFilters={handleChangeFilters}
          onResetFilters={handleResetFilters}
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
          rows={games}
          onEditEntryGame={(game) => setEditingEntryGame(game || null)}
        />
      )}

      <PlayerGamesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        games={games}
        player={livePlayer}
      />

      <EntryEditDrawer
        open={!!editingEntryGame}
        game={editingEntryGame}
        onClose={() => setEditingEntryGame(null)}
        onSaved={() => {}}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />
    </SectionPanelMobile>
  )
}
