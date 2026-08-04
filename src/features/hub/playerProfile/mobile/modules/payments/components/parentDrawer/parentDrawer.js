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

import ParentFields from '../../../../../../../../ui/forms/parents/ParentFields.js'
import {
  getParentFormLayout,
} from '../../../../../../../../ui/forms/parents/form.layout.js'

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

  const playerId = player?.id || player?.playerId || player?.entityId || player?.docId || ''
  const parents = Array.isArray(player?.parents) ? player.parents : []
  const isEdit = Boolean(parent?.id)
  const layout = getParentFormLayout({ isMobile: true })

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
    if (!canSave || !playerId) return

    const patch = buildParentsPlayerPatch({
      player,
      parents,
      draft,
      editingId: parent?.id || '',
    })

    await run(patch, {
      section: 'playerParents',
      id: playerId,
      playerId,
      createIfMissing: false,
    })

    onSaved(patch)
    onClose()
  }, [canSave, playerId, player, parents, draft, parent?.id, run, onSaved, onClose])

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

            <ParentFields
              draft={draft}
              onDraft={setDraft}
              layout={layout}
              errors={fieldErrors}
              disabled={pending}
            />
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
