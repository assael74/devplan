// features/hub/hooks/teams/useTeamHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolveTeamName(draft = {}, created = {}) {
  const teamName = created?.teamName || draft?.teamName || ''
  const teamYear = created?.teamYear || draft?.teamYear || ''
  const full = `${teamName} ${teamYear}`.trim()

  return full || null
}

export default function useTeamHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreateTeam = useCallback(
    async ({ draft, context }) => {
      const entityName = resolveTeamName(draft)

      try {
        setSaving(true)

        const created = await createActions.team({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'team',
          entityName: resolveTeamName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'team',
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
    runCreateTeam,
  }
}
