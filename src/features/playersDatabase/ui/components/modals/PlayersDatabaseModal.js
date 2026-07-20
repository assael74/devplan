// features/playersDatabase/ui/components/modals/PlayersDatabaseModal.js

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

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { modalSx as sx } from './sx/modal.sx.js'

const motionProps = {
  initial: {
    opacity: 0,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
  },
  transition: {
    duration: 0.2,
    ease: 'easeOut',
  },
}

export default function PlayersDatabaseModal({
  open,
  title,
  description,
  iconId,
  children,
  confirmLabel = 'שמירה',
  cancelLabel = 'ביטול',
  confirmIconId,
  size = 'lg',
  busy = false,
  disabled = false,
  hideFooter = false,
  onConfirm,
  onClose,
}) {
  const handleClose = () => {
    if (busy) return

    if (typeof onClose === 'function') {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (busy || disabled) return

    if (typeof onConfirm === 'function') {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <Modal
          open={open}
          onClose={handleClose}
          sx={sx.root}
        >
          <Box
            component={motion.div}
            {...motionProps}
            sx={sx.motionWrap[size] || sx.motionWrap.lg}
          >
            <ModalDialog
              variant='outlined'
              sx={sx.dialog}
            >
              <DialogTitle sx={sx.header}>
                <Box sx={sx.headerContent}>
                  {iconId ? (
                    <Box sx={sx.headerIcon}>
                      {iconUi({ id: iconId, size: 'md' })}
                    </Box>
                  ) : null}

                  <Box sx={sx.titleWrap}>
                    <Typography
                      level='title-lg'
                      sx={sx.title}
                    >
                      {title}
                    </Typography>

                    {description ? (
                      <Typography
                        level='body-sm'
                        sx={sx.description}
                      >
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
                  sx={sx.content}
                >
                  {children}
                </Box>
              </DialogContent>

              {!hideFooter ? (
                <Box sx={sx.footer}>
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

