// src/features/playersDatabase/ui/pages/leaguePage/LeaguePage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
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
  LeagueDataRepairModal,
  JsonViewerModal,
  SeasonDeleteConfirmModal,
  TaskEditModal,
  WorkTaskModal,
  WriteFlowReportModal,
} from '../../components/modals/index.js'
import { useLeagueTableImport } from './hooks/useLeagueTableImport.js'
import useLeagueJsonViewer from './hooks/useLeagueJsonViewer.js'
import useLeagueDataRepair from './hooks/useLeagueDataRepair.js'
import {
  buildPriorityCounts,
  filterTeamsByPriority,
} from './logic/leaguePriorityFilters.logic.js'
import { downloadLeagueDocumentJson } from './logic/leagueJson.logic.js'
import useTeamUrlEditor from '../../hooks/useTeamUrlEditor.js'
import useLeagueUrlEditor from './hooks/useLeagueUrlEditor.js'
import useLeagueSeasonTeamsDelete from './hooks/useLeagueSeasonTeamsDelete.js'
import useLeagueSeasonDelete from './hooks/useLeagueSeasonDelete.js'
import {
  buildLeagueImportColumns,
  LEAGUE_IMPORT_PLACEHOLDER,
} from './logic/leagueImport.columns.js'
import { splitLeagueTitle } from './logic/leaguePage.logic.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import { useLeagueReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'


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

  const leagueJsonViewer = useLeagueJsonViewer({
    league,
    leagueDoc,
    notify,
  })
  const leagueDataRepair = useLeagueDataRepair({
    league,
    leagueDoc,
    selectedSeasonKey,
    leagueImport,
    notify,
    reload,
  })

  const importColumns = React.useMemo(() => (
    buildLeagueImportColumns(leagueImport.rows)
  ), [leagueImport.rows])

  const filteredTeams = React.useMemo(() => (
    filterTeamsByPriority({
      teams: teamsWithFavorites,
      attackThreshold: attackPriorityFilter,
      defenseThreshold: defensePriorityFilter,
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
  const hasTeams = teams.length > 0
  const seasonDelete = useLeagueSeasonDelete({
    league,
    leagueDoc,
    selectedSeasonOption,
    onSuccess: async result => {
      if (result?.leagueSeasonResult?.removedLeagueDocument) {
        navigate(centerBackPath, {
          replace: true,
          state: null,
        })
        return
      }

      const nextSeason = seasonOptions.find(option => (
        option.seasonKey !== selectedSeasonKey
      ))
      if (!nextSeason) {
        navigate(centerBackPath, {
          replace: true,
          state: null,
        })
        return
      }

      setSelectedSeasonKey(nextSeason.seasonKey)
      await reload()
    },
  })
  const mayRemoveLeagueRoot = !PLAYERS_DATABASE_LEAGUES_CATALOG.some(
    catalogLeague => catalogLeague.id === league.id
  )
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

  const handleTeamOpen = team => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: league.id,
      teamId: team.id,
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
          seasonUrl={selectedSeasonOption?.season?.seasonUrl || ''}
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
              region={titleParts.region}
              ageGroup={league.ageGroup}
              birthYear={league.birthYear}
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
            onDataRepair={leagueDataRepair.openRepair}
            onLeagueJsonDownload={leagueJsonViewer.open}
            leagueJsonDownloading={leagueJsonViewer.downloading}
            onLeagueUrlEdit={leagueUrlEditor.show}
            hasLeagueUrl={Boolean(selectedSeasonOption?.season?.seasonUrl)}
            loadDisabled={isHistoricalLoadedLeague}
            loadDisabledReason='לא ניתן לטעון נתוני ליגה לעונה היסטורית שכבר כוללת קבוצות'
            onDeleteTeams={() => teamsDelete.setOpen(true)}
            onDeleteSeason={() => seasonDelete.setOpen(true)}
            deleteTeamsDisabled={!selectedSeasonOption}
            deleteSeasonDisabled={!selectedSeasonOption || hasTeams}
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
        description='המחיקה אפשרית רק כאשר אין שחקנים במסמכי הקבוצה של העונה. הבדיקה מתבצעת בעת האישור; אם קיימים שחקנים, יש למחוק אותם תחילה מעמודי הקבוצות.'
        seasonKey={selectedSeasonKey}
        showSeasonSelect={false}
        busy={teamsDelete.busy}
        confirmLabel='מחיקת קבוצות העונה'
        onConfirm={teamsDelete.confirm}
        onClose={teamsDelete.close}
      />

      <SeasonDeleteConfirmModal
        open={seasonDelete.open}
        title='מחיקת עונת ליגה'
        description='העונה תימחק רק לאחר שמסירים את כל הקבוצות ממנה. ליגה ריקה שאינה קיימת בקטלוג תימחק לחלוטין גם ממרכז הליגות.'
        seasonKey={selectedSeasonKey}
        showSeasonSelect={false}
        busy={seasonDelete.busy}
        confirmLabel='מחיקת עונה'
        mayRemoveLeagueRoot={mayRemoveLeagueRoot}
        onConfirm={seasonDelete.confirm}
        onClose={seasonDelete.close}
      />

      <WriteFlowReportModal
        open={Boolean(teamsDelete.writeReport)}
        report={teamsDelete.writeReport}
        onClose={teamsDelete.closeWriteReport}
      />

      <WriteFlowReportModal
        open={Boolean(seasonDelete.writeReport)}
        report={seasonDelete.writeReport}
        onClose={seasonDelete.closeWriteReport}
      />

      <LeagueImportModal
        league={league}
        columns={importColumns}
        leagueImport={leagueImport}
        placeholder={LEAGUE_IMPORT_PLACEHOLDER}
      />

      <LeagueDataRepairModal
        open={leagueDataRepair.open}
        busy={leagueDataRepair.busy}
        error={leagueDataRepair.error}
        leagueDocument={leagueDataRepair.sources.leagueDocument || leagueDoc || league}
        leaguesMaster={leagueDataRepair.sources.leaguesMaster || {}}
        auditFinding={leagueDataRepair.auditFinding}
        seasonKey={selectedSeasonKey}
        onOpenLeagueLoad={leagueDataRepair.openLeagueLoad}
        onSyncLeaguesMaster={leagueDataRepair.syncLeaguesMaster}
        onSyncClubProjections={leagueDataRepair.syncClubProjections}
        onClose={leagueDataRepair.close}
      />

      <JsonViewerModal
        open={Boolean(leagueJsonViewer.data)}
        title={`${league.name || 'ליגה'} · נתוני JSON`}
        description='תצוגה לקריאה בלבד של מסמך הליגה ושל Leagues Master'
        data={leagueJsonViewer.data || {}}
        onClose={leagueJsonViewer.close}
        onDownload={() => downloadLeagueDocumentJson({
          leagueDocument: leagueJsonViewer.data?.leagueDocument || {},
          leaguesMaster: leagueJsonViewer.data?.leaguesMaster || {},
        })}
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
