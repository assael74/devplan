// features/home/sharedHook/useTaskCreate.js

import { useCallback, useState } from 'react'

import { createEntity, unwrapActionResult } from '../../../application/index.js'
import { useSnackbar } from '../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../ui/core/feedback/snackbar/snackbar.format.js'

export default function useTaskCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreateTask = useCallback(
    async ({ draft, context }) => {
      const entityName = draft?.title || 'משימה'

      try {
        setSaving(true)

        const result = await createEntity({
          entityType: 'task',
          draft,
          context,
        })

        const created = unwrapActionResult(result)

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'tasks',
          entityName,
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'tasks',
          entityName,
          details: mapFirestoreErrorToDetails(error),
        })

        throw error
      } finally {
        setSaving(false)
      }
    },
    [notify]
  )

  return {
    saving,
    runCreateTask,
  }
}
