// features/hub/hooks/players/usePlayerHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolvePlayerName(draft = {}, created = {}) {
  const first = created?.playerFirstName || draft?.playerFirstName || ''
  const last = created?.playerLastName || draft?.playerLastName || ''
  const full = `${first} ${last}`.trim()

  return full || null
}

function isPrivatePlayerDraft(draft = {}, context = {}) {
  if (draft?.playerSource === 'private') return true
  if (draft?.isPrivatePlayer === true) return true
  if (context?.playerSource === 'private') return true
  if (context?.isPrivatePlayer === true) return true
  return false
}

export default function usePlayerHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreatePlayer = useCallback(
    async ({ draft, context }) => {
      const entityName = resolvePlayerName(draft)
      const isPrivate = isPrivatePlayerDraft(draft, context)
      const createAction = isPrivate ? createActions.privatePlayer : createActions.player

      try {
        setSaving(true)

        const created = await createAction({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'player',
          entityName: resolvePlayerName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'player',
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
    runCreatePlayer,
  }
}
