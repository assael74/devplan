// src/features/playersDatabase/ui/pages/teamPage/TeamPage.js

import * as React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useTeamPage } from './hooks/useTeamPage.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { PLAYER_STATS_STATUS } from '../../../model/player/playerStats.model.js'
import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import TeamHeader from './TeamHeader.js'
import TeamActionsPanel from './TeamActionsPanel.js'
import TeamInformationOverview from './information/components/TeamInformationOverview.js'
import TeamYearDevelopment from './yearDevelopment/components/TeamYearDevelopment.js'
import { buildTeamInformationView } from './information/model/teamInformation.model.js'
import {
  buildTeamProfileFilterOptions,
  filterTeamPlayersByProfile,
} from './model/teamPlayerFilters.model.js'
import {
  PlayerRoleEditModal,
  SeasonDeleteConfirmModal,
  TaskEditModal,
  TeamDataRepairModal,
  WorkTaskModal,
  WriteFlowReportModal,
} from '../../components/modals/index.js'
import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import useTeamRoleEditor from './hooks/useTeamRoleEditor.js'
import useTeamUrlEditor from '../../hooks/useTeamUrlEditor.js'
import useTeamRosterImport from './roster/import/hooks/useTeamRosterImport.js'
import RosterImportModal from './roster/import/components/RosterImportModal.js'
import useTeamStatsImport from './stats/import/hooks/useTeamStatsImport.js'
import StatsImportModal from './stats/import/components/StatsImportModal.js'
import useTeamDataRepair from './hooks/useTeamDataRepair.js'
import useTeamPageTasks from './hooks/useTeamPageTasks.js'
import useTeamStatsColumns from './stats/table/hooks/useTeamStatsColumns.js'
import useTeamSeasonPlayersDelete from './hooks/useTeamSeasonPlayersDelete.js'
import useTeamSeasonStatsDelete from './hooks/useTeamSeasonStatsDelete.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import useTeamReport from './report/useTeamReport.js'
import { pageCoreLayoutSx } from '../../components/page/sx/pageCoreLayout.sx.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamPageSx } from './sx/teamPage.sx.js'

const sx = {
  ...pageCoreLayoutSx,
  ...teamPageSx,
}

const cleanKey = value => String(value || '').trim()

function TeamPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [profileFilterKey, setProfileFilterKey] = React.useState('all')
  const [activeView, setActiveView] = React.useState('team')
  const {
    leagueId,
    leagueDoc,
    leagueDocuments,
    team,
    teamDoc,
    teamSeasons,
    seasonSnapshots,
    players,
    hasTeamPlayers,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
    setSelectedSeasonKey,
    reload,
    loading,
    error,
    selectionError,
  } = useTeamPage()
  const auditFindingId = React.useMemo(() => (
    new URLSearchParams(location.search).get('auditFinding') || ''
  ), [location.search])

  const selectedLeagueDocument = selectedLeagueSeason?.leagueDoc || leagueDoc
  const handleRosterSeasonSelect = React.useCallback(({ key, leagueId: rosterLeagueId } = {}) => {
    const selectedOption = seasonOptions.find(option => (
      option.seasonKey === key && option.leagueId === rosterLeagueId
    )) || seasonOptions.find(option => option.seasonKey === key)

    if (selectedOption) {
      setSelectedSeasonKey(selectedOption.optionKey)
    }
  }, [seasonOptions, setSelectedSeasonKey])

  const sharedActionContext = {
    leagueId,
    leagueDoc: selectedLeagueDocument,
    leagueDocuments,
    team,
    selectedSeasonOption,
    seasonOptions,
    notify,
    reload,
  }
  const roleEditor = useTeamRoleEditor(sharedActionContext)
  const teamUrlEditor = useTeamUrlEditor(sharedActionContext)
  const rosterImport = useTeamRosterImport(sharedActionContext)
  const statsImport = useTeamStatsImport({
    ...sharedActionContext,
    teamDoc,
    teamSeasons,
  })
  const playersDelete = useTeamSeasonPlayersDelete(sharedActionContext)
  const statsDelete = useTeamSeasonStatsDelete(sharedActionContext)
  const teamDataRepair = useTeamDataRepair({
    team,
    teamDoc,
    teamSeasons,
    leagueDoc: selectedLeagueDocument,
    selectedLeagueSeason,
    auditFindingId,
    notify,
    reload,
  })
  const teamPageTasks = useTeamPageTasks({
    team,
    selectedSeasonKey,
    tasksModel,
    taskActions,
  })
  const statsColumns = useTeamStatsColumns({
    players: statsImport.players,
    rosterLookup: statsImport.rosterLookup,
    teamRootOptions: statsImport.teamRootOptions,
    getRowStatus: statsImport.getRowStatus,
    getCellStatus: statsImport.getCellStatus,
  })

  const pageSearchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const fromLeaguePath = pageSearchParams.get('fromLeague') || ''
  const fromClubs = pageSearchParams.get('fromClubs') === '1'
  const leagueFallbackPath = PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
    seasonKey: selectedSeasonKey,
  })
  const leagueBackPath = fromClubs
    ? PLAYERS_DATABASE_UI_ROUTES.clubs
    : fromLeaguePath || leagueFallbackPath
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs(fromClubs
    ? [
      {
        label: 'מועדונים',
        to: PLAYERS_DATABASE_UI_ROUTES.clubs,
      },
      { label: team.name },
    ]
    : [
      {
        label: 'מרכז ליגות',
        to: PLAYERS_DATABASE_UI_ROUTES.leagues({
          seasonKey: selectedSeasonKey,
          birthYear: team.birthYear,
          level: team.league?.leagueLevel || team.leagueLevel,
        }),
      },
      {
        label: team.leagueName,
        to: leagueBackPath,
      },
      { label: team.name },
    ])
  const profileFilterOptions = React.useMemo(
    () => buildTeamProfileFilterOptions(players),
    [players]
  )
  const visiblePlayers = React.useMemo(() => {
    const filteredPlayers = filterTeamPlayersByProfile({
      players,
      profileFilterKey,
      profileOnly: profileFilterKey !== 'all',
    })

    return filteredPlayers.map(player => ({
      ...player,
      favorite: favorites.isPlayerFavorite(player.playerId),
      favoritePending: favorites.isFavoritePending(
        PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
        player.playerId
      ),
    }))
  }, [
    favorites.pendingKeysRevision,
    favorites.playerFavoritesMap,
    players,
    profileFilterKey,
  ])
  const handleProfileFilterChange = React.useCallback(nextValue => {
    const value = cleanKey(nextValue) || 'all'

    setProfileFilterKey(value)
  }, [])
  const profileFilteredPlayerIds = React.useMemo(() => (
    profileFilterKey === 'all'
      ? null
      : visiblePlayers.map(player => (
        player.playerId || player.playerDocumentId || player.id
      )).filter(Boolean)
  ), [profileFilterKey, visiblePlayers])
  const teamInformationView = React.useMemo(() => buildTeamInformationView({
    team,
    teamSeasons: seasonSnapshots,
    selectedTeamSeason,
    selectedSeasonKey,
    selectedSeasonOption,
    seasonOptions,
    players: visiblePlayers,
    playerIdsFilter: profileFilteredPlayerIds,
  }), [
    visiblePlayers,
    profileFilteredPlayerIds,
    selectedSeasonKey,
    selectedSeasonOption,
    seasonOptions,
    selectedTeamSeason,
    team,
    seasonSnapshots,
  ])
  const hasTeamStats = React.useMemo(() => (
    players.some(player => (
      player.statsStatus === PLAYER_STATS_STATUS.LOADED ||
      Number(player.games || 0) > 0 ||
      Number(player.minutes || 0) > 0
    ))
  ), [players])
  const teamFavorite = favorites.isBirthTeamFavorite(team.birthTeamId)
  const teamFavoritePending = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
    team.birthTeamId
  )

  const handleBackToLeague = () => {
    navigate(leagueBackPath, {
      replace: true,
      state: null,
    })
  }

  const handleTeamFavoriteToggle = React.useCallback(() => {
    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
      entityId: team.birthTeamId,
    }

    if (!team.birthTeamId) return null
    if (favorites.isBirthTeamFavorite(team.birthTeamId)) {
      return favorites.removeFavorite(payload)
    }

    return favorites.addFavorite({
      ...payload,
      displayName: team.name,
      birthYear: team.birthYear,
    })
  }, [favorites, team.birthTeamId, team.birthYear, team.name])

  const teamReport = useTeamReport({
    team,
    players: visiblePlayers,
    seasonKey: selectedSeasonKey,
  })
  const handlePlayerOpen = React.useCallback(row => {
    const source = row?.player || row || {}
    const playerId = source.playerDocumentId || source.playerId || source.id
    if (!playerId) return

    navigate(
      PLAYERS_DATABASE_UI_ROUTES.player({
        playerId,
        teamId: team.birthTeamId || team.id,
        leagueId: selectedSeasonOption?.leagueId || leagueId,
        fromTeam: `${location.pathname}${location.search}`,
      }),
      {
        state: {
          playerTeamSource: {
            team,
            teamDoc,
            selectedTeamSeason,
          },
        },
      }
    )
  }, [
    leagueId,
    location.pathname,
    location.search,
    navigate,
    selectedSeasonKey,
    selectedSeasonOption?.leagueId,
    selectedTeamSeason,
    team,
    teamDoc,
  ])

  if (loading) {
    return (
      <Box sx={sx.loadingState}>
        <CircularProgress size='sm' />
        <Typography level='body-sm'>טוען את גרסת הקבוצה...</Typography>
      </Box>
    )
  }

  if (error || selectionError) {
    return (
      <Box sx={sx.loadingState}>
        <Typography level='body-sm'>{error || selectionError}</Typography>
      </Box>
    )
  }

  return (
    <>
      <Box sx={sx.page}>
        <TeamHeader
          breadcrumbs={breadcrumbs}
          team={team}
          teamUrl={
            selectedTeamSeason?.teamUrl ||
            team.teamUrl ||
            selectedSeasonOption?.season?.teamUrl ||
            ''
          }
          seasonKey={selectedSeasonKey}
          latestSeason={seasonSnapshots[0] || null}
          favorite={teamFavorite}
          favoritePending={teamFavoritePending}
          onFavoriteToggle={() => {
            Promise.resolve(handleTeamFavoriteToggle()).catch(() => {})
          }}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onLeague={handleBackToLeague}
          backLabel={fromClubs ? 'חזרה למועדונים' : 'חזרה לליגה'}
        />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <Box sx={sx.viewTabsToolbar}>
              <Box sx={sx.viewTabs}>
                <Button
                  variant='plain'
                  color='neutral'
                  sx={[sx.viewTab, activeView === 'team' && sx.viewTabActive]}
                  aria-pressed={activeView === 'team'}
                  onClick={() => setActiveView('team')}
                >
                  {`מצב שנתון${team.birthYear ? ` · ${team.birthYear}` : ''}`}
                </Button>
                <Button
                  variant='plain'
                  color='neutral'
                  sx={[sx.viewTab, activeView === 'players' && sx.viewTabActive]}
                  aria-pressed={activeView === 'players'}
                  onClick={() => setActiveView('players')}
                >
                  {`התפתחות שנתון${team.birthYear ? ` · ${team.birthYear}` : ''}`}
                </Button>
              </Box>
            </Box>

            {activeView === 'team' ? (
              <TeamInformationOverview
                view={teamInformationView}
                seasonSnapshots={seasonSnapshots}
                onSeasonSelect={handleRosterSeasonSelect}
                profileFilterKey={profileFilterKey}
                profileFilterOptions={profileFilterOptions}
                onProfileFilterChange={handleProfileFilterChange}
                onPlayerRoleEdit={roleEditor.open}
                onPlayerOpen={handlePlayerOpen}
              />
            ) : (
              <TeamYearDevelopment
                timeline={teamInformationView.developmentTimeline}
                overview={teamInformationView.yearDevelopment}
              />
            )}
          </Box>

          <TeamActionsPanel
            selectedSeasonOptionKey={selectedSeasonOptionKey}
            seasonOptions={seasonOptions}
            hasTeamPlayers={hasTeamPlayers}
            hasTeamStats={hasTeamStats}
            onPlayersImport={rosterImport.openModal}
            onStatsImport={statsImport.openModal}
            onDeleteStats={statsDelete.openModal}
            onDeletePlayers={playersDelete.openModal}
            onReport={teamReport.openPreview}
            onTeamLink={() => teamUrlEditor.open(team)}
            onTeamDataRepair={teamDataRepair.openRepair}
            tasks={teamPageTasks.tasks}
            tasksLoading={tasksModel.loading}
            onTaskCreate={teamPageTasks.openCreate}
            onTaskEdit={teamPageTasks.openEdit}
          />
        </Box>
      </Box>

      <ReportPreviewModal
        open={teamReport.open}
        draft={teamReport.draft}
        busy={teamReport.busy}
        publication={teamReport.publication}
        onPublish={teamReport.publish}
        onClose={teamReport.closePreview}
      />

      <TeamDataRepairModal
        open={teamDataRepair.open}
        busy={teamDataRepair.busy}
        error={teamDataRepair.error}
        teamDocument={teamDoc}
        teamSeasons={teamSeasons}
        teamSearchIndexes={teamDataRepair.teamSearchIndexes}
        indexesLoaded={teamDataRepair.indexesLoaded}
        auditFinding={teamDataRepair.auditFinding}
        leagueDocument={selectedLeagueDocument}
        selectedLeagueSeason={selectedLeagueSeason}
        onRepair={teamDataRepair.repair}
        onClose={teamDataRepair.close}
      />

      <TaskEditModal
        open={Boolean(teamPageTasks.editTask)}
        task={teamPageTasks.editTask}
        busy={teamPageTasks.pending}
        onSave={teamPageTasks.saveEdit}
        onDone={teamPageTasks.markDone}
        onClose={teamPageTasks.closeEdit}
      />

      <WorkTaskModal
        open={teamPageTasks.createOpen}
        mode='team'
        onClose={teamPageTasks.closeCreate}
      />

      <TeamUrlEditDrawer
        open={Boolean(teamUrlEditor.row)}
        row={teamUrlEditor.row}
        seasonLabel={selectedSeasonOption?.seasonKey || selectedSeasonKey}
        saving={teamUrlEditor.saving}
        onSave={teamUrlEditor.save}
        onClose={teamUrlEditor.close}
      />

      <PlayerRoleEditModal
        open={Boolean(roleEditor.row)}
        playerName={roleEditor.row?.fullName || ''}
        draft={roleEditor.draft}
        busy={roleEditor.busy}
        changed={roleEditor.changed}
        onDraftChange={roleEditor.setDraft}
        onConfirm={roleEditor.confirm}
        onClose={roleEditor.close}
      />

      <RosterImportModal
        team={team}
        seasonKey={rosterImport.selectedSeasonOption?.seasonKey}
        hasTeamPlayers={hasTeamPlayers}
        controller={rosterImport}
      />

      <StatsImportModal
        team={team}
        seasonKey={statsImport.selectedSeasonOption?.seasonKey}
        hasTeamPlayers={statsImport.hasTeamPlayers}
        columns={statsColumns}
        source={{
          teamUrl:
            statsImport.selectedSeasonOption?.season?.teamUrl ||
            selectedTeamSeason?.teamUrl ||
            team.teamUrl ||
            selectedSeasonOption?.season?.teamUrl ||
            '',
          leagueName:
            statsImport.selectedSeasonOption?.leagueName ||
            selectedSeasonOption?.leagueName ||
            team.leagueName ||
            '',
          leagueUrl:
            statsImport.selectedSeasonOption?.season?.seasonUrl ||
            statsImport.selectedSeasonOption?.season?.leagueUrl ||
            selectedLeagueSeason?.season?.seasonUrl ||
            selectedLeagueSeason?.season?.leagueUrl ||
            selectedSeasonOption?.season?.seasonUrl ||
            selectedSeasonOption?.season?.leagueUrl ||
            team.domain?.metadata?.seasonUrl ||
            selectedLeagueDocument?.leagueUrl ||
            '',
        }}
        controller={statsImport}
      />


      <SeasonDeleteConfirmModal
        open={statsDelete.open}
        title='מחיקת סטטיסטיקת העונה'
        description='הסגל נשאר. הסטטיסטיקה והמידע הנגזר ממנה יימחקו מהעונה הנבחרת.'
        seasonKey={statsDelete.selectedSeasonOption?.seasonKey}
        seasonOptions={statsDelete.seasonOptions}
        selectedSeasonOptionKey={statsDelete.selectedSeasonOptionKey}
        onSeasonOptionChange={statsDelete.setSelectedSeasonOptionKey}
        busy={statsDelete.busy}
        confirmLabel='מחיקת סטטיסטיקת העונה'
        onConfirm={statsDelete.confirm}
        onClose={statsDelete.close}
      />

      <SeasonDeleteConfirmModal
        open={playersDelete.open}
        title='מחיקת שחקני העונה'
        description='טעינת הקבוצה בעונה הנבחרת תימחק במלואה, כולל הסגל והסטטיסטיקה.'
        seasonKey={playersDelete.selectedSeasonOption?.seasonKey}
        seasonOptions={playersDelete.seasonOptions}
        selectedSeasonOptionKey={playersDelete.selectedSeasonOptionKey}
        onSeasonOptionChange={playersDelete.setSelectedSeasonOptionKey}
        busy={playersDelete.busy}
        confirmLabel='מחיקת שחקני העונה'
        onConfirm={playersDelete.confirm}
        onClose={playersDelete.close}
      />

      <WriteFlowReportModal
        open={Boolean(statsDelete.writeReport)}
        report={statsDelete.writeReport}
        onClose={statsDelete.closeWriteReport}
      />

      <WriteFlowReportModal
        open={Boolean(playersDelete.writeReport)}
        report={playersDelete.writeReport}
        onClose={playersDelete.closeWriteReport}
      />

      <WriteFlowReportModal
        open={Boolean(rosterImport.writeReport)}
        report={rosterImport.writeReport}
        onClose={rosterImport.closeWriteReport}
      />

      <WriteFlowReportModal
        open={Boolean(statsImport.writeReport)}
        report={statsImport.writeReport}
        onClose={statsImport.closeWriteReport}
      />
    </>
  )
}

export default function TeamPage() {
  return (
    <PlayersDatabaseLayout>
      <TeamPageContent />
    </PlayersDatabaseLayout>
  )
}
