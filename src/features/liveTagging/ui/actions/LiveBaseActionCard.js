//  src/features/liveTagging/ui/actions/LiveBaseActionCard.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { baseActionsSx as sx } from './sx/baseActions.sx.js'

const getActionLabel = action => {
  const label = action?.shortLabel || action?.label || ''
  if (label.length <= 14) return label

  return `${label.slice(0, 13)}…`
}

export function LiveBaseActionCard({
  action,
  disabled,
  selected,
  onClick,
}) {
  return (
    <Button
      size="lg"
      variant={selected ? 'solid' : 'soft'}
      color={selected ? 'primary' : 'neutral'}
      disabled={disabled}
      onClick={() => onClick(action.id)}
      sx={sx.actionCard(selected)}
    >
      <Box sx={sx.actionCardInner}>
        {action.idIcon && (
          <Box sx={sx.actionIcon(selected)}>
            {iconUi({ id: action.idIcon, size: 'sm' })}
          </Box>
        )}

        <Typography level="title-sm" sx={sx.actionTitle}>
          {getActionLabel(action)}
        </Typography>
      </Box>
    </Button>
  )
}
