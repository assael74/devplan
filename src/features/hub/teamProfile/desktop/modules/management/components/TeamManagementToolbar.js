// src/features/hub/teamProfile/desktop/modules/management/components/TeamManagementToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { moduleSx as sx } from '../module.sx.js'

export default function TeamManagementToolbar({
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
          ניהול קבוצה
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
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          disabled={!isDirty || pending}
          onClick={onReset}
          startDecorator={iconUi({ id: 'reset' })}
        >
          איפוס
        </Button>

        <Button
          size="sm"
          variant="solid"
          disabled={!canSave}
          loading={pending}
          onClick={onSave}
          sx={sx.confBtn}
          startDecorator={iconUi({ id: 'save' })}
        >
          שמירה
        </Button>
      </Box>
    </Box>
  )
}
