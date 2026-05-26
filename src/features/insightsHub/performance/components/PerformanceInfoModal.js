// features/insightsHub/performance/components/PerformanceInfoModal.js

import React from 'react'
import { Box, Button, Modal, ModalDialog, Typography } from '@mui/joy'
import { AnimatePresence, motion } from 'framer-motion'

import PerformanceCasesBlock from './blocks/PerformanceCasesBlock.js'
import PerformanceNumbersBlock from './blocks/PerformanceNumbersBlock.js'
import PerformanceProfilesBlock from './blocks/PerformanceProfilesBlock.js'

import {
  modalSx,
} from './sx/modal.sx.js'

const motionProps = {
  initial: { opacity: 0, y: 18, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.97 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

function TextContent({ panel }) {
  return (
    <Typography level="body-md" sx={modalSx.text}>
      {panel?.item?.hiddenText}
    </Typography>
  )
}

function resolveContent(panel) {
  if (panel?.type === 'details') {
    return <TextContent panel={panel} />
  }

  if (panel?.type === 'cases') {
    return <PerformanceCasesBlock block={panel.block} />
  }

  if (panel?.type === 'numbers') {
    return <PerformanceNumbersBlock block={panel.block} />
  }

  if (panel?.type === 'profiles') {
    return <PerformanceProfilesBlock block={panel.block} />
  }

  return null
}

export default function PerformanceInfoModal({
  open,
  panel,
  onClose,
  placement = 'left',
  variant = 'content',
}) {
  if (!panel) return null

  return (
    <AnimatePresence>
      {open ? (
        <Modal open={open} onClose={onClose} sx={modalSx.root}>
          <ModalDialog
            component={motion.div}
            {...motionProps}
            variant="outlined"
            sx={modalSx.dialog({ placement, variant })}
          >
            <Box sx={modalSx.header}>
              <Box sx={modalSx.titleWrap}>
                <Typography level="body-xs" sx={modalSx.kicker}>
                  {panel.kicker || 'הרחבה'}
                </Typography>

                <Typography level="h3" sx={modalSx.title}>
                  {panel.title || panel.label}
                </Typography>
              </Box>

              <Button size="sm" variant="soft" color="neutral" onClick={onClose}>
                סגור
              </Button>
            </Box>

            <Box className="dpScrollThin" sx={modalSx.content}>
              {resolveContent(panel)}
            </Box>
          </ModalDialog>
        </Modal>
      ) : null}
    </AnimatePresence>
  )
}
