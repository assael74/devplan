// features/playersDatabase/ui/pages/leaguePage/LeaguePage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeaguePage } from '../../hooks/useLeaguePage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueHeader from './LeagueHeader.js'
import LeagueStatsOverview from './LeagueStatsOverview.js'
import LeagueActionsPanel from './LeagueActionsPanel.js'
import LeagueTeamsTable from './LeagueTeamsTable.js'
import LeagueImportModal from './LeagueImportModal.js'
import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import { useLeagueTableImport } from './hooks/useLeagueTableImport.js'
import useTeamUrlEditor from './hooks/useTeamUrlEditor.js'
import {
  buildLeagueImportColumns,
  LEAGUE_IMPORT_PLACEHOLDER,
} from './logic/leagueImport.columns.js'
import { splitLeagueTitle } from './logic/leaguePage.logic.js'
import { leaguePageSx as sx } from './sx/leaguePage.sx.js'

export default function LeaguePage() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const [attackPriorityFilter, setAttackPriorityFilter] = React.useState('')
  const [defensePriorityFilter, setDefensePriorityFilter] = React.useState('')
  const {
    league,
    leagueDoc,
    teams,
    summary,
    seasonOptions,
    birthYearOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    setSelectedBirthYear,
    reload,
    loading,
    error,
  } = useLeaguePage()

  const teamUrlEditor = useTeamUrlEditor({
    leagueId: league.id,
    leagueDoc,
    selectedSeasonOption,
    notify,
    reload,
  })
  const leagueImport = useLeagueTableImport({
    league,
    leagueDoc,
    selectedSeasonOption,
    reload,
  })

  const importColumns = React.useMemo(() => (
    buildLeagueImportColumns(leagueImport.rows)
  ), [leagueImport.rows])

  const filteredTeams = React.useMemo(() => (
    teams.filter(team => (
      (!attackPriorityFilter || team.attackPriority === attackPriorityFilter)
      && (!defensePriorityFilter || team.defensePriority === defensePriorityFilter)
    ))
  ), [teams, attackPriorityFilter, defensePriorityFilter])

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'מרכז ליגות', to: PLAYERS_DATABASE_UI_ROUTES.leagues },
    { label: league.name },
  ])
  const titleParts = splitLeagueTitle(league)
  const isActiveLeague = selectedSeasonOption?.target === 'current'

  const handleTeamOpen = team => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: league.id,
      teamId: team.id,
      seasonKey: selectedSeasonKey,
    }))
  }

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <LeagueHeader
          breadcrumbs={breadcrumbs}
          title={titleParts.name}
          region={titleParts.region}
          ageGroup={league.ageGroup}
          levelLabel={league.levelLabel}
          active={isActiveLeague}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onBack={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)}
        />

        <LeagueStatsOverview
          summary={summary}
          roundsCount={league.leagueTotalRound}
        />

        <Box sx={sx.contentGrid}>
          <LeagueTeamsTable
            rows={filteredTeams}
            loading={loading}
            error={error}
            onTeamOpen={handleTeamOpen}
            onTeamUrlEdit={teamUrlEditor.open}
          />

          <LeagueActionsPanel
            selectedSeasonKey={selectedSeasonKey}
            seasonOptions={seasonOptions}
            selectedBirthYear={league.birthYear}
            birthYearOptions={birthYearOptions}
            onSeasonChange={setSelectedSeasonKey}
            onBirthYearChange={setSelectedBirthYear}
            attackPriorityFilter={attackPriorityFilter}
            defensePriorityFilter={defensePriorityFilter}
            onAttackPriorityFilterChange={setAttackPriorityFilter}
            onDefensePriorityFilterChange={setDefensePriorityFilter}
            onLoad={leagueImport.handleOpen}
          />
        </Box>
      </Box>

      <TeamUrlEditDrawer
        open={Boolean(teamUrlEditor.row)}
        row={teamUrlEditor.row}
        seasonLabel={selectedSeasonOption?.seasonKey || selectedSeasonKey}
        saving={teamUrlEditor.saving}
        onSave={teamUrlEditor.save}
        onClose={teamUrlEditor.close}
      />

      <LeagueImportModal
        league={league}
        columns={importColumns}
        leagueImport={leagueImport}
        placeholder={LEAGUE_IMPORT_PLACEHOLDER}
      />
    </PlayersDatabaseLayout>
  )
}
