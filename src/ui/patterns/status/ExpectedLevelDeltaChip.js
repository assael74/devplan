import * as React from 'react'
import {
  Chip,
} from '@mui/joy'
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded'

const displayByDirection = {
  promotion: {
    label: 'עלייה צפויה',
    color: 'success',
    icon: <ArrowUpwardRounded />,
  },
  unchanged: {
    label: 'ללא שינוי',
    color: 'neutral',
    icon: <ArrowForwardRounded />,
  },
  relegation: {
    label: 'ירידה צפויה',
    color: 'danger',
    icon: <ArrowDownwardRounded />,
  },
}

export default function ExpectedLevelDeltaChip({
  direction,
  label,
  size = 'sm',
  iconOnly = false,
}) {
  const display = displayByDirection[direction]

  if (!display) return null

  return (
    <Chip
      size={size}
      variant='soft'
      color={display.color}
      startDecorator={iconOnly ? undefined : display.icon}
      title={label || display.label}
      aria-label={label || display.label}
      sx={{
        maxWidth: '100%',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        ...(iconOnly ? {
          minWidth: 28,
          width: 28,
          height: 28,
          px: 0,
          '& .MuiChip-label': {
            display: 'grid',
            placeItems: 'center',
            width: '100%',
          },
        } : {}),
      }}
    >
      {iconOnly ? display.icon : label || display.label}
    </Chip>
  )
}
