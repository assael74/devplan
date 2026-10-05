// src/features/playersDatabase/ui/pages/leagueCenterPage/LeaguesCenterPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeagueCenter } from './hooks/useLeagueCenter.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueCenterHeader from './LeagueCenterHeader.js'
import OpenLeagueModal from './OpenLeagueModal.js'
import LeagueCenterKpiOverview from './LeagueCenterKpiOverview.js'
import LeagueCenterTable from './LeagueCenterTable.js'
import LeagueCenterSidePanel from './LeagueCenterSidePanel.js'
import {
  TaskEditModal,
  WorkTaskModal,
} from '../../components/modals/index.js'
import { buildLeagueCenterColumns } from './logic/leagueCenter.columns.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import useDeleteLeagueSeason from './deleteSeason/useDeleteLeagueSeason.js'
import DeleteLeagueSeasonModal from './deleteSeason/DeleteLeagueSeasonModal.js'
import { readLeaguePageData } from '../../../services/read/index.js'
import { openLeagueSeason } from '../../../services/write/league/index.js'
import { hasLeagueCenterSeason } from '../../../model/league/center/leagueCenterOptions.model.js'
import { leaguesCenterPageSx as sx } from './sx/leaguesCenterPage.sx.js'

const EMPTY_OPEN_LEAGUE_ACTION = {
  busy: false,
  error: '',
  writeCompleted: false,
  target: null,
}

export default function LeaguesCenterPage() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const model = useLeagueCenter()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [taskModalOpen, setTaskModalOpen] = React.useState(false)
  const [openLeagueModal, setOpenLeagueModal] = React.useState(false)
  const [openLeagueAction, setOpenLeagueAction] = React.useState(EMPTY_OPEN_LEAGUE_ACTION)
  const [editTask, setEditTask] = React.useState(null)
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'ניהול נתוני ליגות' },
  ])

  const deleteLeagueSeasonFlow = useDeleteLeagueSeason({
    reload: async row => {
      await Promise.all([
        model.reload({ fromServer: true }),
        readLeaguePageData({ leagueId: row.leagueId, refresh: true }),
      ])
    },
  })

  const columns = React.useMemo(() => buildLeagueCenterColumns({
    onDeleteLeagueSeason: deleteLeagueSeasonFlow.open,
    getDeleteAvailability: deleteLeagueSeasonFlow.availability,
    onOpenLeague: row => {
      const rowSeasonKey = row.seasonKey && row.seasonKey !== 'all'
        ? row.seasonKey
        : ''
      const leagueSeasonKey = rowSeasonKey || (
        model.seasonKey !== 'all' ? model.seasonKey : ''
      )
      const leaguePath = PLAYERS_DATABASE_UI_ROUTES.league(
        row.leagueId,
        {
          seasonKey: leagueSeasonKey,
          birthYear: row.birthYear || model.birthYear,
          level: row.level || model.leagueLevel,
          centerSeasonKey: model.seasonKey,
          centerBirthYear: model.birthYear,
          centerLevel: model.leagueLevel,
        }
      )

      navigate(leaguePath)
    },
  }), [
    deleteLeagueSeasonFlow.availability,
    deleteLeagueSeasonFlow.open,
    model.birthYear,
    model.leagueLevel,
    model.seasonKey,
    navigate,
  ])

  const handleTaskOpen = task => {
    if (!task?.url) return
    navigate(task.url)
  }

  React.useEffect(() => {
    const target = openLeagueAction.target
    if (!openLeagueAction.writeCompleted || !target) return

    if (!hasLeagueCenterSeason({
      leaguesCenterDoc: model.leaguesCenterDoc,
      leagueId: target.leagueId,
      seasonId: target.seasonId,
    })) return

    setOpenLeagueModal(false)
    setOpenLeagueAction(EMPTY_OPEN_LEAGUE_ACTION)
    notify({
      status: 'success',
      title: 'הליגה נפתחה',
      message: 'הליגה והעונה נוספו למרכז הליגות ללא קבוצות',
    })
  }, [
    model.leaguesCenterDoc,
    notify,
    openLeagueAction.target,
    openLeagueAction.writeCompleted,
  ])

  const handleLeagueOpen = async option => {
    if (openLeagueAction.busy) return

    const actionTime = new Date().toISOString()
    const target = {
      leagueId: option.value,
      seasonId: option.seasonId,
    }
    setOpenLeagueAction({
      busy: true,
      error: '',
      writeCompleted: false,
      target,
    })

    try {
      const result = await openLeagueSeason({
        input: {
          league: {
            leagueId: option.value,
            names: {
              official: option.name,
              display: option.name,
              short: option.name,
              source: option.name,
            },
            region: option.region,
            ageGroupId: option.ageGroupId,
            ageGroupLabel: option.ageGroupLabel,
            level: option.level,
          },
          season: {
            seasonId: option.seasonId,
            seasonKey: option.seasonKey,
            seasonStatus: 'not_started',
            birthYear: option.birthYear,
            seasonUrl: '',
            leagueTotalRound: null,
            gameDurationMinutes: option.gameDurationMinutes,
            competitionRules: { configured: false },
          },
          createdAt: actionTime,
          updatedAt: actionTime,
        },
        display: {
          leagueName: option.name,
          seasonKey: option.seasonKey,
          birthYear: option.birthYear,
        },
      })

      if (!result || result.executionStatus !== 'succeeded' || result.status !== 'closed') {
        throw new Error('פתיחת הליגה הסתיימה ללא אישור תקין')
      }

      setOpenLeagueAction(current => ({
        ...current,
        writeCompleted: true,
      }))
    } catch (error) {
      setOpenLeagueAction(current => ({
        ...current,
        busy: false,
        error: error && error.message ? error.message : 'פתיחת הליגה נכשלה',
      }))
    }
  }

  const handleOpenLeagueModal = () => {
    setOpenLeagueAction(EMPTY_OPEN_LEAGUE_ACTION)
    setOpenLeagueModal(true)
  }

  const handleCloseLeagueModal = () => {
    if (openLeagueAction.busy) return
    setOpenLeagueModal(false)
    setOpenLeagueAction(EMPTY_OPEN_LEAGUE_ACTION)
  }

  const handleTaskEditSave = async patch => {
    if (!editTask?.id || taskActions.pending) return

    const nextPatch = {
      ...patch,
      doneAt: patch.status === TASK_STATUS.DONE ? Date.now() : null,
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
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <LeagueCenterHeader
          breadcrumbs={breadcrumbs}
          onNavigateToSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onNavigateToEntry={() => navigate(PLAYERS_DATABASE_UI_ROUTES.entry)}
        />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <LeagueCenterKpiOverview summary={model.summary} />
            <LeagueCenterTable
              columns={columns}
              model={model}
              onOpenLeague={handleOpenLeagueModal}
            />
          </Box>

          <LeagueCenterSidePanel
            model={model}
            tasks={tasksModel.tasks}
            loading={tasksModel.loading}
            onOpenTask={() => setTaskModalOpen(true)}
            onOpenTaskItem={handleTaskOpen}
            onEditTask={setEditTask}
          />
        </Box>
      </Box>

      <DeleteLeagueSeasonModal flow={deleteLeagueSeasonFlow} />

      <OpenLeagueModal
        open={openLeagueModal}
        options={model.openLeagueOptions}
        busy={openLeagueAction.busy}
        waitingForCenter={openLeagueAction.writeCompleted}
        error={openLeagueAction.error}
        onConfirm={handleLeagueOpen}
        onClose={handleCloseLeagueModal}
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
        model={model}
        onClose={() => setTaskModalOpen(false)}
      />
    </PlayersDatabaseLayout>
  )
}
