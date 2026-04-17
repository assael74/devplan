// previewDomainCard/domains/player/payments/components/drawer/EditDrawer.js

import React, { useMemo, useState, useEffect, useCallback } from 'react'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { usePaymentHubUpdate } from '../../../../../../../../../hooks/payments/usePaymentHubUpdate.js'

import EditFormDrawer from './EditFormDrawer.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
  buildPaymentMeta,
  buildPlayerDisplayName,
} from './editDrawer.utils.js'

export default function EditDrawer({
  open,
  payment,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildInitialDraft(payment), [payment])
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

  const isDirty = useMemo(() => getIsDirty(initial, draft), [initial, draft])

  const { run: runPaymentUpdate, pending } = usePaymentHubUpdate(initial?.raw)

  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = useCallback(async () => {
    const patch = buildPatch(initial, draft)

    if (!initial?.id || !Object.keys(patch).length) {
      onClose()
      return
    }

    await runPaymentUpdate(patch, {
      id: initial.id,
      paymentId: initial.id,
      section: 'paymentEdit',
    })

    onSaved({
      id: initial.id,
      ...patch,
    })

    onClose()
  }, [initial, draft, runPaymentUpdate, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const player = livePayment?.player || null
  const headerAvatar = player?.photo || playerImage

  const headerTitle = buildPlayerDisplayName(player) || 'תשלום'

  const headerMeta = livePayment?.metaLabel ||   draft?.metaLabel || 'פרטי תשלום'

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
      <EditFormDrawer
        draft={draft}
        setDraft={setDraft}
        context={context}
        livePayment={livePayment}
      />
    </DrawerShell>
  )
}
