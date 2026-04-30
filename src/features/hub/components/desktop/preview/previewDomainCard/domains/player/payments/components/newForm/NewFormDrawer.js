// previewDomainCard/domains/player/payments/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import PaymentCreateFields from '../../../../../../../../../../../ui/forms/ui/payments/PaymentCreateFields.js'

import usePaymentHubCreate from '../../../../../../../../../hooks/payments/usePaymentHubCreate.js'

import {
  buildPaymentCreateDraft,
  getPaymentCreateValidity,
  validatePaymentCreateDraft,
  isPaymentCreateDirty,
  buildPaymentCreateMeta,
} from '../../../../../../../../../createLogic/index.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr 1fr' },
}

export default function NewFormDrawer({
  open,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || context?.entity || null

  const initial = useMemo(() => buildPaymentCreateDraft(context), [context])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const validity = useMemo(() => getPaymentCreateValidity(draft), [draft])
  const validation = useMemo(() => validatePaymentCreateDraft(draft), [draft])
  const meta = useMemo(() => buildPaymentCreateMeta(draft, context), [draft, context])
  const isDirty = useMemo(() => isPaymentCreateDirty(draft, initial), [draft, initial])

  const { saving, runCreatePayment } = usePaymentHubCreate()

  const canSave = isDirty && validation?.ok && !saving

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return

    try {
      const created = await runCreatePayment({ draft, context })
      onSaved?.(created || draft)
      onClose?.()
    } catch (error) {
      console.error('create payment failed:', error)
    }
  }, [canSave, saving, runCreatePayment, draft, context, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = saving
    ? { text: meta?.savingText || 'שומר תשלום חדש...', color: 'primary' }
    : !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !validation?.ok
    ? { text: validation?.message || 'יש להשלים את כל שדות החובה', color: 'warning' }
    : { text: 'מוכן לשמירה', color: 'success' }

  return (
    <DrawerShell
      entity="payment"
      open={open}
      onClose={onClose}
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: meta?.saveText || 'שמירה',
        saving: meta?.savingText || 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={player?.playerFullName || 'שחקן'}
          subline={draft?.paymentFor || 'תשלום חדש'}
          titleIconId="payments"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <PaymentCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          validity={validity}
          layout={layout}
        />
      </Box>
    </DrawerShell>
  )
}
