// previewDomainCard/domains/player/payments/components/drawer/EditDrawer.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePaymentHubUpdate } from '../../../../../../../../../hooks/payments/usePaymentHubUpdate.js'

import PaymentCreateFields from '../../../../../../../../../../../ui/forms/ui/payments/PaymentCreateFields.js'

import {
  buildPaymentEditInitial,
  buildPaymentEditPatch,
  buildPaymentMeta,
  getIsPaymentEditValid,
  isPaymentEditDirty,
} from '../../../../../../../../../editLogic/payments/index.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
}

export default function EditDrawer({
  open,
  payment,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildPaymentEditInitial(payment), [payment])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const livePayment = useMemo(() => {
    const playerId = draft?.playerId || initial?.raw?.playerId || initial?.raw?.player?.id || ''

    const player = initial?.raw?.player ||   (context?.players || []).find((item) => item?.id === playerId) || null

    return {
      ...initial?.raw,
      ...draft,
      playerId,
      type: draft?.type || initial?.raw?.type || '',
      status: draft?.status || initial?.raw?.status || '',
      paymentFor: draft?.paymentFor || '',
      price: draft?.price ?? '',
      player,
      metaLabel: buildPaymentMeta({
        ...initial?.raw,
        ...draft,
        player,
      }),
    }
  }, [initial?.raw, draft, context?.players])

  const isValid = useMemo(() => getIsPaymentEditValid(draft), [draft])

  const isDirty = useMemo(() => {
    return isPaymentEditDirty(draft, initial)
  }, [draft, initial])

  const patch = useMemo(() => {
    return buildPaymentEditPatch(draft, initial)
  }, [draft, initial])

  const { run: runPaymentUpdate, pending } = usePaymentHubUpdate(initial?.raw)

  const canSave = !!initial?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await runPaymentUpdate('playerPaymentEdit', patch, {
      paymentId: initial.id,
      section: 'paymentEdit',
      createIfMissing: true,
    })

    const updatedPayment = {
      ...initial.raw,
      ...patch,
      id: initial.id,
      status: patch.status || initial.raw?.status,
    }

    onSaved(patch, updatedPayment)
    onClose()
  }, [canSave, patch, initial.id, initial.raw, runPaymentUpdate, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const player = context?.player || {}
  const headerAvatar = player?.photo || playerImage

  const headerTitle = player?.playerFullName || 'שחקן'

  const headerMeta = livePayment?.metaLabel ||   draft?.metaLabel || 'פרטי תשלום'

  const status = !isValid
    ? { text: 'יש להשלים פרטי תשלום', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="player"
      open={open}
      onClose={onClose}
      saving={pending}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס השינויים',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={headerTitle}
          avatar={headerAvatar}
          meta={headerMeta}
          metaIconId="payments"
        />
      }
    >
      <PaymentCreateFields
        draft={draft}
        onDraft={setDraft}
        context={context}
        layout={layout}
        livePayment={livePayment}
      />
    </DrawerShell>
  )
}
