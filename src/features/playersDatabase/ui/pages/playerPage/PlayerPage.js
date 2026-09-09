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
import { usePlayerReport } from './report/index.js'
import { pageCoreLayoutSx as sx } from '../../components/page/sx/pageCoreLayout.sx.js'
import { playerPageSx } from './sx/playerPage.sx.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../services/write/index.js'

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
    requestedSeasonKey,
    requestedTeamId,
    catalogSeasonKey,
    fromTeam,
    reload,
  } = usePlayerPage()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [playerJsonLoading, setPlayerJsonLoading] = React.useState(false)
  const [searchIndexJsonLoading, setSearchIndexJsonLoading] = React.useState(false)
  const [agentDrawerOpen, setAgentDrawerOpen] = React.useState(false)
  const [additionalDrawerOpen, setAdditionalDrawerOpen] = React.useState(false)
  const [agentSaving, setAgentSaving] = React.useState(false)
  const [goalDistributionSaving, setGoalDistributionSaving] = React.useState(false)
  const playerId = String(player.playerId || '').trim()
  const playerFavorite = favorites.isPlayerFavorite(playerId)
  const playerFavoriteLoading = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
    playerId
  )
  const historyView = usePlayerHistoryView(player)
  const selectedSeasonRow = historyView.selectedRow
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

    if (actionId === 'agent' || actionId === 'agent_status') {
      setAgentDrawerOpen(true)
      return
    }

    if (actionId === 'additional' || actionId === 'goal_distribution') {
      setAdditionalDrawerOpen(true)
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
            playerJsonLoading={playerJsonLoading}
            searchIndexJsonLoading={searchIndexJsonLoading}
            teamJsonAvailable={Boolean(teamSource?.teamDoc)}
            teamSeasonJsonAvailable={Boolean(teamSource?.selectedTeamSeason)}
            playerSearchIndexJsonAvailable={canReadPlayerSearchIndexExport(player)}
            teamSearchIndexJsonAvailable={canReadTeamSearchIndexExport(player)}
            onPlayerJson={handlePlayerJson}
            onTeamJson={handleTeamJson}
            onTeamSeasonJson={handleTeamSeasonJson}
            onPlayerSearchIndexJson={() => handleSearchIndexJson({ type: 'player' })}
            onTeamSearchIndexJson={() => handleSearchIndexJson({ type: 'team' })}
            onDataRepair={playerDataRepair.openRepair}
          />
        </Box>
      </Box>

      <PlayerAgentDrawer
        open={agentDrawerOpen}
        playerName={player.fullName}
        value={player.agent}
        saving={agentSaving}
        onClose={() => !agentSaving && setAgentDrawerOpen(false)}
        onSave={async agent => {
          if (agentSaving) return
          setAgentSaving(true)
          try {
            await runPlayersDatabaseWriteAction({
              actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_AGENT,
              payload: {
                player: {
                  playerId: player.playerId || player.id,
                  playerDocumentId: player.domain?.identity?.playerDocumentId || player.id,
                  externalPlayerId: player.externalPlayerId,
                },
                agent,
              },
            })
            notify({ status: 'success', message: 'פרטי הסוכן נשמרו.' })
            setAgentDrawerOpen(false)
            reload()
          } catch (error) {
            notify({ status: 'error', message: error?.message || 'שמירת פרטי הסוכן נכשלה.' })
          } finally {
            setAgentSaving(false)
          }
        }}
      />

      <PlayerGoalDistributionDrawer
        open={additionalDrawerOpen}
        playerName={player.fullName}
        seasonLabel={historyView.selectedRow?.seasonKey || ''}
        seasonGoals={historyView.selectedRow?.goals}
        seasonGames={historyView.selectedRow?.games}
        value={historyView.selectedRow?.goalDistribution}
        saving={goalDistributionSaving}
        onClose={() => !goalDistributionSaving && setAdditionalDrawerOpen(false)}
        onSave={async goalDistribution => {
          const row = historyView.selectedRow
          if (!row || goalDistributionSaving) return
          setGoalDistributionSaving(true)
          try {
            await runPlayersDatabaseWriteAction({
              actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_GOAL_DISTRIBUTION,
              payload: {
                target: row.target || 'current',
                season: {
                  seasonId: row.seasonId || row.seasonKey,
                  seasonKey: row.seasonKey,
                },
                team: {
                  teamId: row.teamId,
                  birthTeamId: row.birthTeamId || row.teamId,
                  teamDocumentId: row.birthTeamDocumentId || row.teamId,
                  birthTeamDocumentId: row.birthTeamDocumentId || row.teamId,
                },
                player: {
                  playerId: player.playerId || player.id,
                  playerDocumentId: player.domain?.identity?.playerDocumentId || player.id,
                  externalPlayerId: player.externalPlayerId,
                },
                ...goalDistribution,
              },
            })
            notify({ status: 'success', message: 'פיזור השערים נשמר.' })
            setAdditionalDrawerOpen(false)
            reload()
          } catch (error) {
            notify({ status: 'error', message: error?.message || 'שמירת פיזור השערים נכשלה.' })
          } finally {
            setGoalDistributionSaving(false)
          }
        }}
      />

      <PlayerDataRepairModal
        open={playerDataRepair.open}
        busy={playerDataRepair.busy}
        error={playerDataRepair.error}
        contexts={playerDataRepair.contexts}
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
