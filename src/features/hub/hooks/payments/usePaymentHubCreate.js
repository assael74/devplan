// src/features/hub/hooks/payments/usePaymentHubCreate.js

import {
  resolvePaymentCreateName,
  resolveStaticEntityType,
  useHubCreateAction,
} from '../shared/index.js'

const resolvePaymentType = resolveStaticEntityType('payment')

export default function usePaymentHubCreate() {
  const { saving, runCreate } = useHubCreateAction({
    resolveActionEntityType: resolvePaymentType,
    notificationEntityType: 'payment',
    resolveEntityName: resolvePaymentCreateName,
  })

  return {
    saving,
    runCreatePayment: runCreate,
  }
}
