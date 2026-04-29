// ui/forms/create/ObjectCreateModal.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  Box,
  Button,
  Drawer,
  Typography,
  Sheet,
  DialogContent,
  DialogTitle,
  ModalClose,
  Tooltip,
  IconButton,
} from '@mui/joy'

import { buildCreateModalSx } from './sx/objectCreate.sx'
import { getCreateMeta } from './createRegistry'
import { iconUi } from '../../core/icons/iconUi.js'
import { getEntityColors } from '../../core/theme/Colors.js'

export default function ObjectCreateModal({
  open,
  type,
  draft,
  isValid,
  isDirty = false,
  onConfirm,
  onClose,
  onReset,
  onDraft,
  onValidChange,
  context,
  busy,
  size,
}) {
  const [renderType, setRenderType] = React.useState(type || null)
  const isMobile = useMediaQuery('(max-width:900px)')

  React.useEffect(() => {
    if (type) setRenderType(type)
  }, [type])

  const meta = React.useMemo(() => getCreateMeta(renderType), [renderType])

  const drawerSize = size || meta?.size || 'sm'

  const sx = React.useMemo(
    () => buildCreateModalSx(meta.entityType, meta.domainColor, drawerSize),
    [meta.entityType, meta.domainColor, drawerSize]
  )

  const colors = React.useMemo(
    () => getEntityColors(meta.entityType),
    [meta.entityType]
  )

  const FormComp = meta?.form || null

  const handleReset = React.useCallback(() => {
    if (busy) return
    if (typeof onReset === 'function') onReset()
  }, [onReset, busy])

  const handleClose = React.useCallback(() => {
    if (busy) return
    if (typeof onClose === 'function') onClose()
  }, [onClose, busy])

  React.useEffect(() => {
    if (!open && !type) {
      const t = setTimeout(() => {
        setRenderType(null)
      }, 280)

      return () => clearTimeout(t)
    }
  }, [open, type])

  const statusColor = !isValid ? 'warning' : isDirty ? 'danger' : 'neutral'
  const statusText = !isValid
    ? 'יש שדות חובה חסרים'
    : isDirty
      ? 'יש שינויים שלא נשמרו'
      : 'אין שינויים'

  return (
    <Drawer
      size={drawerSize}
      variant="plain"
      anchor="bottom"
      open={open}
      onClose={handleClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <DialogTitle sx={{ ...sx.headerSx, bgcolor: colors.bg }}>
          <Box sx={sx.headerLeft}>
            <Box sx={sx.headerIcon}>
              {iconUi({ id: meta.iconKey })}
            </Box>

            <Typography level="title-md" sx={sx.title}>
              {meta.title}
            </Typography>
          </Box>

          <ModalClose onClick={handleClose} />
        </DialogTitle>

        <DialogContent sx={sx.dialogContentSx}>
          <Box sx={sx.content} className="dpScrollThin">
            {FormComp ? (
              <FormComp
                draft={draft}
                onDraft={onDraft}
                context={context}
                onValidChange={onValidChange}
                variant="drawer"
                forceMobile={isMobile}
              />
            ) : null}
          </Box>
        </DialogContent>

        <Box sx={{ ...sx.footerSx, bgcolor: colors.bg }}>
          <Box sx={sx.footerActionsSx}>
            <Button
              size="sm"
              variant="solid"
              disabled={!isValid || !isDirty || !!busy}
              loading={!!busy}
              startDecorator={iconUi({ id: 'save' })}
              onClick={onConfirm}
              sx={sx.confirmButtonSx}
            >
              שמירה
            </Button>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              disabled={!!busy}
              startDecorator={iconUi({ id: 'close' })}
              onClick={handleClose}
            >
              ביטול
            </Button>

            <Tooltip title="איפוס השינויים">
              <span>
                <IconButton
                  size="sm"
                  variant="soft"
                  disabled={!!busy || !isDirty}
                  onClick={handleReset}
                  sx={sx.icoRes}
                >
                  {iconUi({ id: 'reset' })}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography level="body-xs" color={statusColor}>
            {statusText}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
