// playerProfile/mobile/modules/payments/components/parentDrawer/parentDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Drawer,
  Avatar,
  Button,
  DialogTitle,
  DialogContent,
  ModalClose,
  Divider,
  Stack,
  Sheet,
  Box,
  Typography,
} from '@mui/joy'

import ParentNameField from '../../../../../../../../ui/fields/inputUi/parent/ParentNameField.js'
import EmailField from '../../../../../../../../ui/fields/inputUi/parent/EmailField.js'
import PhoneField from '../../../../../../../../ui/fields/inputUi/parent/PhoneField.js'
import ParentRoleSelectField from '../../../../../../../../ui/fields/selectUi/parent/ParentRoleSelectField.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { usePlayerHubUpdate } from '../../../../../../hooks/players/usePlayerHubUpdate.js'

import {
  buildParentEditInitial,
  buildParentMeta,
  buildParentsPlayerPatch,
  getIsParentEditValid,
  getParentEditFieldErrors,
  isParentEditDirty,
} from '../../../../../../editLogic/payments/index.js'

import { drawerSx as sx } from './../../sx/drawer.sx.js'

export default function ParentDrawer({
  open,
  onClose,
  player,
  parent = null,
  onSaved,
}) {
  const initial = useMemo(() => {
    return buildParentEditInitial(parent)
  }, [parent])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const { run, pending } = usePlayerHubUpdate(player)

  const parents = Array.isArray(player?.parents) ? player.parents : []
  const isEdit = Boolean(parent?.id)

  const fieldErrors = useMemo(() => {
    return getParentEditFieldErrors(draft)
  }, [draft])

  const isValid = useMemo(() => {
    return getIsParentEditValid(draft)
  }, [draft])

  const isDirty = useMemo(() => {
    return isParentEditDirty(draft, initial)
  }, [draft, initial])

  const canSave = isValid && isDirty && !pending

  const title = isEdit ? 'עריכת כרטיס הורה' : 'יצירת כרטיס הורה חדש'
  const buttonText = isEdit ? 'שמירת שינויים' : 'יצירת כרטיס הורה'
  const metaText = buildParentMeta(draft, player)

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    const patch = buildParentsPlayerPatch({
      player,
      parents,
      draft,
      editingId: parent?.id || '',
    })

    await run('playerParentsEdit', patch, {
      section: 'playerParents',
      playerId: player?.id,
      createIfMissing: false,
    })

    onSaved(patch)
    onClose()
  }, [canSave, player, parents, draft, parent?.id, run, onSaved, onClose])

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor="bottom"
      open={!!open}
      onClose={onClose}
      slotProps={{
        content: { sx: sx.drawer },
      }}
    >
      <Sheet sx={sx.sheet}>
        <DialogTitle>{title}</DialogTitle>
        <ModalClose />

        <DialogContent sx={{ gap: 2, px: 1 }}>
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={player?.photo || playerImage} />

              <Box sx={{ minWidth: 0 }}>
                <Typography level="title-xs" sx={{ color: 'text.tertiary' }}>
                  {player?.playerFullName || 'שם שחקן'}
                </Typography>

                <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
                  {metaText}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <ParentRoleSelectField
                  value={draft?.parentRole || ''}
                  error={fieldErrors?.parentRole}
                  onChange={(value) => {
                    setDraft((prev) => ({
                      ...prev,
                      parentRole: value || '',
                    }))
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <ParentNameField
                  value={draft?.parentName || ''}
                  error={fieldErrors?.parentName}
                  onChange={(value) => {
                    setDraft((prev) => ({
                      ...prev,
                      parentName: value || '',
                    }))
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <EmailField
                  value={draft?.parentEmail || ''}
                  onChange={(value) => {
                    setDraft((prev) => ({
                      ...prev,
                      parentEmail: value || '',
                    }))
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <PhoneField
                  value={draft?.parentPhone || ''}
                  error={fieldErrors?.parentPhone}
                  onChange={(value) => {
                    setDraft((prev) => ({
                      ...prev,
                      parentPhone: value || '',
                    }))
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <Divider sx={{ mt: 'auto' }} />

        <Stack
          direction="row"
          useFlexGap
          spacing={1}
          sx={{ justifyContent: 'space-between' }}
        >
          <Button
            onClick={handleSave}
            loading={pending}
            disabled={!canSave || pending}
            startDecorator={iconUi({ id: 'save' })}
            sx={sx.conBut}
          >
            {buttonText}
          </Button>

          <Button
            variant="outlined"
            color="neutral"
            onClick={handleReset}
            disabled={pending || !isDirty}
            startDecorator={iconUi({ id: 'reset' })}
          >
            איפוס
          </Button>
        </Stack>
      </Sheet>
    </Drawer>
  )
}
