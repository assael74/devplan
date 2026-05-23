// teamProfile/mobile/modules/games/TeamGamesModule.js

import React, { useMemo, useState, useEffect } from 'react'
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
  sortTeamGamesRows
} from '../../../sharedLogic/games'

import { profileSx as sx } from './../../sx/profile.sx'

export default function TeamGamesModule({
  entity,
  context,
  profileData,
  gamesInsightsOpen,
  setGamesInsightsOpen,
  gamesInsightsRequest = 0,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const initialFilters = useMemo(() => createInitialTeamGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })
  const [performanceView, setPerformanceView] = useState('team')

  const teamScoring =
    profileData?.teamScoring ||
    profileData?.scoring?.team ||
    null

  const playerScoring =
    profileData?.playerScoring ||
    profileData?.scoring?.players ||
    profileData?.scoring ||
    null

  const teamScoringByGameId = teamScoring?.byGameId || {}
  const playerScoringByGameId = playerScoring?.byGameId || {}

  const domain = useMemo(() => {
    return resolveTeamGamesFiltersDomain(liveTeam, filters, {
      seasonStartYear: 2025,
      teamScoringByGameId,
    })
  }, [liveTeam, filters, teamScoringByGameId])

  const { summary, games, options, indicators } = domain || {}

  const calculationGames = useMemo(() => {
    return profileData?.games?.playedLeagueGames || []
  }, [profileData?.games?.playedLeagueGames])

  const scoringByGameId = profileData?.scoring?.byGameId || {}

  const sortedGames = useMemo(() => {
    return sortTeamGamesRows(games, sort)
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
    setFilters(createInitialTeamGamesFilters())
  }

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0
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
          sortBy={sort.by}
          performanceView={performanceView}
          onChangePerformanceView={setPerformanceView}
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
              : 'עדיין לא נוספו משחקים לקבוצה'
          }
        />
      ) : (
        <TeamGamesList
          rows={sortedGames}
          performanceView={performanceView}
          onChangePerformanceView={setPerformanceView}
          onEditGame={(game) => setEditingGame(game || null)}
          onEditEntryGame={(game) => setEditingEntryGame(game || null)}
        />
      )}

      <TeamGamesInsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        summary={summary}
        games={calculationGames}
        team={liveTeam}
        scoringByGameId={scoringByGameId}
        profileData={profileData}
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
