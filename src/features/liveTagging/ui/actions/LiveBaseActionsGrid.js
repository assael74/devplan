// src/features/liveTagging/ui/actions/LiveBaseActionsGrid.js

import React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { LiveBaseActionCard } from './LiveBaseActionCard.js'
import { baseActionsSx as sx } from './sx/baseActions.sx.js'

export function LiveBaseActionsGrid({
  actions = [],
  disabled,
  selectedBaseActionId,
  onActionClick,
  onOpenSettings,
}) {
  return (
    <Box sx={sx.actionsPanel}>
      <Box sx={sx.actionsHeader}>
        <Box>
          <Typography level="body-xs" sx={sx.mutedText}>
            בחר פעולה
          </Typography>

          <Typography level="title-sm" sx={sx.actionsMainTitle}>
            פעולות תיוג
          </Typography>
        </Box>

        <IconButton
          size="sm"
          variant="soft"
          color="neutral"
          disabled={disabled}
          onClick={onOpenSettings}
        >
          {iconUi({ id: 'statsParm', size: 'sm' })}
        </IconButton>
      </Box>

      <Box sx={sx.actionsGrid}>
        {actions.map(action => (
          <LiveBaseActionCard
            key={action.id}
            action={action}
            disabled={disabled}
            selected={selectedBaseActionId === action.id}
            onClick={onActionClick}
          />
        ))}
      </Box>
    </Box>
  )
}
