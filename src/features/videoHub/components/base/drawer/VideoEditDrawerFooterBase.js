// src/features/videoHub/components/base/drawer/VideoEditDrawerFooterBase.js
import React from 'react'
import { Box, Button } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function VideoEditDrawerFooterBase({ dirty, busy, saveDisabled, onReset, onSave, sx }) {
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
        sx={sx.btnSave}
      >
        שמירה
      </Button>
    </Box>
  )
}
