// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerPageTasks.js

import * as React from 'react'

import { createEntity } from '../../../../../../application/actions/entities/createEntity.action.js'
import { TASK_STATUS } from '../../../../../../shared/tasks/tasks.constants.js'

export default function usePlayerPageTasks({
  player,
  historyView,
  tasksModel,
  taskActions,
  notify,
}) {
  const [editTask, setEditTask] = React.useState(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [createSaving, setCreateSaving] = React.useState(false)

  const tasks = React.useMemo(() => {
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

  const createTask = React.useCallback(async draft => {
    if (createSaving) return

    const row = historyView.selectedRow || {}
    setCreateSaving(true)

    try {
      const result = await createEntity({
        entityType: 'task',
        draft: {
          ...draft,
          contextArea: 'playersDatabase',
          contextMode: 'player',
          workContext: {
            scope: 'player',
            source: 'playersDatabase',
            playerId: player.playerId || player.id,
            playerDocumentId: player.domain?.identity?.playerDocumentId || player.id,
            externalPlayerId: player.externalPlayerId,
            playerName: player.fullName,
            seasonKey: row.seasonKey || '',
            teamId: row.teamId || '',
            teamName: row.teamName || '',
            leagueId: row.leagueId || '',
            leagueName: row.leagueName || '',
            birthYear: player.birthYear || null,
          },
        },
      })

      if (!result?.ok) throw result?.error || new Error('יצירת המשימה נכשלה')

      notify({ status: 'success', message: 'המשימה נפתחה בהצלחה.' })
      setCreateOpen(false)
    } catch (error) {
      notify({ status: 'error', message: error?.message || 'יצירת המשימה נכשלה.' })
    } finally {
      setCreateSaving(false)
    }
  }, [createSaving, historyView.selectedRow, notify, player])

  const closeCreate = React.useCallback(() => {
    if (createSaving) return
    setCreateOpen(false)
  }, [createSaving])

  return {
    tasks,
    editTask,
    createOpen,
    createSaving,
    pending: taskActions.pending,
    openEdit: setEditTask,
    closeEdit: () => setEditTask(null),
    openCreate: () => setCreateOpen(true),
    closeCreate,
    saveEdit,
    markDone,
    createTask,
  }
}
