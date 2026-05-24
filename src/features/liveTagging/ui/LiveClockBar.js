// src/features/liveTagging/ui/LiveClockBar.js

import React from 'react'
import { Box, Button, Chip, Input, Typography } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { sx } from './sx/liveTagging.sx.js'

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
    <Box sx={sx.clockBar}>
      <Box sx={sx.clockTopRow}>
        <Box sx={sx.clockMain}>
          <Typography level="body-xs" sx={sx.mutedText}>
            זמן משחק
          </Typography>

          <Typography level="h2" sx={sx.clockText}>
            {model.clockText}
          </Typography>
        </Box>

        <Box sx={sx.clockControls}>
          <Chip
            size="sm"
            variant="soft"
            color={model.running ? 'success' : 'neutral'}
          >
            {model.statusLabel}
          </Chip>

          <Chip
            size="sm"
            variant="soft"
            color={model.speed === 2 ? 'warning' : 'neutral'}
          >
            x{model.speed || 1}
          </Chip>

          <Button
            size="sm"
            color="neutral"
            variant="soft"
            disabled={disabled}
            onClick={onToggleSpeed}
          >
            x2
          </Button>

          <Button
            size="sm"
            color={model.actionColor}
            variant="solid"
            disabled={disabled}
            onClick={onToggle}
          >
            {model.actionLabel}
          </Button>
        </Box>
      </Box>

      <Box sx={sx.clockEdit}>
        <Input
          size="sm"
          type="number"
          placeholder="דק׳"
          value={minute}
          disabled={disabled}
          onChange={(event) => setMinute(event.target.value)}
          sx={sx.clockInput}
        />

        <Input
          size="sm"
          type="number"
          placeholder="שנ׳"
          value={second}
          disabled={disabled}
          onChange={(event) => setSecond(event.target.value)}
          sx={sx.clockInput}
        />

        <Button
          size="sm"
          variant="soft"
          disabled={disabled}
          onClick={handleSetTime}
          sx={{ fontSize: 10 }}
        >
          עדכן זמן
        </Button>

        <Button
          size="sm"
          color="danger"
          variant="soft"
          disabled={disabled}
          onClick={onReset}
          startDecorator={iconUi({ id: 'reset' })}
        >
          איפוס
        </Button>
      </Box>
    </Box>
  )
}
