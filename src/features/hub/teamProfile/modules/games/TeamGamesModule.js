// teamProfile/modules/games/TeamGamesModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import TeamGamesToolbar from './components/TeamGamesToolbar.js'
import TeamGamesList from './components/TeamGamesList.js'
import TeamGamesInsightsDrawer from './components/insightsDrawer/TeamGamesInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'

import {
  createInitialTeamGamesFilters,
  resolveTeamGamesFiltersDomain,
} from './logic/teamGames.filters.logic.js'

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export default function TeamGamesModule({ entity, context }) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const initialFilters = useMemo(() => createInitialTeamGamesFilters(), [])

  const [filters, setFilters] = useState(initialFilters)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [editingEntryGame, setEditingEntryGame] = useState(null)

  const domain = useMemo(() => {
    return resolveTeamGamesFiltersDomain(liveTeam, filters, {
      seasonStartYear: 2025,
    })
  }, [liveTeam, filters])
  
  const { summary, games, options, indicators } = domain || {}

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialTeamGamesFilters())
  }

  const hasRows = Array.isArray(games) && games.length > 0
  const hasAnyGames = Array.isArray(liveTeam?.teamGames) && liveTeam.teamGames.length > 0

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
          <TeamGamesToolbar
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
                : 'עדיין לא נוספו משחקים לקבוצה'
            }
          />
        ) : (
          <TeamGamesList
            rows={games}
            onEditGame={(game) => setEditingGame(game || null)}
            onEditEntryGame={(game) => setEditingEntryGame(game || null)}
          />
        )}
      </SectionPanel>

      <TeamGamesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        games={games}
        entity={liveTeam}
      />

      <EditDrawer
        open={!!editingGame}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSaved={() => {}}
        context={{ ...context, teamId: liveTeam?.id, team: liveTeam }}
      />

      <EntryEditDrawer
        open={!!editingEntryGame}
        game={editingEntryGame}
        onClose={() => setEditingEntryGame(null)}
        onSaved={() => {}}
        context={{ ...context, teamId: liveTeam?.id, team: liveTeam }}
      />
    </>
  )
}
