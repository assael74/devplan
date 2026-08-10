// src/features/playersDatabase/ui/hooks/usePlayersDatabaseTaskActions.js

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'
import { TASK_STATUS } from '../../../../shared/tasks/tasks.constants.js'

export default function usePlayersDatabaseTaskActions() {
  const taskUpdate = useUpdateAction({
    routerEntityType: 'tasks',
    snackEntityType: 'task',
    entityName: 'משימה',
    requireAnyUpdated: true,
  })

  const updateTask = (task, fieldsPatch) => {
    if (!task?.id) return Promise.resolve(null)

    return taskUpdate.runUpdate(fieldsPatch, {
      id: task.id,
      taskId: task.id,
      section: 'playersDatabaseTask',
    })
  }

  const markDone = task => updateTask(task, {
    status: TASK_STATUS.DONE,
    doneAt: Date.now(),
  })

  return {
    updateTask,
    markDone,
    pending: taskUpdate.pending,
  }
}
