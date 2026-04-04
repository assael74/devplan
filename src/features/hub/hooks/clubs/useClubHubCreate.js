// features/hub/hooks/clubs/useClubHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolveClubName(draft = {}, created = {}) {
  const clubName = created?.clubName || draft?.clubName || ''
  const full = `${clubName}`.trim()

  return full || null
}

export default function useClubHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreateClub = useCallback(
    async ({ draft, context }) => {
      const entityName = resolveClubName(draft)

      try {
        setSaving(true)

        const created = await createActions.club({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'team',
          entityName: resolveClubName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'club',
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
    runCreateClub,
  }
}
