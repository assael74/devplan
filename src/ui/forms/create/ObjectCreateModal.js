// ui/forms/create/ObjectCreateModal.js
import React from 'react'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'

import { buildCreateModalSx } from './sx/objectCreate.sx'
import { getCreateMeta } from './createRegistry'
import { iconUi } from '../../core/icons/iconUi.js'

export default function ObjectCreateModal({
  open,
  type,
  draft,
  isValid,
  onConfirm,
  onClose,
  onReset,
  onDraft,
  onValidChange,
  context,
  busy,
}) {
  const meta = React.useMemo(() => getCreateMeta(type), [type])
  const sx = React.useMemo(
    () => buildCreateModalSx(meta.entityType, meta.domainColor),
    [meta.entityType, meta.domainColor]
  )

  const FormComp = meta?.form || null

  const handleCancel = React.useCallback(() => {
    if (busy) return
    if (typeof onReset === 'function') onReset()
  }, [onReset, busy])

  const handleX = React.useCallback(() => {
    if (busy) return
    if (typeof onReset === 'function') onReset()
    if (typeof onClose === 'function') onClose()
  }, [onReset, onClose, busy])

  return (
    <Modal open={!!open} onClose={handleCancel} sx={sx.overlay}>
      <ModalDialog sx={sx.dialog}>
        <Box sx={sx.header}>
          <Box sx={sx.headerLeft}>
            <Box sx={sx.headerIcon}>{iconUi({ id: meta.iconKey })}</Box>

            <Typography level="title-md" sx={sx.title}>
              {meta.title}
            </Typography>
          </Box>

          <Box sx={sx.actions}>
            <Button
              size="sm"
              variant="solid"
              disabled={!isValid || !!busy}
              loading={!!busy}
              startDecorator={iconUi({ id: 'save' })}
              onClick={onConfirm}
            >
              אישור
            </Button>

            <Button
              size="sm"
              variant="soft"
              disabled={!!busy}
              startDecorator={iconUi({ id: 'reset' })}
              onClick={handleCancel}
            >
              איפוס
            </Button>

            <IconButton
              size="sm"
              variant="plain"
              disabled={!!busy}
              onClick={handleX}
              aria-label="סגור"
            >
              {iconUi({ id: 'close' })}
            </IconButton>
          </Box>
        </Box>

        <Box sx={sx.body} className="dpScrollThin">
          {FormComp ? (
            <FormComp
              draft={draft}
              onDraft={onDraft}
              context={context}
              onValidChange={onValidChange}
              mode="modal"
            />
          ) : (
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              כאן יופיעו שדות הטופס.
            </Typography>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  )
}
