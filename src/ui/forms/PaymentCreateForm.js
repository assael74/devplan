// ui/forms/PaymentCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import PaymentCreateFields from './ui/payments/PaymentCreateFields.js'
import { getPaymentCreateFormLayout } from './layouts/paymentCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function PaymentCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const paymentFor = draft.paymentFor ? draft.paymentFor : ''
  const type = draft.type ? draft.type: 'monthlyPayment'
  const price = draft.price ? draft.price : ''

  const validity = useMemo(() => {
    const okFor = !!clean(draft.paymentFor)
    const okType = !!clean(draft.type)

    const pri = Number(String(draft.price).replace(/,/g, ''))
    const okPrice = Number.isFinite(pri) && pri > 0

    return {
      okFor,
      okType,
      okPrice,
      isValid: okFor && okType && okPrice,
    }
  }, [draft])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getPaymentCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <PaymentCreateFields
      draft={draft}
      onDraft={onDraft}
      fieldDisabled={{ status: true }}
      onValidChange={onValidChange}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
