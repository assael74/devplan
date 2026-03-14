// src/features/hub/hooks/meetings/useMeetingHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolveMeetingName(draft = {}, created = {}) {
  const meetingFor = created?.meetingFor || draft?.meetingFor || ''
  const meetingDate = created?.meetingDate || draft?.meetingDate || ''
  const full = `${meetingFor} ${meetingDate}`.trim()

  return full || null
}

export default function useMeetingHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreateMeeting = useCallback(
    async ({ draft, context }) => {
      const entityName = resolveMeetingName(draft)

      try {
        setSaving(true)

        const created = await createActions.meeting({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'meeting',
          entityName: resolveMeetingName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'meeting',
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
    runCreateMeeting,
  }
}
