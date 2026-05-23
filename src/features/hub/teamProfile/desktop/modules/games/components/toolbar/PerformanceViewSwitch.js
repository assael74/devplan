import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

const options = [
  {
    id: 'team',
    label: 'קבוצה',
    icon: 'team',
  },
  {
    id: 'players',
    label: 'שחקנים',
    icon: 'player',
  },
]

export default function PerformanceViewSwitch({ value = 'team', onChange }) {
  return (
    <Box sx={sx.viewWrap}>
      <Typography level="body-xs" sx={sx.viewWrapText}>
        ביצוע
      </Typography>

      {options.map(option => {
        const selected = value === option.id

        return (
          <Chip
            key={option.id}
            size="sm"
            variant={selected ? 'solid' : 'plain'}
            color={selected ? 'primary' : 'neutral'}
            onClick={() => onChange(option.id)}
            startDecorator={iconUi({ id: option.icon, size: 'xs' })}
            sx={sx.chipView}
          >
            {option.label}
          </Chip>
        )
      })}
    </Box>
  )
}
