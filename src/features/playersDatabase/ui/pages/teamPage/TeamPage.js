// src/features/playersDatabase/ui/pages/teamPage/TeamPage.js

import * as React from 'react'
import {
  Box,
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
import { useTeamPage } from '../../hooks/useTeamPage.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { buildLeaguePageTeams } from '../../../model/leaguePage.model.js'
import { PLAYER_STATS_STATUS } from '../../../model/playerStats.model.js'
import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import TeamHeader from './TeamHeader.js'
import TeamKpiOverview from './TeamKpiOverview.js'
import TeamPlayersSection from './TeamPlayersSection.js'
import TeamActionsPanel from './TeamActionsPanel.js'
import {
  PlayerRoleEditModal,
  RosterImportModal,
  SeasonDeleteConfirmModal,
  StatsImportModal,
  TaskEditModal,
  WorkTaskModal,
  WriteFlowReportModal,
} from '../../components/modals/index.js'
import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import PlayerUrlEditDrawer from '../../components/drawers/PlayerUrlEditDrawer.js'
import useTeamRoleEditor from './hooks/useTeamRoleEditor.js'
import useTeamUrlEditor from '../leaguePage/hooks/useTeamUrlEditor.js'
import usePlayerUrlEditor from './hooks/usePlayerUrlEditor.js'
import useTeamRosterImport from './hooks/useTeamRosterImport.js'
import useTeamStatsImport from './hooks/useTeamStatsImport.js'
import useTeamStatsColumns from './hooks/useTeamStatsColumns.js'
import useTeamSeasonPlayersDelete from './hooks/useTeamSeasonPlayersDelete.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import { useTeamReport } from './report/index.js'
import { pageCoreLayoutSx } from '../../components/page/sx/pageCoreLayout.sx.js'
import { teamPageSx } from './sx/teamPage.sx.js'

const sx = {
  ...pageCoreLayoutSx,
  ...teamPageSx,
}

const cleanKey = value => String(value || '').trim()

const buildTeamNavigationLabel = teamRow => [
  teamRow.tableRank ? `מקום ${teamRow.tableRank}` : '',
  teamRow.teamSlot && teamRow.teamSlot > 1 ? `קבוצה ${teamRow.teamSlot}` : '',
  teamRow.hasStats ? 'סטטיסטיקה' : teamRow.hasPlayers ? 'סגל' : 'ללא סגל',
].filter(Boolean).join(' · ')

const resolveScoutProfileId = profile => cleanKey(
  profile?.profileId ||
  profile?.id
)

const resolveScoutProfileLabel = profile => cleanKey(
  profile?.profileLabel ||
  profile?.label ||
  profile?.name ||
  resolveScoutProfileId(profile)
) || 'פרופיל סקאוט'

const buildProfileFilterOptions = players => {
  const profileMap = new Map()
  let playersWithProfilesCount = 0

  players.forEach(player => {
    const profiles = Array.isArray(player.scoutProfiles)
      ? player.scoutProfiles
      : []

    if (profiles.length) playersWithProfilesCount += 1

    profiles.forEach(profile => {
      const id = resolveScoutProfileId(profile)
      if (!id) return

      const current = profileMap.get(id) || {
        value: id,
        label: resolveScoutProfileLabel(profile),
        count: 0,
      }

      profileMap.set(id, {
        ...current,
        count: current.count + 1,
      })
    })
  })

  return [
    {
      value: 'all',
      label: 'כל הפרופילים',
      count: playersWithProfilesCount,
    },
    ...Array.from(profileMap.values()).sort((left, right) => (
      right.count - left.count ||
      left.label.localeCompare(right.label, 'he')
    )),
  ]
}

function TeamPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [profileOnly, setProfileOnly] = React.useState(false)
  const [profileFilterKey, setProfileFilterKey] = React.useState('all')
  const [taskModalOpen, setTaskModalOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState(null)
  const {
    leagueId,
    leagueDoc,
    team,
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

  const sharedActionContext = {
    leagueId,
    leagueDoc,
    team,
    selectedSeasonOption,
    notify,
    reload,
  }
  const roleEditor = useTeamRoleEditor(sharedActionContext)
  const teamUrlEditor = useTeamUrlEditor(sharedActionContext)
  const playerUrlEditor = usePlayerUrlEditor(sharedActionContext)
  const rosterImport = useTeamRosterImport(sharedActionContext)
  const statsImport = useTeamStatsImport({
    ...sharedActionContext,
    players,
    hasTeamPlayers,
  })
  const playersDelete = useTeamSeasonPlayersDelete(sharedActionContext)
  const statsColumns = useTeamStatsColumns({
    players,
    rosterLookup: statsImport.rosterLookup,
    getRowStatus: statsImport.getRowStatus,
  })

  const pageSearchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const fromLeaguePath = pageSearchParams.get('fromLeague') || ''
  const leagueFallbackPath = PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
    seasonKey: selectedSeasonKey,
  })
  const leagueBackPath = fromLeaguePath || leagueFallbackPath
  const leagueTeamsNavigation = React.useMemo(() => {
    const rows = buildLeaguePageTeams({
      season: selectedLeagueSeason?.season,
      leagueDoc,
      target: selectedSeasonOption?.target || 'current',
    })
    const options = rows
      .map(teamRow => ({
        value: cleanKey(teamRow.id || teamRow.teamDocumentId || teamRow.birthTeamId),
        label: teamRow.name,
        secondaryLabel: buildTeamNavigationLabel(teamRow),
        keys: [
          teamRow.id,
          teamRow.teamId,
          teamRow.birthTeamId,
          teamRow.teamDocumentId,
        ].map(cleanKey).filter(Boolean),
      }))
      .filter(option => option.value)
    const currentKeys = new Set([
      team.id,
      team.teamId,
      team.birthTeamId,
      team.teamDocumentId,
    ].map(cleanKey).filter(Boolean))
    const currentIndex = options.findIndex(option => (
      option.keys.some(key => currentKeys.has(key))
    ))

    return {
      options,
      value: currentIndex >= 0 ? options[currentIndex].value : '',
      previousValue: currentIndex > 0 ? options[currentIndex - 1].value : '',
      nextValue: currentIndex >= 0 && currentIndex < options.length - 1
        ? options[currentIndex + 1].value
        : '',
    }
  }, [
    leagueDoc,
    selectedLeagueSeason,
    selectedSeasonOption,
    team.birthTeamId,
    team.id,
    team.teamDocumentId,
    team.teamId,
  ])
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
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
    {
      label: team.name,
    },
  ])
  const profileFilterOptions = React.useMemo(
    () => buildProfileFilterOptions(players),
    [players]
  )
  const visiblePlayers = React.useMemo(() => {
    const filteredPlayers = players.filter(player => {
      const profiles = Array.isArray(player.scoutProfiles)
        ? player.scoutProfiles
        : []

      if (profileFilterKey !== 'all') {
        return profiles.some(profile => (
          resolveScoutProfileId(profile) === profileFilterKey
        ))
      }

      if (profileOnly) return profiles.length > 0

      return true
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
    profileOnly,
  ])
  const handleProfileOnlyChange = React.useCallback(nextValue => {
    setProfileOnly(nextValue)
    if (!nextValue) setProfileFilterKey('all')
  }, [])
  const handleProfileFilterChange = React.useCallback(nextValue => {
    const value = cleanKey(nextValue) || 'all'

    setProfileFilterKey(value)
    if (value !== 'all') setProfileOnly(true)
  }, [])
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

  const handleTeamNavigate = React.useCallback(nextTeamId => {
    const cleanTeamId = cleanKey(nextTeamId)
    if (!cleanTeamId || cleanTeamId === leagueTeamsNavigation.value) return

    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId,
      teamId: cleanTeamId,
      seasonKey: selectedSeasonKey,
      fromLeague: leagueBackPath,
    }), {
      state: location.state,
    })
  }, [
    leagueBackPath,
    leagueId,
    leagueTeamsNavigation.value,
    location.state,
    navigate,
    selectedSeasonKey,
  ])

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

  const handlePlayerFavoriteToggle = React.useCallback(player => {
    if (!player?.playerId) return null

    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
      entityId: player.playerId,
    }

    if (favorites.isPlayerFavorite(player.playerId)) {
      return favorites.removeFavorite(payload)
    }

    return favorites.addFavorite({
      ...payload,
      displayName: player.fullName,
      birthYear: team.birthYear,
    })
  }, [favorites, team.birthYear])

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

  const isActiveSeason = selectedSeasonOption?.target === 'current'
  const teamTasks = React.useMemo(() => {
    const teamIds = new Set([
      team.birthTeamId,
      team.teamId,
      team.teamDocumentId,
      team.id,
    ].map(value => String(value || '').trim()).filter(Boolean))

    return tasksModel.tasks.filter(task => {
      const context = task?.workContext || {}
      const taskTeamId = String(context.birthTeamId || context.teamId || '').trim()
      const sameTeam = taskTeamId && teamIds.has(taskTeamId)
      const sameSeason = String(context.seasonKey || '') === String(selectedSeasonKey || '')

      return sameTeam && sameSeason
    })
  }, [
    selectedSeasonKey,
    tasksModel.tasks,
    team.birthTeamId,
    team.id,
    team.teamDocumentId,
    team.teamId,
  ])
  const teamReport = useTeamReport({
    team,
    players: visiblePlayers,
    seasonKey: selectedSeasonKey,
  })

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
          active={isActiveSeason}
          seasonKey={selectedSeasonKey}
          favorite={teamFavorite}
          favoritePending={teamFavoritePending}
          onFavoriteToggle={() => {
            Promise.resolve(handleTeamFavoriteToggle()).catch(() => {})
          }}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onLeague={handleBackToLeague}
        />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <TeamKpiOverview team={team} />

            <TeamPlayersSection
              players={visiblePlayers}
              team={team}
              seasonKey={selectedSeasonKey}
              onRoleOpen={roleEditor.open}
              onPlayerOpen={row => navigate(
                PLAYERS_DATABASE_UI_ROUTES.player({
                  playerId: row.playerDocumentId || row.id,
                  seasonKey: selectedSeasonKey,
                  teamId: team.birthTeamId || team.id,
                  leagueId: selectedSeasonOption?.leagueId || leagueId,
                  fromTeam: `${location.pathname}${location.search}`,
                })
              )}
              onPlayerUrlEdit={playerUrlEditor.open}
              onFavoriteToggle={handlePlayerFavoriteToggle}
            />
          </Box>

          <TeamActionsPanel
            selectedSeasonOptionKey={selectedSeasonOptionKey}
            seasonOptions={seasonOptions}
            hasTeamPlayers={hasTeamPlayers}
            hasTeamStats={hasTeamStats}
            profileOnly={profileOnly}
            profileFilterKey={profileFilterKey}
            profileFilterOptions={profileFilterOptions}
            onSeasonChange={setSelectedSeasonKey}
            teamNavigation={leagueTeamsNavigation}
            onTeamNavigate={handleTeamNavigate}
            onProfileOnlyChange={handleProfileOnlyChange}
            onProfileFilterChange={handleProfileFilterChange}
            onPlayersImport={() => rosterImport.setOpen(true)}
            onStatsImport={() => statsImport.setOpen(true)}
            onDeletePlayers={() => playersDelete.setOpen(true)}
            onReport={teamReport.openPreview}
            onTeamLink={() => teamUrlEditor.open(team)}
            tasks={teamTasks}
            tasksLoading={tasksModel.loading}
            onTaskCreate={() => setTaskModalOpen(true)}
            onTaskEdit={setEditTask}
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
        mode='team'
        onClose={() => setTaskModalOpen(false)}
      />

      <TeamUrlEditDrawer
        open={Boolean(teamUrlEditor.row)}
        row={teamUrlEditor.row}
        seasonLabel={selectedSeasonOption?.seasonKey || selectedSeasonKey}
        saving={teamUrlEditor.saving}
        onSave={teamUrlEditor.save}
        onClose={teamUrlEditor.close}
      />

      <PlayerUrlEditDrawer
        open={Boolean(playerUrlEditor.row)}
        row={playerUrlEditor.row}
        seasonLabel={selectedSeasonOption?.seasonKey || selectedSeasonKey}
        saving={playerUrlEditor.saving}
        onSave={playerUrlEditor.save}
        onClose={playerUrlEditor.close}
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
        seasonKey={selectedSeasonKey}
        hasTeamPlayers={hasTeamPlayers}
        controller={rosterImport}
      />

      <StatsImportModal
        team={team}
        seasonKey={selectedSeasonKey}
        hasTeamPlayers={hasTeamPlayers}
        columns={statsColumns}
        source={{
          teamUrl:
            selectedTeamSeason?.teamUrl ||
            team.teamUrl ||
            selectedSeasonOption?.season?.teamUrl ||
            '',
          leagueName:
            selectedSeasonOption?.leagueName ||
            team.leagueName ||
            '',
          leagueUrl:
            selectedLeagueSeason?.season?.seasonUrl ||
            selectedLeagueSeason?.season?.leagueUrl ||
            selectedSeasonOption?.season?.seasonUrl ||
            selectedSeasonOption?.season?.leagueUrl ||
            team.domain?.metadata?.seasonUrl ||
            leagueDoc?.leagueUrl ||
            '',
        }}
        controller={statsImport}
      />


      <SeasonDeleteConfirmModal
        open={playersDelete.open}
        title='מחיקת שחקני העונה'
        description='כל השחקנים והסטטיסטיקה שלהם יוסרו מהקבוצה בעונה הנבחרת בלבד.'
        seasonKey={selectedSeasonKey}
        busy={playersDelete.busy}
        confirmLabel='מחיקת שחקני העונה'
        onConfirm={playersDelete.confirm}
        onClose={playersDelete.close}
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
