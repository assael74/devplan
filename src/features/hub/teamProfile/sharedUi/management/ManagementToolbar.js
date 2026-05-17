// teamProfile/sharedUi/management/ManagementToolbar.js

import React from 'react'
import { Box, Button, Chip, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

export default function ManagementToolbar({
  activeTab,
  isDirty,
  canSave,
  pending,
  onReset,
  onSave,
  extraActions = null,
  isMobile = false,
}) {
  const nonShow = activeTab.id === 'staff'
  const showStatus = !nonShow && !isMobile

  return (
    <Box sx={sx.toolbar(nonShow, isMobile)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.headerDot} />

        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {activeTab?.labelH || 'ניהול'}
        </Typography>

        {showStatus && (
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
        )}
      </Box>

      {!nonShow && (
        <Box sx={sx.toolbarActions(isMobile)}>
          {extraActions}

          {isMobile ? (
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
          ) : (
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
          )}

          {isMobile ? (
            <IconButton
              size="sm"
              variant="solid"
              disabled={!canSave}
              loading={pending}
              onClick={onSave}
              sx={sx.mobileSaveBtn}
            >
              {iconUi({ id: 'save' })}
            </IconButton>
          ) : (
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
          )}
        </Box>
      )}
    </Box>
  )
}
