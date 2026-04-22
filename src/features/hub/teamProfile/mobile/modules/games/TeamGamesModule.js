// teamProfile/mobile/modules/games/TeamGamesModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import TeamGamesList from './components/TeamGamesList.js'
import TeamGamesToolbar from './components/toolbar/TeamGamesToolbar.js'
import TeamGamesInsightsDrawer from './components/insightsDrawer/TeamGamesInsightsDrawer.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import EntryEditDrawer from './components/entryDrawer/EntryEditDrawer.js'

import {
  createInitialTeamGamesFilters,
  resolveTeamGamesFiltersDomain,
} from '../../../sharedLogic/games'

import { profileSx as sx } from './../../sx/profile.sx'

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
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <TeamGamesToolbar
          summary={summary}
          filters={filters}
          indicators={indicators}
          options={options}
          onOpenInsights={() => setInsightsOpen(true)}
          onChangeFilters={handleChangeFilters}
          onResetFilters={handleResetFilters}
        />

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
      </Box>

      <TeamGamesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        games={games}
        team={liveTeam}
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
    </SectionPanelMobile>
  )
}
