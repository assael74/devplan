// C:\projects\devplan\src\ui\domains\video\videoAnalysis\drawer\VideoEditDrawerFooter.js
import React from 'react'
import { Box, Button } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function VideoEditDrawerFooter({ dirty, busy, saveDisabled, onReset, onSave, sx }) {
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
