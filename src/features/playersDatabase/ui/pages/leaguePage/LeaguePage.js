// features/playersDatabase/ui/pages/leaguePage/LeaguePage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
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
import { SeasonDeleteConfirmModal, WriteFlowReportModal } from '../../components/modals/index.js'
import { useLeagueTableImport } from './hooks/useLeagueTableImport.js'
import useTeamUrlEditor from './hooks/useTeamUrlEditor.js'
import useLeagueSeasonTeamsDelete from './hooks/useLeagueSeasonTeamsDelete.js'
import {
  buildLeagueImportColumns,
  LEAGUE_IMPORT_PLACEHOLDER,
} from './logic/leagueImport.columns.js'
import { splitLeagueTitle } from './logic/leaguePage.logic.js'
import { ReportPreviewModal } from '../../../../reports/external/ui/index.js'
import { useLeagueReport } from './report/index.js'
import { leaguePageSx as sx } from './sx/leaguePage.sx.js'


function LeaguePageContent() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
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

  const teamsWithFavorites = React.useMemo(() => (
    teams.map(team => ({
      ...team,
      favorite: favorites.isBirthTeamFavorite(team.birthTeamId),
      favoritePending: favorites.isFavoritePending(
        PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
        team.birthTeamId
      ),
    }))
  ), [favorites, teams])

  const teamUrlEditor = useTeamUrlEditor({
    leagueId: league.id,
    leagueDoc,
    selectedSeasonOption,
    notify,
    reload,
  })
  const teamsDelete = useLeagueSeasonTeamsDelete({
    league,
    leagueDoc,
    selectedSeasonOption,
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
    teamsWithFavorites.filter(team => {
      const attackLevel = team.performanceView?.offense?.priority?.level || ''
      const defenseLevel = team.performanceView?.defense?.priority?.level || ''

      return (
        (!attackPriorityFilter || attackLevel === attackPriorityFilter)
        && (!defensePriorityFilter || defenseLevel === defensePriorityFilter)
      )
    })
  ), [
    teamsWithFavorites,
    attackPriorityFilter,
    defensePriorityFilter,
  ])


  const selectedBirthYear = selectedSeasonOption?.season?.birthYear || league.birthYear
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מרכז ליגות',
      to: PLAYERS_DATABASE_UI_ROUTES.leagues({
        seasonKey: selectedSeasonKey,
        birthYear: selectedBirthYear,
      }),
    },
    { label: league.name },
  ])
  const titleParts = splitLeagueTitle(league)
  const isActiveLeague = selectedSeasonOption?.target === 'current'
  const leagueReport = useLeagueReport({
    league,
    teams: filteredTeams,
    summary,
    seasonKey: selectedSeasonKey,
  })

  const handleTeamOpen = team => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: league.id,
      teamId: team.id,
      seasonKey: selectedSeasonKey,
    }))
  }

  const handleFavoriteToggle = team => {
    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
      entityId: team.birthTeamId,
    }

    if (favorites.isBirthTeamFavorite(team.birthTeamId)) {
      return favorites.removeFavorite(payload)
    }

    return favorites.addFavorite({
      ...payload,
      displayName: team.name,
      birthYear: league.birthYear,
    })
  }

  return (
    <>
      <Box sx={sx.page}>
        <LeagueHeader
          breadcrumbs={breadcrumbs}
          title={titleParts.name}
          region={titleParts.region}
          ageGroup={league.ageGroup}
          levelLabel={league.levelLabel}
          active={isActiveLeague}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onBack={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues({
            seasonKey: selectedSeasonKey,
            birthYear: selectedBirthYear,
          }))}
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
            selectedSeasonOption={selectedSeasonOption}
            onTeamOpen={handleTeamOpen}
            onTeamUrlEdit={teamUrlEditor.open}
            onFavoriteToggle={handleFavoriteToggle}
          />

          <LeagueActionsPanel
            selectedSeasonKey={selectedSeasonKey}
            seasonOptions={seasonOptions}
            selectedBirthYear={selectedBirthYear}
            birthYearOptions={birthYearOptions}
            onSeasonChange={setSelectedSeasonKey}
            onBirthYearChange={setSelectedBirthYear}
            attackPriorityFilter={attackPriorityFilter}
            defensePriorityFilter={defensePriorityFilter}
            onAttackPriorityFilterChange={setAttackPriorityFilter}
            onDefensePriorityFilterChange={setDefensePriorityFilter}
            onLoad={leagueImport.handleOpen}
            onDeleteTeams={() => teamsDelete.setOpen(true)}
            onReport={leagueReport.openPreview}
          />
        </Box>
      </Box>

      <ReportPreviewModal
        open={leagueReport.open}
        draft={leagueReport.draft}
        busy={leagueReport.busy}
        publication={leagueReport.publication}
        onPublish={leagueReport.publish}
        onClose={leagueReport.closePreview}
      />

      <TeamUrlEditDrawer
        open={Boolean(teamUrlEditor.row)}
        row={teamUrlEditor.row}
        seasonLabel={selectedSeasonOption?.seasonKey || selectedSeasonKey}
        saving={teamUrlEditor.saving}
        onSave={teamUrlEditor.save}
        onClose={teamUrlEditor.close}
      />


      <SeasonDeleteConfirmModal
        open={teamsDelete.open}
        title='מחיקת קבוצות העונה'
        description='עונת הליגה תישאר קיימת, אך כל עונות הקבוצות והאינדקסים של העונה הנבחרת יימחקו.'
        seasonKey={selectedSeasonKey}
        busy={teamsDelete.busy}
        confirmLabel='מחיקת קבוצות העונה'
        onConfirm={teamsDelete.confirm}
        onClose={teamsDelete.close}
      />

      <WriteFlowReportModal
        open={Boolean(teamsDelete.writeReport)}
        report={teamsDelete.writeReport}
        onClose={teamsDelete.closeWriteReport}
      />

      <LeagueImportModal
        league={league}
        columns={importColumns}
        leagueImport={leagueImport}
        placeholder={LEAGUE_IMPORT_PLACEHOLDER}
      />

      <WriteFlowReportModal
        open={Boolean(leagueImport.writeReport)}
        report={leagueImport.writeReport}
        onClose={leagueImport.closeWriteReport}
      />
    </>
  )
}

export default function LeaguePage() {
  return (
    <PlayersDatabaseLayout>
      <LeaguePageContent />
    </PlayersDatabaseLayout>
  )
}
