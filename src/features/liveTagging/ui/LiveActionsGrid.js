// src/features/liveTagging/ui/LiveActionsGrid.js

import React from 'react'
import { Box, Button, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { sx } from './sx/liveTagging.sx.js'

const sideActionId = (action, side) => `${action.id}_${side}`

function ActionSplitCard({
  action,
  disabled,
  selectedActionId,
  onActionClick,
}) {
  const positiveId = sideActionId(action, 'positive')
  const negativeId = sideActionId(action, 'negative')

  return (
    <Box sx={sx.actionSplitCard}>
      <Box sx={sx.actionSplitTitleRow}>
        {action.idIcon && iconUi({ id: action.idIcon, size: 'xs' })}

        <Typography level="body-sm" sx={sx.actionSplitTitle}>
          {action.label}
        </Typography>
      </Box>

      <Box sx={sx.actionSplitButtons}>
        {action.positiveLabel && (
          <Button
            size="sm"
            color="success"
            disabled={disabled}
            variant={selectedActionId === positiveId ? 'solid' : 'soft'}
            sx={sx.actionHalfButton('positive')}
            onClick={() => onActionClick(positiveId)}
          >
            {action.positiveLabel}
          </Button>
        )}

        {action.negativeLabel && (
          <Button
            size="sm"
            color="danger"
            disabled={disabled}
            variant={selectedActionId === negativeId ? 'solid' : 'soft'}
            sx={sx.actionHalfButton('negative')}
            onClick={() => onActionClick(negativeId)}
          >
            {action.negativeLabel}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export function LiveActionsGrid({
  actions = [],
  disabled,
  selectedActionId,
  onActionClick,
  onOpenSettings,
}) {
  return (
    <Box sx={sx.actionsPanel}>
      <Box sx={sx.actionsHeader}>
        <Typography level="title-sm" sx={sx.actionsMainTitle}>
          פעולות
        </Typography>

        <IconButton
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onOpenSettings}
        >
          {iconUi({ id: 'statsParm', size: 'sm' })}
        </IconButton>
      </Box>

      <Box sx={sx.actionsGrid}>
        {actions.map((action) => (
          <ActionSplitCard
            key={action.id}
            action={action}
            disabled={disabled}
            selectedActionId={selectedActionId}
            onActionClick={onActionClick}
          />
        ))}
      </Box>
    </Box>
  )
}
