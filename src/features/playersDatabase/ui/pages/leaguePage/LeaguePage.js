// src/features/playersDatabase/ui/pages/leaguePage/LeaguePage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeaguePage } from '../../hooks/useLeaguePage.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueHeader from './LeagueHeader.js'
import LeagueKpiOverview from './LeagueKpiOverview.js'
import LeagueActionsPanel from './LeagueActionsPanel.js'
import LeagueTeamsTable from './LeagueTeamsTable.js'
import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import LeagueUrlEditDrawer from '../../components/drawers/LeagueUrlEditDrawer.js'
import {
  LeagueImportModal,
  SeasonDeleteConfirmModal,
  TaskEditModal,
  WorkTaskModal,
  WriteFlowReportModal,
} from '../../components/modals/index.js'
import { useLeagueTableImport } from './hooks/useLeagueTableImport.js'
import useTeamUrlEditor from './hooks/useTeamUrlEditor.js'
import useLeagueUrlEditor from './hooks/useLeagueUrlEditor.js'
import useLeagueSeasonTeamsDelete from './hooks/useLeagueSeasonTeamsDelete.js'
import {
  buildLeagueImportColumns,
  LEAGUE_IMPORT_PLACEHOLDER,
} from './logic/leagueImport.columns.js'
import { splitLeagueTitle } from './logic/leaguePage.logic.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import { useLeagueReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'


const PRIORITY_RANK = {
  low: 1,
  neutral: 2,
  positive: 3,
  high: 4,
  elite: 5,
}

const matchesPriorityThreshold = (level, threshold) => {
  if (!threshold) return true
  return (PRIORITY_RANK[level] || 0) >= (PRIORITY_RANK[threshold] || 0)
}

const buildPriorityCounts = (teams, side) => {
  const getLevel = team => side === 'attack'
    ? team.performanceView?.offense?.priority?.level || ''
    : team.performanceView?.defense?.priority?.level || ''

  return {
    all: teams.length,
    positive: teams.filter(team => matchesPriorityThreshold(getLevel(team), 'positive')).length,
    high: teams.filter(team => matchesPriorityThreshold(getLevel(team), 'high')).length,
    elite: teams.filter(team => matchesPriorityThreshold(getLevel(team), 'elite')).length,
  }
}

function LeaguePageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [attackPriorityFilter, setAttackPriorityFilter] = React.useState('')
  const [defensePriorityFilter, setDefensePriorityFilter] = React.useState('')
  const [taskModalOpen, setTaskModalOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState(null)
  const {
    league,
    leagueDoc,
    teams,
    summary,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    reload,
    loading,
    error,
    selectionError,
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
  const leagueUrlEditor = useLeagueUrlEditor({
    league,
    leagueDoc,
    selectedSeasonOption,
    notify,
    reload,
  })
  const attackPriorityCounts = React.useMemo(
    () => buildPriorityCounts(teamsWithFavorites, 'attack'),
    [teamsWithFavorites]
  )
  const defensePriorityCounts = React.useMemo(
    () => buildPriorityCounts(teamsWithFavorites, 'defense'),
    [teamsWithFavorites]
  )
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
        matchesPriorityThreshold(attackLevel, attackPriorityFilter)
        && matchesPriorityThreshold(defenseLevel, defensePriorityFilter)
      )
    })
  ), [
    teamsWithFavorites,
    attackPriorityFilter,
    defensePriorityFilter,
  ])


  const leagueTasks = React.useMemo(() => (
    tasksModel.tasks.filter(task => {
      const context = task?.workContext || {}
      const sameLeague = String(context.leagueId || '') === String(league.id || '')
      const sameSeason = String(context.seasonKey || '') === String(selectedSeasonKey || '')
      return sameLeague && sameSeason
    })
  ), [
    league.id,
    selectedSeasonKey,
    tasksModel.tasks,
  ])

  const leagueTaskContext = React.useMemo(() => ({
    league,
    seasonKey: selectedSeasonKey,
    teams,
    url: `${location.pathname}${location.search}`,
  }), [
    league,
    location.pathname,
    location.search,
    selectedSeasonKey,
    teams,
  ])

  const pageSearchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const hasCenterContext = (
    pageSearchParams.has('centerSeason') ||
    pageSearchParams.has('centerBirthYear') ||
    pageSearchParams.has('centerLevel')
  )
  const centerBackPath = PLAYERS_DATABASE_UI_ROUTES.leagues({
    seasonKey: hasCenterContext
      ? pageSearchParams.get('centerSeason') || 'all'
      : pageSearchParams.get('season'),
    birthYear: hasCenterContext
      ? pageSearchParams.get('centerBirthYear') || 'all'
      : pageSearchParams.get('birthYear'),
    level: hasCenterContext
      ? pageSearchParams.get('centerLevel') || 'all'
      : pageSearchParams.get('level'),
  })
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מרכז ליגות',
      to: centerBackPath,
    },
    { label: league.name },
  ])
  const titleParts = splitLeagueTitle(league)
  const isActiveLeague = selectedSeasonOption?.target === 'current'
  const isHistoricalLoadedLeague = (
    selectedSeasonOption?.target === 'history' &&
    teams.length > 0
  )
  const leagueReport = useLeagueReport({
    league,
    teams: filteredTeams,
    summary,
    seasonKey: selectedSeasonKey,
  })

  const handleBackToCenter = () => {
    navigate(centerBackPath, {
      replace: true,
      state: null,
    })
  }

  const buildTeamLink = React.useCallback(team => {
    const path = PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: league.id,
      teamId: team.id,
      seasonKey: selectedSeasonKey,
      fromLeague: `${location.pathname}${location.search}`,
    })

    if (typeof window === 'undefined') return path
    return `${window.location.origin}${path}`
  }, [
    league.id,
    location.pathname,
    location.search,
    selectedSeasonKey,
  ])

  const handleTeamOpen = team => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: league.id,
      teamId: team.id,
      seasonKey: selectedSeasonKey,
      fromLeague: `${location.pathname}${location.search}`,
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

  const handleTaskEditSave = async patch => {
    if (!editTask?.id || taskActions.pending) return

    const nextPatch = {
      ...patch,
      doneAt: patch.status === TASK_STATUS.DONE
        ? Date.now()
        : null,
    }

    await taskActions.updateTask(editTask, nextPatch)
    setEditTask(null)
  }

  const handleTaskEditDone = async task => {
    if (!task?.id || taskActions.pending) return

    await taskActions.markDone(task)
    setEditTask(null)
  }

  return (
    <>
      <Box sx={sx.page}>
        <LeagueHeader
          breadcrumbs={breadcrumbs}
          title={titleParts.name}
          region={titleParts.region}
          ageGroup={league.ageGroup}
          level={league.level}
          birthYear={league.birthYear}
          active={isActiveLeague}
          seasonKey={selectedSeasonKey}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onBack={handleBackToCenter}
        />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <LeagueKpiOverview
              summary={summary}
              roundsCount={league.leagueTotalRound}
            />

            <LeagueTeamsTable
              rows={filteredTeams}
              loading={loading}
              error={error || selectionError}
              selectedSeasonOption={selectedSeasonOption}
              leagueName={titleParts.name}
              ageGroup={league.ageGroup}
              birthYear={league.birthYear}
              buildTeamLink={buildTeamLink}
              onTeamOpen={handleTeamOpen}
              onTeamUrlEdit={teamUrlEditor.open}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </Box>

          <LeagueActionsPanel
            selectedSeasonKey={selectedSeasonKey}
            seasonOptions={seasonOptions}
            onSeasonChange={setSelectedSeasonKey}
            attackPriorityFilter={attackPriorityFilter}
            defensePriorityFilter={defensePriorityFilter}
            attackPriorityCounts={attackPriorityCounts}
            defensePriorityCounts={defensePriorityCounts}
            onAttackPriorityFilterChange={setAttackPriorityFilter}
            onDefensePriorityFilterChange={setDefensePriorityFilter}
            onLoad={leagueImport.handleOpen}
            onLeagueUrlEdit={leagueUrlEditor.show}
            hasLeagueUrl={Boolean(selectedSeasonOption?.season?.seasonUrl)}
            loadDisabled={isHistoricalLoadedLeague}
            loadDisabledReason='לא ניתן לטעון נתוני ליגה לעונה היסטורית שכבר כוללת קבוצות'
            onDeleteTeams={() => teamsDelete.setOpen(true)}
            onReport={leagueReport.openPreview}
            tasks={leagueTasks}
            tasksLoading={tasksModel.loading}
            onTaskCreate={() => setTaskModalOpen(true)}
            onTaskEdit={setEditTask}
          />
        </Box>
      </Box>

      <TaskEditModal
        open={Boolean(editTask)}
        task={editTask}
        busy={taskActions.pending}
        onSave={handleTaskEditSave}
        onDone={handleTaskEditDone}
        onClose={() => setEditTask(null)}
      />

      <WorkTaskModal
        open={taskModalOpen}
        leagueContext={leagueTaskContext}
        onClose={() => setTaskModalOpen(false)}
      />

      <ReportPreviewModal
        open={leagueReport.open}
        draft={leagueReport.draft}
        busy={leagueReport.busy}
        publication={leagueReport.publication}
        onPublish={leagueReport.publish}
        onClose={leagueReport.closePreview}
      />

      <LeagueUrlEditDrawer
        open={leagueUrlEditor.open}
        league={league}
        season={selectedSeasonOption}
        saving={leagueUrlEditor.saving}
        onClose={leagueUrlEditor.close}
        onSave={leagueUrlEditor.save}
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
