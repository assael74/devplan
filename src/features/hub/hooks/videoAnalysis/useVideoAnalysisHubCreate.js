// features/hub/hooks/videoAnalysis/useVideoAnalysisHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolveVideoAnalysisName(draft = {}, created = {}) {
  const name = created?.name || draft?.name || ''
  return name || null
}

export default function useVideoAnalysisHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreateVideoAnalysis = useCallback(
    async ({ draft, context }) => {
      const entityName = resolveVideoAnalysisName(draft)

      try {
        setSaving(true)

        const created = await createActions.videoAnalysis({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'videoAnalysis',
          entityName: resolveVideoAnalysisName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'videoAnalysis',
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
    runCreateVideoAnalysis,
  }
}
