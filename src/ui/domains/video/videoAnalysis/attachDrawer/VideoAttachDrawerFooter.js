// videoHub/components/analysis/attachDrawer/VideoAttachDrawerFooter.js
import React from 'react'
import { Box, Button } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { videoAttachDrawerSx as sx } from './videoAttachDrawer.sx'

export default function VideoAttachDrawerFooter({ dirty, busy, saveDisabled, onReset, onSave }) {
  return (
    <Box sx={sx.footer}>
      <Button
        size="sm"
        variant="soft"
        startDecorator={iconUi({ id: 'restore' })}
        disabled={!dirty || busy}
        onClick={onReset}
      >
        איפוס
      </Button>

      <Button
        size="sm"
        variant="solid"
        startDecorator={iconUi({ id: 'save' })}
        loading={busy}
        loadingPosition="center"
        disabled={saveDisabled}
        onClick={onSave}
        sx={sx.btnSave('videoAnalysis')}
      >
        שמירה
      </Button>
    </Box>
  )
}
