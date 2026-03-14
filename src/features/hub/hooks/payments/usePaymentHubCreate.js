// src/features/hub/hooks/payments/usePaymentHubCreate.js

import { useCallback, useState } from 'react'

import { createActions } from '../../../../ui/forms/create/createActions.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'

function resolvePaymentName(draft = {}, created = {}) {
  const paymentFor = created?.paymentFor || draft?.paymentFor || ''
  const price = created?.price || draft?.price || ''
  const full = `${paymentFor} ${price}`.trim()

  return full || null
}

export default function usePaymentHubCreate() {
  const { notify } = useSnackbar()
  const [saving, setSaving] = useState(false)

  const runCreatePayment = useCallback(
    async ({ draft, context }) => {
      const entityName = resolvePaymentName(draft)

      try {
        setSaving(true)

        const created = await createActions.payment({
          draft,
          context,
        })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.CREATE,
          entityType: 'payment',
          entityName: resolvePaymentName(draft, created),
        })

        return created
      } catch (error) {
        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.CREATE,
          entityType: 'payment',
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
    runCreatePayment,
  }
}
