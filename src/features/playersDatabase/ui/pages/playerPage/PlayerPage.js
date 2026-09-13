// src/features/playersDatabase/ui/pages/playerPage/PlayerPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useLocation, useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { usePlayerPage } from '../../hooks/usePlayerPage.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import PlayerHeader from './PlayerHeader.js'
import PlayerDecisionContent from './PlayerDecisionContent.js'
import PlayerActionsPanel from './PlayerActionsPanel.js'
import PlayerUrlEditDrawer from '../../components/drawers/PlayerUrlEditDrawer.js'
import PlayerAgentDrawer from '../../components/drawers/PlayerAgentDrawer.js'
import PlayerGoalDistributionDrawer from '../../components/drawers/PlayerGoalDistributionDrawer.js'
import PlayerTaskCreateModal from './PlayerTaskCreateModal.js'
import { PlayerDataRepairModal, TaskEditModal } from '../../components/modals/index.js'
import usePlayerHistoryView from './hooks/usePlayerHistoryView.js'
import usePlayerUrlEditor from './hooks/usePlayerUrlEditor.js'
import usePlayerDataRepair from './hooks/usePlayerDataRepair.js'
import usePlayerPageTasks from './hooks/usePlayerPageTasks.js'
import usePlayerJsonActions from './hooks/usePlayerJsonActions.js'
import usePlayerAgentEditor from './hooks/usePlayerAgentEditor.js'
import usePlayerGoalDistributionEditor from './hooks/usePlayerGoalDistributionEditor.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { usePlayerReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'
import { playerPageSx } from './sx/playerPage.sx.js'

function getPathParam(path, key) {
  const queryIndex = String(path || '').indexOf('?')

  if (queryIndex < 0) return ''

  const params = new URLSearchParams(
    String(path).slice(queryIndex + 1)
  )

  return String(params.get(key) || '').trim()
}

function PlayerPageContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useSnackbar()
  const {
    player,
    teamSource,
    requestedSeasonKey,
    requestedTeamId,
    catalogSeasonKey,
    fromTeam,
    reload,
  } = usePlayerPage()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const playerId = String(player.playerId || '').trim()
  const playerFavorite = favorites.isPlayerFavorite(playerId)
  const playerFavoriteLoading = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
    playerId
  )
  const historyView = usePlayerHistoryView(player)
  const selectedSeasonRow = historyView.selectedRow
  const jsonActions = usePlayerJsonActions({
    player,
    playerId,
    teamSource,
    notify,
  })
  const agentEditor = usePlayerAgentEditor({
    player,
    notify,
    reload,
  })
  const goalDistributionEditor = usePlayerGoalDistributionEditor({
    player,
    selectedRow: selectedSeasonRow,
    notify,
    reload,
  })
  const playerUrlEditor = usePlayerUrlEditor({
    player,
    selectedSeasonRow,
    notify,
    reload,
  })
  const playerReport = usePlayerReport({
    player,
    historyRows: historyView.visibleRows,
  })
  const playerPageTasks = usePlayerPageTasks({
    player,
    historyView,
    tasksModel,
    taskActions,
    notify,
  })
  const playerDataRepair = usePlayerDataRepair({
    player,
    playerId,
    requestedSeasonKey,
    requestedTeamId,
    auditFindingId: new URLSearchParams(location.search).get('auditFinding') || '',
    notify,
    reload,
    navigate,
  })

  const fallbackLeaguePath = player.leagueId
    ? PLAYERS_DATABASE_UI_ROUTES.league(
      player.leagueId,
      {
        seasonKey: player.seasonKey,
      }
    )
    : ''
  const fallbackTeamPath = player.leagueId && player.teamId
    ? PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: player.leagueId,
      teamId: player.teamId,
      seasonKey: player.seasonKey,
    })
    : ''
  const fromLeague = getPathParam(fromTeam, 'fromLeague')
  const leagueBackPath = fromLeague || fallbackLeaguePath
  const teamBackPath = fromTeam || fallbackTeamPath
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    player.leagueId
      ? {
        label: player.leagueName || 'ליגה',
        to: leagueBackPath,
      }
      : null,
    player.leagueId && player.teamId
      ? {
        label: player.teamName || 'קבוצה',
        to: teamBackPath,
      }
      : {
        label: 'חיפוש מועמדים',
        to: PLAYERS_DATABASE_UI_ROUTES.search,
      },
    {
      label: player.fullName,
    },
  ])

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  const handleNavigateToTeam = () => {
    if (!teamBackPath) return

    navigate(teamBackPath, {
      replace: true,
      state: null,
    })
  }

  const handleFavoriteToggle = React.useCallback(() => {
    if (!playerId) return null

    const activeSeason = player.activeSeason || {}
    const scouting = {
      season: activeSeason.season || {},
      team: activeSeason.team || {},
      target: activeSeason.lifecycle?.type || 'current',
      player: {
        ...(player.domain?.identity || {}),
        playerId,
        playerDocumentId: player.domain?.identity?.playerDocumentId || '',
        fullName: player.fullName,
        playerStats: activeSeason.stats?.actual || {},
        primaryPosition: activeSeason.position?.primary || '',
        positionLayer: activeSeason.position?.layer || '',
        scoutProfiles: activeSeason.scout?.profiles || [],
        scoutSignals: activeSeason.scout?.profiles || [],
      },
    }
    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
      entityId: playerId,
    }

    if (favorites.isPlayerFavorite(playerId)) {
      return favorites.removeFavorite({
        ...payload,
        scouting: {
          playerDocumentId: player.domain?.identity?.playerDocumentId || '',
        },
      })
    }

    return favorites.addFavorite({
      ...payload,
      displayName: player.fullName,
      birthYear: player.birthYear,
      scouting,
    })
  }, [
    favorites,
    player.activeSeason,
    player.birthYear,
    player.domain,
    player.fullName,
    player.id,
    playerId,
  ])

  const handleAction = actionId => {
    if (actionId === 'report') {
      playerReport.openPreview()
      return
    }

    if (actionId === 'link') {
      playerUrlEditor.open()
      return
    }

    if (actionId === 'agent' || actionId === 'agent_status') {
      agentEditor.show()
      return
    }

    if (actionId === 'additional' || actionId === 'goal_distribution') {
      goalDistributionEditor.show()
      return
    }

    console.info('Player placeholder action', actionId)
  }

  return (
    <>
      <Box sx={sx.page}>
        <PlayerHeader
          breadcrumbs={breadcrumbs}
          player={player}
          seasonContext={historyView.latestRow}
          favorite={playerFavorite}
          favoriteLoading={playerFavoriteLoading}
          onFavoriteToggle={() => {
            Promise.resolve(handleFavoriteToggle()).catch(() => {})
          }}
          onSearch={handleNavigateToSearch}
          onTeam={handleNavigateToTeam}
        />

        <Box sx={sx.contentGrid}>
          <Box className='dpScrollThin' sx={[sx.mainColumn, playerPageSx.mainColumn]}>
            <PlayerDecisionContent
              player={player}
              historyRows={historyView.rows}
              catalogSeasonKey={catalogSeasonKey}
            />
          </Box>

          <PlayerActionsPanel
            tasks={playerPageTasks.tasks}
            tasksLoading={tasksModel.loading}
            onAction={handleAction}
            onTaskCreate={playerPageTasks.openCreate}
            onTaskEdit={playerPageTasks.openEdit}
            playerJsonLoading={jsonActions.playerJsonLoading}
            searchIndexJsonLoading={jsonActions.searchIndexJsonLoading}
            teamJsonAvailable={jsonActions.teamJsonAvailable}
            teamSeasonJsonAvailable={jsonActions.teamSeasonJsonAvailable}
            playerSearchIndexJsonAvailable={jsonActions.playerSearchIndexJsonAvailable}
            teamSearchIndexJsonAvailable={jsonActions.teamSearchIndexJsonAvailable}
            onPlayerJson={jsonActions.downloadPlayer}
            onTeamJson={jsonActions.downloadTeam}
            onTeamSeasonJson={jsonActions.downloadTeamSeason}
            onPlayerSearchIndexJson={() => jsonActions.downloadSearchIndex({ type: 'player' })}
            onTeamSearchIndexJson={() => jsonActions.downloadSearchIndex({ type: 'team' })}
            onDataRepair={playerDataRepair.openRepair}
          />
        </Box>
      </Box>

      <PlayerAgentDrawer
        open={agentEditor.open}
        playerName={player.fullName}
        value={player.agent}
        saving={agentEditor.saving}
        onClose={agentEditor.close}
        onSave={agentEditor.save}
      />

      <PlayerGoalDistributionDrawer
        open={goalDistributionEditor.open}
        playerName={player.fullName}
        seasonLabel={historyView.selectedRow?.seasonKey || ''}
        seasonGoals={historyView.selectedRow?.goals}
        seasonGames={historyView.selectedRow?.games}
        value={historyView.selectedRow?.goalDistribution}
        saving={goalDistributionEditor.saving}
        onClose={goalDistributionEditor.close}
        onSave={goalDistributionEditor.save}
      />

      <PlayerDataRepairModal
        open={playerDataRepair.open}
        busy={playerDataRepair.busy}
        error={playerDataRepair.error}
        contexts={playerDataRepair.contexts}
        auditFinding={playerDataRepair.auditFinding}
        onRepair={playerDataRepair.repair}
        onTeamOpen={playerDataRepair.openTeam}
        onClose={playerDataRepair.close}
      />

      <TaskEditModal
        open={Boolean(playerPageTasks.editTask)}
        task={playerPageTasks.editTask}
        busy={playerPageTasks.pending}
        onSave={playerPageTasks.saveEdit}
        onDone={playerPageTasks.markDone}
        onClose={playerPageTasks.closeEdit}
      />

      <PlayerTaskCreateModal
        open={playerPageTasks.createOpen}
        busy={playerPageTasks.createSaving}
        onClose={playerPageTasks.closeCreate}
        onCreate={playerPageTasks.createTask}
      />



      <PlayerUrlEditDrawer
        open={Boolean(playerUrlEditor.row)}
        row={playerUrlEditor.row}
        seasonLabel={historyView.selectedSeasonKey}
        saving={playerUrlEditor.saving}
        onSave={playerUrlEditor.save}
        onClose={playerUrlEditor.close}
      />

      <ReportPreviewModal
        open={playerReport.open}
        draft={playerReport.draft}
        busy={playerReport.busy}
        publication={playerReport.publication}
        onPublish={playerReport.publish}
        onClose={playerReport.closePreview}
      />
    </>
  )
}

export default function PlayerPage() {
  return (
    <PlayersDatabaseLayout>
      <PlayerPageContent />
    </PlayersDatabaseLayout>
  )
}
