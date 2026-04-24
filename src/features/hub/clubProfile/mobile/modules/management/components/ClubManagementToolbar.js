// clubProfile/mobile/modules/management/components/ClubManagementToolbar.js

import React from 'react'
import { Box, Button, Chip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { moduleSx as sx } from '../module.sx.js'

export default function ClubManagementToolbar({
  isDirty,
  canSave,
  pending,
  onSave,
  onReset,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarRow}>
        <Button
          size="sm"
          variant="solid"
          disabled={pending || !canSave}
          onClick={onSave}
          loading={pending}
          sx={sx.confBtn}
          startDecorator={iconUi({ id: 'save' })}
        >
          שמירה
        </Button>

        <IconButton
          size="sm"
          variant="soft"
          color="neutral"
          disabled={!isDirty || pending}
          onClick={onReset}
        >
          {iconUi({ id: 'reset' })}
        </IconButton>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Chip
        size="sm"
        variant="soft"
        color={isDirty ? 'warning' : 'neutral'}
        startDecorator={iconUi({ id: isDirty ? 'warning' : 'done' })}
        sx={{ flexShrink: 0 }}
      >
        {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
      </Chip>
    </Box>
  )
}
