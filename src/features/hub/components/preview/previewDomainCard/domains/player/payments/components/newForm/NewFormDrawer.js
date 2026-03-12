// previewDomainCard/domains/player/payments/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, ModalClose, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { createActions } from '../../../../../../../../../../ui/forms/create/createActions.js'

import NewFormDrawerHeader from './NewFormDrawerHeader.js'
import PaymentCreateForm from '../../../../../../../../../../ui/forms/PaymentCreateForm.js'

import {
  buildInitialDraft,
  getIsDirty,
} from './newFormDrawer.utils.js'

import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function NewFormDrawer({ open, onClose, onSaved, context }) {
  const initial = useMemo(() => buildInitialDraft(context), [context])

  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setIsSaving(false)
    setIsValid(false)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const saving = isSaving
  const canSave = isDirty && isValid && !saving

  const handleSave = async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      const res = await createActions.payment({ draft })

      onSaved(res || draft)
      onClose()
    } catch (error) {
      console.error('create payment failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (saving) return
    setDraft(initial)
  }

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={saving ? undefined : onClose}
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
          <NewFormDrawerHeader draft={draft} />
          <ModalClose sx={{ mt: 2, mr: 2 }} />

          <Box sx={{ position: 'sticky', zIndex: 5, borderRadius: 12, bgcolor: 'background.body' }}>
            <PaymentCreateForm
              draft={draft}
              onDraft={setDraft}
              onValidChange={setIsValid}
              context={context}
              variant="drawer"
            />
          </Box>

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={saving}
                loadingPosition="start"
                disabled={!canSave}
                startDecorator={!saving ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut}
              >
                {saving ? 'שומר...' : 'שמירה'}
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={saving}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס טופס">
                <span>
                  <IconButton
                    disabled={!isDirty || saving}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={handleReset}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {saving
                ? 'שומר תשלום חדש'
                : !isDirty
                  ? 'אין שינויים'
                  : !isValid
                    ? 'יש להשלים את כל שדות החובה'
                    : 'מוכן לשמירה'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
