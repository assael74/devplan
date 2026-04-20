// playerProfile/mobile/modules/payments/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePaymentHubUpdate } from '../../../../../../hooks/payments/usePaymentHubUpdate.js'
import PaymentCreateFields from '../../../../../../../../ui/forms/ui/payments/PaymentCreateFields.js'

import {
  buildPaymentInitialDraft,
  buildPaymentPatch,
  getIsPaymentDirty,
  buildPaymentMeta,
} from './../../../../../sharedLogic'

const PAYMENT_EDIT_LAYOUT = {
  topCols: { xs: '1fr' },
  mainCols: { xs: '1fr 1fr' },
  notesCols: { xs: '1fr' },
  tagsCols: { xs: '1fr' },
}

export default function EditDrawer({
  open,
  payment,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildPaymentInitialDraft(payment), [payment])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const player = context?.player || null

  const livePayment = useMemo(() => {
    return {
      ...initial?.raw,
      ...draft,
      player,
      metaLabel: buildPaymentMeta({
        ...initial?.raw,
        ...draft,
        player,
      }),
    }
  }, [initial?.raw, draft, player])

  const isDirty = useMemo(() => getIsPaymentDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPaymentPatch(draft, initial), [draft, initial])

  const { run, pending } = usePaymentHubUpdate(payment)
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('playerPaymentEdit', patch, {
      section: 'playerPaymentEdit',
      paymentId: initial.id,
      createIfMissing: true,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft({ ...initial })
  }, [initial, pending])

  const headerAvatar = player?.photo || playerImage
  const headerTitle = player?.playerFullName || player?.name || 'שחקן'
  const headerMeta = livePayment?.metaLabel || 'עריכת תשלום'

  const status = isDirty
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
        layout={PAYMENT_EDIT_LAYOUT}
      />
    </DrawerShell>
  )
}
