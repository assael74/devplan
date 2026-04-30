// features/hub/playerProfile/desktop/modules/info/PlayerInfoToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import { playerInfoModuleSx as sx } from './playerInfo.module.sx.js'

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
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          disabled={!isDirty || pending}
          onClick={onReset}
          startDecorator={iconUi({ id: 'reset' })}
          sx={{ border: '1px solid', borderColor: 'divider' }}
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
