// src/features/hub/hooks/shared/useHubCreateAction.js

import { useCallback, useState } from 'react'

import { createEntity, unwrapActionResult } from '../../application/index.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

export default function useHubCreateAction({
  resolveActionEntityType,
  notificationEntityType,
  resolveEntityName,
}) {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreate = useCallback(
    async ({ draft = {}, context = {} }) => {
      const actionEntityType = resolveActionEntityType({ draft, context })
      const entityName = resolveEntityName({ draft, context })

      try {
        setSaving(true)

        const created = unwrapActionResult(await createEntity({
          entityType: actionEntityType,
          draft,
          context,
        }))

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: notificationEntityType,
          entityName: resolveEntityName({ draft, context, created }),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: notificationEntityType,
          entityName,
          details: mapFirestoreErrorToDetails(error),
        })

        throw error
      } finally {
        setSaving(false)
      }
    },
    [notificationEntityType, notify, resolveActionEntityType, resolveEntityName]
  )

  return {
    saving,
    runCreate,
  }
}
