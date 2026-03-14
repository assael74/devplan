// previewDomainCard/domains/player/payments/components/drawer/EditDrawer.js

import React, { useMemo, useState, useEffect } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { usePaymentHubUpdate } from '../../../../../../../../hooks/payments/usePaymentHubUpdate.js'

import EditDrawerHeader from './EditDrawerHeader.js'
import EditFormDrawer from './EditFormDrawer.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
  buildPaymentMeta,
} from './editDrawer.utils.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawer({ open, payment, onClose, onSaved, context }) {
  const initial = useMemo(() => buildInitialDraft(payment), [payment])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setDraft(initial)
  }, [initial])

  const livePayment = useMemo(() => {
    return {
      ...initial?.raw,
      ...draft,

      playerId: draft?.playerId || initial?.raw?.playerId || initial?.raw?.player?.id || '',

      type: draft?.type || initial?.raw?.type || '',
      status: draft?.status || initial?.raw?.status || '',
      paymentFor: draft?.paymentFor || '',
      price: draft?.price ?? '',

      metaLabel: buildPaymentMeta({
        ...initial?.raw,
        ...draft,
        player:
          initial?.raw?.player ||
          context?.players?.find((p) => p?.id === (draft?.playerId || initial?.raw?.playerId)),
      }),
    }
  }, [initial?.raw, draft, context?.players])

  const isDirty = useMemo(() => getIsDirty(initial, draft), [initial, draft])

  const { run: runPaymentUpdate, pending: paymentPending } = usePaymentHubUpdate(initial?.raw)

  const pending = paymentPending
  const canSave = !!initial?.id && isDirty && !pending

  const handleSave = async () => {
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
  }

  const handleReset = () => setDraft(initial)

  const handleDelete = () => setDraft(initial)

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={pending ? undefined : onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { xs: 0, md: 2 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={sx.drawerRootSx}>
          <EditDrawerHeader payment={livePayment} />

          <EditFormDrawer
            draft={draft}
            setDraft={setDraft}
            context={context}
            livePayment={livePayment}
          />

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={iconUi({ id: 'save' })}
                onClick={handleSave}
                sx={sx.conBut}
              >
                שמירה
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={pending}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס השינויים">
                <span>
                  <IconButton
                    disabled={!isDirty || pending}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={handleReset}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="מחיקת תשלום">
                <span>
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="solid"
                    onClick={handleDelete}
                    disabled={pending || !payment?.id}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
