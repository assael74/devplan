// src/features/playersDatabase/ui/pages/leaguePage/LeaguePage.js

import * as React from 'react'
import { Alert, Box } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeaguePage } from './hooks/useLeaguePage.js'
import { useLeagueTableImport } from './hooks/useLeagueTableImport.js'
import useLeagueUrlEditor from './hooks/useLeagueUrlEditor.js'
import useTeamUrlEditor from '../../hooks/useTeamUrlEditor.js'
import useClearLeagueTeamsFlow from './clear/useClearLeagueTeamsFlow.js'
import ClearLeagueTeamsModal from './clear/ClearLeagueTeamsModal.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_QUERY_KEYS as queryKeys,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueHeader from './LeagueHeader.js'
import LeagueKpiOverview from './LeagueKpiOverview.js'
import LeagueActionsPanel from './LeagueActionsPanel.js'
import LeagueTeamsTable from './LeagueTeamsTable.js'
import LeagueSeasonSettingsDrawer from './LeagueSeasonSettingsDrawer.js'
import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import {
  LeagueImportModal,
  TaskEditModal,
  WorkTaskModal,
} from '../../components/modals/index.js'
import {
  buildPriorityCounts,
  filterTeamsByPriority,
} from './logic/leaguePriorityFilters.logic.js'
import { splitLeagueTitle } from './logic/leaguePage.logic.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import useLeagueReport from './report/useLeagueReport.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'
import usePageSidePanelCollapsed from '../../components/page/usePageSidePanelCollapsed.js'
import { downloadLeaguePageDocumentsJson } from './logic/leagueDocumentsJson.logic.js'
import { buildLeagueImportColumns, LEAGUE_IMPORT_PLACEHOLDER } from './logic/leagueImport.columns.js'


function LeaguePageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [attackPriorityFilter, setAttackPriorityFilter] = React.useState('')
  const [defensePriorityFilter, setDefensePriorityFilter] = React.useState('')
  const [sidePanelCollapsed, setSidePanelCollapsed] = usePageSidePanelCollapsed(
    'playersDatabase:leagueSidePanelCollapsed'
  )
  const [taskModalOpen, setTaskModalOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState(null)
  const pageSearchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const {
    league,
    leagueDoc,
    displayLeagueDoc,
    teams,
    summary,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    loading,
    error,
    selectionError,
  } = useLeaguePage()
  const repairReload = pageSearchParams.get('repairReload') === '1'
  const repairSeasonId = pageSearchParams.get('auditSeasonId') || ''
  const openedRepairImport = React.useRef('')
  const leagueImport = useLeagueTableImport({
    league,
    leagueDoc: displayLeagueDoc,
    selectedSeasonOption,
    repairReload,
    repairSeasonId,
  })
  React.useEffect(() => {
    if (!repairReload || pageSearchParams.get('openLeagueImport') !== '1' || loading || error) return
    const key = `${league.id}:${repairSeasonId}`
    if (!leagueImport.repairContextValid || openedRepairImport.current === key) return
    openedRepairImport.current = key
    leagueImport.handleOpen()
  }, [error, league.id, leagueImport, loading, pageSearchParams, repairReload, repairSeasonId])
  const clearLeagueTeamsFlow = useClearLeagueTeamsFlow({
    league,
    selectedSeasonOption,
  })
  const leagueUrlEditor = useLeagueUrlEditor({
    league,
    selectedSeasonOption,
    notify,
  })
  const teamUrlEditor = useTeamUrlEditor({
    leagueId: league.id,
    selectedSeasonOption,
    notify,
  })
  const leagueImportColumns = React.useMemo(() => buildLeagueImportColumns(leagueImport.clubs), [leagueImport.clubs])
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

  const attackPriorityCounts = React.useMemo(
    () => buildPriorityCounts(teamsWithFavorites, 'attack'),
    [teamsWithFavorites]
  )
  const defensePriorityCounts = React.useMemo(
    () => buildPriorityCounts(teamsWithFavorites, 'defense'),
    [teamsWithFavorites]
  )

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

  const hasCenterContext = (
    pageSearchParams.has(queryKeys.centerSeason) ||
    pageSearchParams.has(queryKeys.centerBirthYear) ||
    pageSearchParams.has(queryKeys.centerAgeGroup) ||
    pageSearchParams.has(queryKeys.centerLevel) ||
    pageSearchParams.has(queryKeys.centerStatus) ||
    pageSearchParams.has('centerSeason') ||
    pageSearchParams.has('centerBirthYear') ||
    pageSearchParams.has('centerLevel')
  )
  const centerBackPath = PLAYERS_DATABASE_UI_ROUTES.leagues({
    seasonKey: hasCenterContext
      ? pageSearchParams.get(queryKeys.centerSeason) || pageSearchParams.get('centerSeason') || 'all'
      : pageSearchParams.get(queryKeys.season) || pageSearchParams.get('season'),
    birthYear: hasCenterContext
      ? pageSearchParams.get(queryKeys.centerBirthYear) || pageSearchParams.get('centerBirthYear') || 'all'
      : pageSearchParams.get(queryKeys.birthYear) || pageSearchParams.get('birthYear'),
    ageGroup: hasCenterContext
      ? pageSearchParams.get(queryKeys.centerAgeGroup) || 'all'
      : 'all',
    level: hasCenterContext
      ? pageSearchParams.get(queryKeys.centerLevel) || pageSearchParams.get('centerLevel') || 'all'
      : pageSearchParams.get(queryKeys.level) || pageSearchParams.get('level'),
    status: hasCenterContext
      ? pageSearchParams.get(queryKeys.centerStatus) || 'all'
      : 'all',
  })
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מרכז ליגות',
      to: centerBackPath,
    },
    { label: league.name },
  ])
  const titleParts = splitLeagueTitle(league)
  const isActiveLeague = String(selectedSeasonOption?.season?.seasonStatus || '').toLowerCase() === 'active'
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

  const handleDownloadDocuments = React.useCallback(() => {
    const downloadedCount = downloadLeaguePageDocumentsJson({
      leagueDocument: leagueDoc,
    })

    if (!downloadedCount) {
      notify({
        status: 'warning',
        title: 'לא נמצא מסמך להורדה',
        message: 'מסמך הליגה אינו זמין כרגע',
      })
    }
  }, [leagueDoc, notify])

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
        {repairReload && !leagueImport.repairContextValid ? (
          <Alert color='danger'>עונת הליגה אינה תואמת לממצא. יש לחזור לאודיט ולפתוח שוב את טעינת המקור.</Alert>
        ) : null}
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

        <Box sx={[sx.contentGrid, sidePanelCollapsed && sx.contentGridCollapsed]}>
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
              onTeamUrlEdit={leagueDoc && selectedSeasonOption?.seasonId
                ? teamUrlEditor.open
                : null}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </Box>

          <LeagueActionsPanel
            collapsible
            collapsed={sidePanelCollapsed}
            onCollapsedChange={setSidePanelCollapsed}
            selectedSeasonKey={selectedSeasonKey}
            seasonOptions={seasonOptions}
            onSeasonChange={setSelectedSeasonKey}
            seasonDisabled={repairReload || leagueImport.open}
            attackPriorityFilter={attackPriorityFilter}
            defensePriorityFilter={defensePriorityFilter}
            attackPriorityCounts={attackPriorityCounts}
            defensePriorityCounts={defensePriorityCounts}
            onAttackPriorityFilterChange={setAttackPriorityFilter}
            onDefensePriorityFilterChange={setDefensePriorityFilter}
            onLoad={leagueImport.handleOpen}
            onDownloadDocuments={handleDownloadDocuments}
            onLeagueUrlEdit={leagueDoc && selectedSeasonOption?.seasonId
              ? leagueUrlEditor.show
              : null}
            downloadDisabled={!leagueDoc || loading}
            loadDisabled={clearLeagueTeamsFlow.open || leagueImport.busy || !leagueImport.repairContextValid || !selectedSeasonOption?.seasonId}
            loadDisabledReason={!selectedSeasonOption?.seasonId
              ? 'חסר seasonId טכני לעונה שנבחרה'
              : clearLeagueTeamsFlow.open
                ? 'פעולת League אחרת פתוחה כרגע'
                : ''}
            onDeleteTeams={clearLeagueTeamsFlow.openModal}
            deleteTeamsDisabled={leagueImport.open || clearLeagueTeamsFlow.disabled}
            deleteTeamsDisabledReason={leagueImport.open
              ? 'פעולת League אחרת פתוחה כרגע'
              : clearLeagueTeamsFlow.disabledReason}
            onRecheckDeleteTeams={clearLeagueTeamsFlow.recheck}
            nextDeleteAction=''
            onNextDeleteAction={() => {}}
            onReport={leagueReport.openPreview}
            tasks={leagueTasks}
            tasksLoading={tasksModel.loading}
            onTaskCreate={() => setTaskModalOpen(true)}
            onTaskEdit={setEditTask}
          />
        </Box>
      </Box>

      <LeagueImportModal
        league={{
          ...league,
          seasonKey: selectedSeasonKey,
        }}
        columns={leagueImportColumns}
        leagueImport={leagueImport}
        placeholder={LEAGUE_IMPORT_PLACEHOLDER}
      />

      <ClearLeagueTeamsModal
        flow={clearLeagueTeamsFlow}
        leagueName={league?.name}
        seasonKey={selectedSeasonKey}
      />

      <LeagueSeasonSettingsDrawer editor={leagueUrlEditor} />

      <TeamUrlEditDrawer
        open={Boolean(teamUrlEditor.row)}
        onClose={teamUrlEditor.close}
        onSave={teamUrlEditor.save}
        saving={teamUrlEditor.saving}
        row={teamUrlEditor.row}
        seasonLabel={selectedSeasonKey}
      />

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
