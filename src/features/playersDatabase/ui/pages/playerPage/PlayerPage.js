// src/features/playersDatabase/ui/pages/playerPage/PlayerPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

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
import PlayerStatsOverview from './PlayerStatsOverview.js'
import PlayerHistorySection from './PlayerHistorySection.js'
import PlayerActionsPanel from './PlayerActionsPanel.js'
import PlayerUrlEditDrawer from '../../components/drawers/PlayerUrlEditDrawer.js'
import { TaskEditModal } from '../../components/modals/index.js'
import usePlayerHistoryView from './hooks/usePlayerHistoryView.js'
import usePlayerUrlEditor from './hooks/usePlayerUrlEditor.js'
import { resolvePlayerScopeReliability } from './logic/playerPage.utils.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import { usePlayerReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'

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
  const { notify } = useSnackbar()
  const {
    player,
    fromTeam,
    reload,
  } = usePlayerPage()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [editTask, setEditTask] = React.useState(null)
  const playerId = String(player.playerId || '').trim()
  const playerFavorite = favorites.isPlayerFavorite(playerId)
  const playerFavoriteLoading = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
    playerId
  )
  const historyView = usePlayerHistoryView(player)
  const selectedSeasonRow = React.useMemo(() => (
    historyView.selectedSeasonKey
      ? historyView.rows.find(row => (
        row.seasonKey === historyView.selectedSeasonKey
      )) || null
      : null
  ), [historyView.rows, historyView.selectedSeasonKey])
  const scopeReliability = React.useMemo(() => (
    resolvePlayerScopeReliability(historyView.visibleRows)
  ), [historyView.visibleRows])
  const scopeProfileCount = React.useMemo(() => (
    historyView.visibleRows.reduce(
      (total, row) => total + Number(row.scoutProfileCount || 0),
      0
    )
  ), [historyView.visibleRows])
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

    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
      entityId: playerId,
    }

    if (favorites.isPlayerFavorite(playerId)) {
      return favorites.removeFavorite(payload)
    }

    return favorites.addFavorite({
      ...payload,
      displayName: player.fullName,
      birthYear: player.birthYear,
    })
  }, [favorites, player.birthYear, player.fullName, playerId])

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

  const playerTasks = React.useMemo(() => {
    const playerIds = new Set([
      player.playerId,
      player.id,
      player.externalPlayerId,
    ].map(value => String(value || '').trim()).filter(Boolean))

    return tasksModel.tasks.filter(task => {
      const context = task?.workContext || {}
      const taskPlayerId = String(
        context.playerId ||
        context.playerDocumentId ||
        context.externalPlayerId ||
        ''
      ).trim()
      const samePlayer = taskPlayerId && playerIds.has(taskPlayerId)
      const sameSeason = !historyView.selectedSeasonKey || (
        String(context.seasonKey || '') ===
        String(historyView.selectedSeasonKey || '')
      )

      return samePlayer && sameSeason
    })
  }, [
    historyView.selectedSeasonKey,
    player.externalPlayerId,
    player.id,
    player.playerId,
    tasksModel.tasks,
  ])

  const handleHistoryOpen = row => {
    console.info('Player season context', row)
  }

  const handleAction = actionId => {
    if (actionId === 'report') {
      playerReport.openPreview()
      return
    }

    if (actionId === 'link') {
      playerUrlEditor.open()
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
          seasonLabel={historyView.selectedSeasonKey || 'כל העונות'}
          reliabilityLabel={scopeReliability.label}
          reliabilityColor={scopeReliability.color}
          hasScoutProfiles={scopeProfileCount > 0}
          favorite={playerFavorite}
          favoriteLoading={playerFavoriteLoading}
          onFavoriteToggle={() => {
            Promise.resolve(handleFavoriteToggle()).catch(() => {})
          }}
          onSearch={handleNavigateToSearch}
          onTeam={handleNavigateToTeam}
        />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <PlayerStatsOverview
              historyRows={historyView.rows}
              selectedSeasonKey={historyView.selectedSeasonKey}
            />

            <PlayerHistorySection
              rows={historyView.visibleRows}
              hasRealData={historyView.hasRealData}
              onRowOpen={handleHistoryOpen}
            />
          </Box>

          <PlayerActionsPanel
            selectedSeasonKey={historyView.selectedSeasonKey}
            seasonOptions={historyView.seasonOptions}
            tasks={playerTasks}
            tasksLoading={tasksModel.loading}
            onSeasonChange={historyView.setSelectedSeasonKey}
            onAction={handleAction}
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
