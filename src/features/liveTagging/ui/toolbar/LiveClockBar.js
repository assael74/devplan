// src/features/liveTagging/ui/LiveClockBar.js

import React from 'react'
import { Box, Button, IconButton, Input, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { clockBarSx as sx } from './sx/clockBar.sx.js'

export function LiveClockBar({
  model,
  disabled = false,
  onToggle,
  onReset,
  onSetTime,
  onToggleSpeed,
}) {
  const [minute, setMinute] = React.useState('')
  const [second, setSecond] = React.useState('')

  const handleSetTime = () => {
    if (disabled) return

    onSetTime({
      minute: Number(minute) || 0,
      second: Number(second) || 0,
    })
  }

  return (
    <Box sx={sx.clockBar(model.running)}>
      <Box sx={sx.clockMain}>
        <Typography level="body-xs" sx={sx.clockLabel}>
          זמן משחק
        </Typography>

        <Typography level="h2" sx={sx.clockText}>
          {model.clockText}
        </Typography>
      </Box>

      <Box sx={sx.clockPrimaryControls}>
        <Button
          size="sm"
          color={model.actionColor}
          variant="solid"
          disabled={disabled}
          onClick={onToggle}
          sx={sx.toggleButton(model.running)}
        >
          {model.actionLabel}
        </Button>

        <Button
          size="sm"
          color={model.speed === 2 ? 'warning' : 'neutral'}
          variant={model.speed === 2 ? 'solid' : 'soft'}
          disabled={disabled}
          onClick={onToggleSpeed}
          sx={sx.speedButton}
        >
          x{model.speed || 1}
        </Button>

        <IconButton
          size="sm"
          color="danger"
          variant="soft"
          disabled={disabled}
          onClick={onReset}
          sx={sx.resetButton}
        >
          {iconUi({ id: 'reset', size: 'sm' })}
        </IconButton>
      </Box>

      <Box sx={sx.clockEdit}>
        <Input
          size="sm"
          type="number"
          placeholder="דק׳"
          value={minute}
          disabled={disabled}
          onChange={event => setMinute(event.target.value)}
          sx={sx.clockInput}
        />

        <Input
          size="sm"
          type="number"
          placeholder="שנ׳"
          value={second}
          disabled={disabled}
          onChange={event => setSecond(event.target.value)}
          sx={sx.clockInput}
        />

        <Button
          size="sm"
          variant="soft"
          disabled={disabled}
          onClick={handleSetTime}
          sx={sx.setTimeButton}
        >
          עדכן זמן
        </Button>
      </Box>
    </Box>
  )
}
