// teamProfile/desktop/modules/management/components/ManagementToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

export default function ManagementToolbar({
  activeTab,
  isDirty,
  canSave,
  pending,
  onReset,
  onSave,
}) {
  const nonShow = activeTab.id === 'staff'
  return (
    <Box sx={sx.toolbar(nonShow)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.headerDot} />

        <Typography level="title-sm" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          {activeTab?.labelH || 'ניהול'}
        </Typography>

        {!nonShow && (
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
      )}
    </Box>
  )
}
