// src/features/hub/hooks/usePaymentHubUpdate.js

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'

export function usePaymentHubUpdate(active) {
  const paymentUpdate = useUpdateAction({
    routerEntityType: 'payments',
    snackEntityType: 'payment',
    id: active?.id,
    entityName: '',
    requireAnyUpdated: true,
  })

  const run = (patch, meta = {}) => {
    const paymentId = meta?.paymentId || active?.id

    return paymentUpdate.runUpdate(patch, {
      ...meta,
      id: paymentId,
      paymentId,
      createIfMissing: false,
    })
  }

  return { run, pending: paymentUpdate.pending }
}
