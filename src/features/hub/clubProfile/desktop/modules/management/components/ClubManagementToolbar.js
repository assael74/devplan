// src/features/hub/clubProfile/desktop/modules/management/components/ClubManagementToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { moduleSx as sx } from '../sx/module.sx'

export default function ClubManagementToolbar({
  isDirty,
  canSave,
  pending,
  isEditing = false,
  onEdit,
  onSave,
  onReset,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTitleArea}>
        <Box sx={sx.toolbarDot} />

        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" sx={sx.toolbarTitle}>
            ניהול המועדון
          </Typography>
          <Typography level="body-xs" sx={sx.toolbarSubtitle}>
            מידע בסיסי, סטטוס פעילות וצוות מקצועי
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.toolbarActions}>
        {isEditing ? (
          <>
            <Chip size="sm" variant="soft" color={isDirty ? 'warning' : 'neutral'}>
              {isDirty ? 'שינויים לא נשמרו' : 'שמור'}
            </Chip>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              disabled={pending}
              onClick={onReset}
              startDecorator={iconUi({ id: 'reset' })}
              sx={sx.secondaryAction}
            >
              ביטול
            </Button>

            <Button
              size="sm"
              variant="solid"
              disabled={!canSave}
              loading={pending}
              onClick={onSave}
              startDecorator={iconUi({ id: 'save' })}
              sx={sx.saveAction(canSave)}
            >
              שמירה
            </Button>
          </>
        ) : (
          <>
            <Chip size="sm" variant="soft" color="neutral">
              שמור
            </Chip>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              disabled={pending}
              onClick={onEdit}
              startDecorator={iconUi({ id: 'edit' })}
              sx={sx.secondaryAction}
            >
              עריכה
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
