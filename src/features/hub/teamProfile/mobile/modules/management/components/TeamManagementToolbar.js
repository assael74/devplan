import React from 'react'
import { Box, Button, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { moduleSx as sx } from '../module.sx.js'

export default function TeamManagementToolbar({
  isDirty,
  canSave,
  pending,
  onSave,
  onReset,
}) {
  return (
    <Box sx={sx.toolbarWrap}>
      <Box sx={sx.toolbarInner}>
        <Box sx={sx.toolbarMain}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              minWidth: 0,
            }}
          >
            <Box sx={sx.toolbarActions}>
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
        </Box>
      </Box>
    </Box>
  )
}
