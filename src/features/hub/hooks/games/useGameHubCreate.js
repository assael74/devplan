// src/features/hub/hooks/games/useGameHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolveGameName(draft = {}, created = {}) {
  const rival = created?.rival || draft?.rival || ''
  const gameDate = created?.gameDate || draft?.gameDate || ''
  const full = `${rival} ${gameDate}`.trim()

  return full || null
}

export default function useGameHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreateGame = useCallback(
    async ({ draft, context }) => {
      const entityName = resolveGameName(draft)

      try {
        setSaving(true)

        const created = await createActions.game({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'game',
          entityName: resolveGameName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'game',
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
    runCreateGame,
  }
}
