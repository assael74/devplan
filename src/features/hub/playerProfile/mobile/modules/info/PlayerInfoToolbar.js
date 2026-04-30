// features/hub/playerProfile/mobile/modules/info/PlayerInfoToolbar.js

import React from 'react'
import { Box, Chip, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './toolbar.sx.js'

export default function PlayerInfoToolbar({
  isDirty,
  canSave,
  pending,
  onReset,
  onSave,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.headerDot} />

        <Typography level="title-sm" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          מידע שחקן
        </Typography>

        <Box sx={{ pl: 2 }}>
          {isDirty ? (
            <Chip size="sm" variant="soft" color="warning">
              לא נשמר
            </Chip>
          ) : (
            <Chip size="sm" variant="soft" color="success">
              שמור
            </Chip>
          )}
        </Box>
      </Box>

      <Box sx={sx.toolbarActions}>
        <IconButton
          size="sm"
          variant="soft"
          color="neutral"
          disabled={!isDirty || pending}
          onClick={onReset}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          {iconUi({ id: 'reset' })}
        </IconButton>

        <IconButton
          size="sm"
          variant="solid"
          disabled={!canSave}
          loading={pending}
          onClick={onSave}
          sx={sx.confBtn}
        >
          {iconUi({ id: 'save' })}
        </IconButton>
      </Box>
    </Box>
  )
}
