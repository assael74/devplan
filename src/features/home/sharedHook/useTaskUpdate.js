// features/home/sharedHook/useTaskUpdate.js

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function useTaskUpdate(active) {
  const taskUpdate = useUpdateAction({
    routerEntityType: 'tasks',
    snackEntityType: 'task',
    id: active?.id,
    entityName: active?.title || 'משימה',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = taskUpdate
    const taskId = meta?.taskId || active?.id

    return update.runUpdate(patch, {
      ...meta,
      id: taskId,
      taskId,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return { run, pending: taskUpdate.pending }
}
