// ui/forms/create/ObjectCreateModalV2.js

import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  Box,
  Button,
  Modal,
  ModalDialog,
  Typography,
  DialogContent,
  DialogTitle,
  ModalClose,
  Tooltip,
  IconButton,
} from '@mui/joy'
import { AnimatePresence, motion } from 'framer-motion'

import { buildCreateModalV2Sx } from './sx/objectCreateV2.sx'
import { getCreateMeta } from './createRegistry'
import { iconUi } from '../../core/icons/iconUi.js'
import { getEntityColors } from '../../core/theme/Colors.js'

const motionProps = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

function useRenderType({ open, type }) {
  const [renderType, setRenderType] = React.useState(type || null)

  React.useEffect(() => {
    if (type) setRenderType(type)
  }, [type])

  React.useEffect(() => {
    if (open || type) return undefined

    const t = setTimeout(() => {
      setRenderType(null)
    }, 280)

    return () => clearTimeout(t)
  }, [open, type])

  return renderType
}

function getStatus({ isValid, isDirty }) {
  if (!isValid) {
    return {
      color: 'warning',
      text: 'יש שדות חובה חסרים',
    }
  }

  if (isDirty) {
    return {
      color: 'danger',
      text: 'יש שינויים שלא נשמרו',
    }
  }

  return {
    color: 'neutral',
    text: 'אין שינויים',
  }
}

export default function ObjectCreateModalV2({
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
  const isMobile = useMediaQuery('(max-width:900px)')
  const renderType = useRenderType({ open, type })

  const meta = React.useMemo(() => {
    return getCreateMeta(renderType)
  }, [renderType])

  const modalSize = size || meta?.size || 'sm'

  const sx = React.useMemo(() => {
    return buildCreateModalV2Sx(meta.entityType, meta.domainColor, modalSize)
  }, [meta.entityType, meta.domainColor, modalSize])

  const colors = React.useMemo(() => {
    return getEntityColors(meta.entityType)
  }, [meta.entityType])

  const FormComp = meta?.form || null

  const handleReset = React.useCallback(() => {
    if (busy) return
    if (typeof onReset === 'function') onReset()
  }, [onReset, busy])

  const handleClose = React.useCallback(() => {
    if (busy) return
    if (typeof onClose === 'function') onClose()
  }, [onClose, busy])

  const status = React.useMemo(() => {
    return getStatus({ isValid, isDirty })
  }, [isValid, isDirty])

  return (
    <AnimatePresence>
      {open ? (
        <Modal open={open} onClose={handleClose} sx={sx.root}>
          <Box component={motion.div} {...motionProps} sx={sx.motionWrap}>
            <ModalDialog variant="outlined" sx={sx.dialog}>
              <DialogTitle sx={{ ...sx.header, bgcolor: colors.bg }}>
                <Box sx={sx.headerLeft}>
                  <Box sx={sx.headerIcon}>
                    {iconUi({ id: meta.iconKey })}
                  </Box>

                  <Box sx={sx.titleWrap}>
                    <Typography level="body-xs" sx={sx.kicker}>
                      יצירת אובייקט
                    </Typography>

                    <Typography level="title-md" sx={sx.title}>
                      {meta.title}
                    </Typography>
                  </Box>
                </Box>

                <ModalClose onClick={handleClose} />
              </DialogTitle>

              <DialogContent sx={sx.dialogContent}>
                <Box sx={sx.content} className="dpScrollThin">
                  {FormComp ? (
                    <FormComp
                      draft={draft}
                      onDraft={onDraft}
                      context={context}
                      onValidChange={onValidChange}
                      variant="modal"
                      forceMobile={isMobile}
                    />
                  ) : null}
                </Box>
              </DialogContent>

              <Box sx={{ ...sx.footer, bgcolor: colors.bg }}>
                <Box sx={sx.footerActions}>
                  <Button
                    size="sm"
                    variant="solid"
                    disabled={!isValid || !isDirty || !!busy}
                    loading={!!busy}
                    startDecorator={iconUi({ id: 'save' })}
                    onClick={onConfirm}
                    sx={sx.confirmButton}
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
                        sx={sx.resetButton}
                      >
                        {iconUi({ id: 'reset' })}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

                <Typography level="body-xs" color={status.color}>
                  {status.text}
                </Typography>
              </Box>
            </ModalDialog>
          </Box>
        </Modal>
      ) : null}
    </AnimatePresence>
  )
}
