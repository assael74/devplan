// src/features/hub/hooks/payments/usePaymentHubUpdate.js

import { useUpdateAction } from '../../../../ui/domains/entityActions/updateAction.js'

export function usePaymentHubUpdate(active) {
  const paymentUpdate = useUpdateAction({
    routerEntityType: 'payments',
    snackEntityType: 'payment',
    id: active?.id,
    entityName: active?.paymentFor || 'תשלום',
    requireAnyUpdated: true,
  })

  const run = (type, patch, meta) => {
    const update = paymentUpdate
    const paymentId = meta?.paymentId || active?.id

    return update.runUpdate(patch, {
      ...meta,
      id: paymentId,
      paymentId,
      createIfMissing: meta?.createIfMissing ?? false,
    })
  }

  return { run, pending: paymentUpdate.pending }
}
