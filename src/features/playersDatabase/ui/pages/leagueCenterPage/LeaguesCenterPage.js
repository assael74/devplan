// src/features/playersDatabase/ui/pages/leagueCenterPage/LeaguesCenterPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeagueCenter } from '../../hooks/useLeagueCenter.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueCenterHeader from './LeagueCenterHeader.js'
import LeagueCenterOverview from './LeagueCenterOverview.js'
import LeagueCenterTable from './LeagueCenterTable.js'
import LeagueCenterSidePanel from './LeagueCenterSidePanel.js'
import {
  CreateSeasonModal,
  TaskEditModal,
  WorkTaskModal,
  WriteFlowReportModal,
} from '../../components/modals/index.js'
import useLeagueSeasonCreate from './hooks/useLeagueSeasonCreate.js'
import { buildLeagueCenterColumns } from './logic/leagueCenter.columns.js'
import { TASK_STATUS } from '../../../../../shared/tasks/tasks.constants.js'
import { leaguesCenterPageSx as sx } from './sx/leaguesCenterPage.sx.js'

export default function LeaguesCenterPage() {
  const navigate = useNavigate()
  const model = useLeagueCenter()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const seasonCreate = useLeagueSeasonCreate({ onSuccess: model.reload })
  const [taskModalOpen, setTaskModalOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState(null)
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'ניהול נתוני ליגות' },
  ])

  const columns = React.useMemo(() => buildLeagueCenterColumns({
    onCreateSeason: seasonCreate.open,
    onOpenLeague: row => {
      const rowSeasonKey = row.seasonKey && row.seasonKey !== 'all'
        ? row.seasonKey
        : row.seasonId
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
    model.birthYear,
    model.leagueLevel,
    model.seasonKey,
    navigate,
    seasonCreate.open,
  ])

  const handleTaskOpen = task => {
    if (!task?.url) return
    navigate(task.url)
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
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <LeagueCenterHeader
          breadcrumbs={breadcrumbs}
          onNavigateToSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onNavigateToEntry={() => navigate(PLAYERS_DATABASE_UI_ROUTES.entry)}
        />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <LeagueCenterOverview summary={model.summary} />
            <LeagueCenterTable columns={columns} model={model} />
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

      <CreateSeasonModal
        open={Boolean(seasonCreate.league)}
        league={seasonCreate.league}
        defaultSeasonKey={model.seasonKey}
        lockSeason
        lockTarget
        busy={seasonCreate.busy}
        onClose={seasonCreate.close}
        onConfirm={seasonCreate.confirm}
      />

      <WriteFlowReportModal
        open={Boolean(seasonCreate.writeReport)}
        report={seasonCreate.writeReport}
        onClose={seasonCreate.closeWriteReport}
      />
    </PlayersDatabaseLayout>
  )
}
