import * as React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy'
import { AnimatePresence, motion } from 'framer-motion'

import { iconUi } from '../../core/icons/iconUi.js'
import { animatedModalSx as sx } from './sx/animatedModal.sx.js'

const motionProps = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 6 },
  transition: { duration: 0.2, ease: 'easeOut' },
}

export default function AnimatedModal({
  open = false,
  title = '',
  description = '',
  iconId = '',
  children,
  confirmLabel = 'שמירה',
  cancelLabel = 'ביטול',
  confirmIconId = '',
  size = 'md',
  busy = false,
  disabled = false,
  hideFooter = false,
  persistent = false,
  contentSx,
  footerSx,
  onConfirm,
  onClose,
}) {
  const handleClose = (event, reason) => {
    if (busy) return
    if (persistent && reason) return
    onClose?.()
  }

  const handleConfirm = () => {
    if (busy || disabled) return
    onConfirm?.()
  }

  return (
    <AnimatePresence>
      {open ? (
        <Modal open={open} onClose={handleClose} sx={sx.root}>
          <Box
            component={motion.div}
            {...motionProps}
            sx={sx.motionWrap[size] || sx.motionWrap.md}
          >
            <ModalDialog variant='outlined' sx={sx.dialog}>
              <DialogTitle sx={sx.header}>
                <Box sx={sx.headerContent}>
                  {iconId ? (
                    <Box sx={sx.headerIcon}>
                      {iconUi({ id: iconId, size: 'md' })}
                    </Box>
                  ) : null}

                  <Box sx={sx.titleWrap}>
                    <Typography level='title-lg' sx={sx.title}>
                      {title}
                    </Typography>

                    {description ? (
                      <Typography level='body-sm' sx={sx.description}>
                        {description}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>

                <ModalClose
                  disabled={busy}
                  onClick={handleClose}
                  sx={sx.closeButton}
                />
              </DialogTitle>

              <DialogContent sx={sx.dialogContent}>
                <Box
                  className='dpScrollThin'
                  sx={{ ...sx.content, ...(contentSx || {}) }}
                >
                  {children}
                </Box>
              </DialogContent>

              {!hideFooter ? (
                <Box sx={{ ...sx.footer, ...(footerSx || {}) }}>
                  <Button
                    variant='solid'
                    loading={busy}
                    disabled={disabled || busy}
                    startDecorator={
                      busy
                        ? <CircularProgress size='sm' />
                        : confirmIconId
                          ? iconUi({ id: confirmIconId, size: 'sm' })
                          : null
                    }
                    onClick={handleConfirm}
                    sx={sx.confirmButton}
                  >
                    {confirmLabel}
                  </Button>

                  <Button
                    variant='outlined'
                    disabled={busy}
                    onClick={handleClose}
                    sx={sx.cancelButton}
                  >
                    {cancelLabel}
                  </Button>
                </Box>
              ) : null}
            </ModalDialog>
          </Box>
        </Modal>
      ) : null}
    </AnimatePresence>
  )
}
