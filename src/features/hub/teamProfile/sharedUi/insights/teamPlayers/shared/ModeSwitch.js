// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/ModeSwitch.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { modeSwitchSx as sx } from './sx/modeSwitch.sx.js'

const emptyArray = []

export default function ModeSwitch({
  value,
  options = emptyArray,
  onChange,
}) {
  const safeOptions = Array.isArray(options) ? options : emptyArray

  if (!safeOptions.length) return null

  return (
    <Box sx={sx.root}>
      {safeOptions.map(option => {
        const active = value === option.id

        return (
          <Chip
            key={option.id}
            size="sm"
            variant={active ? 'soft' : 'plain'}
            color={active ? 'primary' : 'neutral'}
            onClick={() => {
              if (typeof onChange === 'function') {
                onChange(option.id)
              }
            }}
            sx={sx.chip(active)}
          >
            {option.label}
          </Chip>
        )
      })}
    </Box>
  )
}
