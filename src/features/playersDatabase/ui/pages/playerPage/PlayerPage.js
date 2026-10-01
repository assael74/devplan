// src/features/playersDatabase/ui/pages/playerPage/PlayerPage.js

import * as React from 'react'
import { Box, Typography } from '@mui/joy'
import { useLocation, useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { usePlayerPage } from './hooks/usePlayerPage.js'
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
import { TaskEditModal } from '../../components/modals/index.js'
import usePlayerHistoryView from './hooks/usePlayerHistoryView.js'
import usePlayerUrlEditor from './hooks/usePlayerUrlEditor.js'
import usePlayerPageTasks from './hooks/usePlayerPageTasks.js'
import usePlayerAgentEditor from './hooks/usePlayerAgentEditor.js'
import usePlayerGoalDistributionEditor from './hooks/usePlayerGoalDistributionEditor.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { usePlayerReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'
import { playerPageSx } from './sx/playerPage.sx.js'
import {
  readPlayerSearchIndexesExport,
  readPlayerSource,
} from '../../../services/read/index.js'
import {
  downloadPlayerPageDocumentsJson,
  downloadPlayerPageIndexesJson,
} from './logic/playerDocumentsJson.logic.js'

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
    clubDoc,
    requestedSeasonKey,
    requestedTeamId,
    catalogSeasonKey,
    fromTeam,
    reload,
    refreshError,
  } = usePlayerPage()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [downloadBusy, setDownloadBusy] = React.useState(false)
  const playerId = String(player.playerId || '').trim()
  const playerFavorite = favorites.isPlayerFavorite(playerId)
  const playerFavoriteLoading = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
    playerId
  )
  const historyView = usePlayerHistoryView(player)
  const selectedSeasonRow = historyView.selectedRow
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
  }, [
    favorites,
    player.birthYear,
    player.fullName,
    playerId,
  ])

  const handleAction = actionId => {
    if (actionId === 'report') {
      playerReport.openPreview()
      return
    }

    if (actionId === 'link') {
      playerUrlEditor.openDrawer()
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

  const handleDownloadDocuments = React.useCallback(async () => {
    if (!playerId || downloadBusy) return

    setDownloadBusy(true)
    try {
      const playerDocument = await readPlayerSource({ playerId })
      const downloadedCount = downloadPlayerPageDocumentsJson({ playerDocument })
      if (!downloadedCount) {
        notify({
          status: 'warning',
          title: 'לא נמצא מסמך להורדה',
          message: 'מסמך השחקן אינו זמין כרגע',
        })
      }
    } catch {
      notify({
        status: 'error',
        title: 'הורדת מסמך השחקן נכשלה',
        message: 'לא ניתן היה לקרוא את מסמך השחקן',
      })
    } finally {
      setDownloadBusy(false)
    }
  }, [downloadBusy, notify, playerId])

  const handleDownloadIndexes = React.useCallback(async () => {
    if (!playerId || downloadBusy) return

    setDownloadBusy(true)
    try {
      const playerDocument = await readPlayerSource({ playerId })
      const playerSearchIndexes = await readPlayerSearchIndexesExport({
        player,
        playerDocument: playerDocument || {},
      })
      const downloadedCount = downloadPlayerPageIndexesJson({
        playerDocument: playerDocument || player,
        playerSearchIndexes,
      })
      if (!downloadedCount) {
        notify({
          status: 'warning',
          title: 'לא נמצאו אינדקסים להורדה',
          message: 'לא קיימים אינדקסים עבור השחקן הזה',
        })
      }
    } catch {
      notify({
        status: 'error',
        title: 'הורדת אינדקסי השחקן נכשלה',
        message: 'לא ניתן היה לקרוא את מסמכי האינדקס',
      })
    } finally {
      setDownloadBusy(false)
    }
  }, [downloadBusy, notify, player, playerId])

  return (
    <>
      <Box sx={sx.page}>
        {refreshError ? (
          <Typography level='body-sm' color='warning'>
            הרענון נכשל. מוצגים הנתונים האחרונים שנטענו.
          </Typography>
        ) : null}
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
          clubUrl={clubDoc?.clubUrl || ''}
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
            onDownloadDocuments={handleDownloadDocuments}
            onDownloadIndexes={handleDownloadIndexes}
            downloadDisabled={!playerId}
            downloadBusy={downloadBusy}
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
        open={playerUrlEditor.open}
        rows={playerUrlEditor.rows}
        entityName={player.fullName}
        saving={playerUrlEditor.saving}
        onChange={playerUrlEditor.change}
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
