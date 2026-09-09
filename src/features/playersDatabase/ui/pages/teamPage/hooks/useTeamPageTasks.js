// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamPageTasks.js

import * as React from 'react'

import { TASK_STATUS } from '../../../../../../shared/tasks/tasks.constants.js'

export default function useTeamPageTasks({
  team,
  selectedSeasonKey,
  tasksModel,
  taskActions,
}) {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTask, setEditTask] = React.useState(null)

  const tasks = React.useMemo(() => {
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

  const saveEdit = React.useCallback(async patch => {
    if (!editTask?.id || taskActions.pending) return

    const nextPatch = {
      ...patch,
      doneAt: patch.status === TASK_STATUS.DONE
        ? Date.now()
        : null,
    }

    await taskActions.updateTask(editTask, nextPatch)
    setEditTask(null)
  }, [editTask, taskActions])

  const markDone = React.useCallback(async task => {
    if (!task?.id || taskActions.pending) return

    await taskActions.markDone(task)
    setEditTask(null)
  }, [taskActions])

  return {
    tasks,
    createOpen,
    editTask,
    pending: taskActions.pending,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    openEdit: setEditTask,
    closeEdit: () => setEditTask(null),
    saveEdit,
    markDone,
  }
}
