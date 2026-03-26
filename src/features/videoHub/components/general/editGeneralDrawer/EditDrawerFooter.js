// src/features/videoHub/components/drawer/EditDrawerFooter.js

import React from 'react'
import { Box, Button } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { editDrawerSx as sx } from './sx/editDrawer.sx'

export default function EditDrawerFooter({
  dirty,
  busy,
  saveDisabled,
  onReset,
  onSave,
  onDelete,
}) {
  return (
    <Box sx={sx.footer}>
      <Box sx={{ display: 'flex', gap: 1 }}>
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

        <Button
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: 'restore' })}
          disabled={!dirty || busy}
          onClick={onReset}
        >
          איפוס
        </Button>
      </Box>

      <Button
        size="sm"
        variant="soft"
        color="danger"
        startDecorator={iconUi({ id: 'delete' })}
        disabled={busy}
        onClick={onDelete}
      >
        מחיקה
      </Button>


    </Box>
  )
}
