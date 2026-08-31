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
import PlayerScoutOverview from './PlayerScoutOverview.js'
import PlayerActionsPanel from './PlayerActionsPanel.js'
import PlayerUrlEditDrawer from '../../components/drawers/PlayerUrlEditDrawer.js'
import {
  PlayerNarrativeModal,
  PlayerScoutReviewModal,
  TaskEditModal,
} from '../../components/modals/index.js'
import usePlayerHistoryView from './hooks/usePlayerHistoryView.js'
import usePlayerUrlEditor from './hooks/usePlayerUrlEditor.js'
import usePlayerNarrative from './hooks/usePlayerNarrative.js'
import usePlayerScoutReview from './hooks/usePlayerScoutReview.js'
import {
  canReadPlayerSearchIndexExport,
  canReadTeamSearchIndexExport,
  readPlayerSearchIndexExport,
  readPlayerSource,
  readTeamSearchIndexExport,
} from '../../../services/read/index.js'
import {
  downloadPlayerJson,
  downloadPlayerSearchIndexJson,
  downloadTeamJson,
  downloadTeamSeasonJson,
  downloadTeamSearchIndexJson,
} from './logic/playerJson.logic.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import { usePlayerReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'
import { playerPageSx } from './sx/playerPage.sx.js'
import { buildPlayerScoutView } from './logic/playerScoutView.js'
import { buildPlayerSeasonNumbersRow } from './logic/playerTeamSource.logic.js'

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
    teamSource,
    fromTeam,
    reload,
  } = usePlayerPage()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [editTask, setEditTask] = React.useState(null)
  const [playerJsonLoading, setPlayerJsonLoading] = React.useState(false)
  const [searchIndexJsonLoading, setSearchIndexJsonLoading] = React.useState(false)
  const playerId = String(player.playerId || '').trim()
  const playerFavorite = favorites.isPlayerFavorite(playerId)
  const playerFavoriteLoading = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
    playerId
  )
  const historyView = usePlayerHistoryView(player)
  const selectedSeasonRow = historyView.selectedRow
  const selectedNumbersRow = React.useMemo(() => buildPlayerSeasonNumbersRow({
    row: selectedSeasonRow || {},
    player,
    teamSource: teamSource || {},
  }), [player, selectedSeasonRow, teamSource])
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
  const narrative = usePlayerNarrative({
    player,
    reload,
    notify,
  })
  const scoutReview = usePlayerScoutReview({
    player,
    notify,
    reload,
  })
  const scoutView = React.useMemo(() => buildPlayerScoutView({
    player,
    historyRows: historyView.rows,
  }), [player, historyView.rows])

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

  const handlePlayerJson = React.useCallback(async () => {
    if (!playerId || playerJsonLoading) return

    setPlayerJsonLoading(true)

    try {
      const playerDocument = await readPlayerSource({ playerId })

      if (!playerDocument) {
        notify({
          status: 'error',
          message: 'לא נמצא מסמך שחקן ליצוא.',
        })
        return
      }

      downloadPlayerJson(playerDocument)
      notify({
        status: 'success',
        message: 'קובץ JSON נוצר בהצלחה.',
      })
    } catch (error) {
      console.error('Player JSON export failed', error)
      notify({
        status: 'error',
        message: 'יצירת קובץ JSON נכשלה.',
      })
    } finally {
      setPlayerJsonLoading(false)
    }
  }, [notify, playerId, playerJsonLoading])


  const handleTeamJson = React.useCallback(() => {
    const teamDocument = teamSource?.teamDoc

    if (!teamDocument) {
      notify({
        status: 'warning',
        message: 'מסמך הקבוצה אינו זמין כרגע להורדה.',
      })
      return
    }

    downloadTeamJson(teamDocument)
    notify({
      status: 'success',
      message: 'מסמך הקבוצה הורד בהצלחה.',
    })
  }, [notify, teamSource])

  const handleTeamSeasonJson = React.useCallback(() => {
    const teamSeasonDocument = teamSource?.selectedTeamSeason

    if (!teamSeasonDocument) {
      notify({
        status: 'warning',
        message: 'נתוני קבוצת העונה אינם זמינים כרגע להורדה.',
      })
      return
    }

    downloadTeamSeasonJson(teamSeasonDocument)
    notify({
      status: 'success',
      message: 'נתוני קבוצת העונה הורדו בהצלחה.',
    })
  }, [notify, teamSource])

  const handleSearchIndexJson = React.useCallback(async ({ type } = {}) => {
    if (searchIndexJsonLoading) return

    const isPlayerIndex = type === 'player'
    const canRead = isPlayerIndex
      ? canReadPlayerSearchIndexExport(player)
      : canReadTeamSearchIndexExport(player)

    if (!canRead) {
      notify({
        status: 'warning',
        message: 'אין הקשר עונה מלא לטעינת מסמך האינדקס.',
      })
      return
    }

    setSearchIndexJsonLoading(true)

    try {
      const searchIndexDocument = isPlayerIndex
        ? await readPlayerSearchIndexExport({ player })
        : await readTeamSearchIndexExport({ player })

      if (!searchIndexDocument) {
        notify({
          status: 'warning',
          message: 'לא נמצא מסמך אינדקס עבור ההקשר הנבחר.',
        })
        return
      }

      if (isPlayerIndex) downloadPlayerSearchIndexJson(searchIndexDocument)
      else downloadTeamSearchIndexJson(searchIndexDocument)

      notify({
        status: 'success',
        message: 'מסמך האינדקס הורד בהצלחה.',
      })
    } catch (error) {
      console.error('Search index JSON export failed', error)
      notify({
        status: 'error',
        message: 'הורדת מסמך האינדקס נכשלה.',
      })
    } finally {
      setSearchIndexJsonLoading(false)
    }
  }, [notify, player, searchIndexJsonLoading])

  const handleAction = actionId => {
    if (actionId === 'report') {
      playerReport.openPreview()
      return
    }

    if (actionId === 'link') {
      playerUrlEditor.open()
      return
    }

    if (actionId === 'review') {
      scoutReview.open()
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
          seasonLabel={historyView.latestSeasonKey || 'כל העונות'}
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
            <PlayerScoutOverview
              player={player}
              historyRows={historyView.rows}
              selectedRow={selectedNumbersRow}
              selectedContextId={historyView.selectedContextId}
              contextOptions={historyView.contextOptions}
              narrativeView={narrative.view}
              narrativeLoading={narrative.loading}
              narrativeDeleting={narrative.deleting}
              playerJsonLoading={playerJsonLoading}
              searchIndexJsonLoading={searchIndexJsonLoading}
              reportLoading={playerReport.busy}
              onContextChange={historyView.setSelectedContextId}
              onNarrativeGenerate={narrative.generate}
              onNarrativeRefine={narrative.editApproved}
              onNarrativeDelete={narrative.removeApproved}
              onPlayerJson={handlePlayerJson}
              onTeamJson={handleTeamJson}
              onTeamSeasonJson={handleTeamSeasonJson}
              onPlayerSearchIndexJson={() => handleSearchIndexJson({ type: 'player' })}
              onTeamSearchIndexJson={() => handleSearchIndexJson({ type: 'team' })}
              teamJsonAvailable={Boolean(teamSource?.teamDoc)}
              teamSeasonJsonAvailable={Boolean(teamSource?.selectedTeamSeason)}
              playerSearchIndexJsonAvailable={canReadPlayerSearchIndexExport(player)}
              teamSearchIndexJsonAvailable={canReadTeamSearchIndexExport(player)}
              onReport={playerReport.openPreview}
            />
          </Box>

          <PlayerActionsPanel
            recommendedActions={scoutView.nextActions}
            tasks={playerTasks}
            tasksLoading={tasksModel.loading}
            onAction={handleAction}
            onTaskEdit={setEditTask}
          />
        </Box>
      </Box>

      <PlayerScoutReviewModal
        open={Boolean(scoutReview.draft)}
        playerName={player.fullName}
        seasonKey={scoutReview.seasonKey}
        draft={scoutReview.draft}
        busy={scoutReview.saving}
        changed={scoutReview.changed}
        onDraftChange={scoutReview.setDraft}
        onConfirm={scoutReview.save}
        onClose={scoutReview.close}
      />

      <TaskEditModal
        open={Boolean(editTask)}
        task={editTask}
        busy={taskActions.pending}
        onSave={handleTaskEditSave}
        onDone={handleTaskEditDone}
        onClose={() => setEditTask(null)}
      />

      <PlayerNarrativeModal
        open={narrative.open}
        session={narrative.session}
        presentation={narrative.presentation}
        refining={narrative.refining}
        saving={narrative.saving}
        onRefine={narrative.refine}
        onClose={narrative.close}
        onApprove={narrative.approve}
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
