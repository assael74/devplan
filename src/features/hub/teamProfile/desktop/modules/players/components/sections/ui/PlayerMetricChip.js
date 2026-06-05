// teamProfile/desktop/modules/players/components/sections/ui/PlayerMetricChip.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

import {
  PLAYER_ROW_METRIC_TONES,
  resolvePlayerMetricTone,
  buildMetricChipSx,
  buildMetricIconSx,
} from './playerMetricTones.js'

const chipSx = {
  flexShrink: 0,
  minWidth: 0,
  maxWidth: 136,
  justifyContent: 'center',
  fontWeight: 700,
  border: '1px solid',
  gap: 0.45,
  '--Chip-minHeight': '22px',
  '--Chip-paddingInline': '0.55rem',

  '& .MuiChip-label': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.4,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}

const labelSx = {
  color: 'inherit',
  opacity: 0.72,
  fontWeight: 600,
}

const valueSx = {
  color: 'inherit',
  fontWeight: 700,
}

export default function PlayerMetricChip({
  metricKey = 'neutral',
  icon = 'targets',
  label = '',
  value = '',
  metricTones = PLAYER_ROW_METRIC_TONES,
  sx,
}) {
  const tone = resolvePlayerMetricTone({
    metricKey,
    tones: metricTones,
  })

  return (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
      sx={[
        chipSx,
        buildMetricChipSx(tone),
        sx,
      ]}
      startDecorator={iconUi({
        id: icon,
        sx: buildMetricIconSx(tone),
      })}
    >
      {label ? (
        <Box component="span" sx={labelSx}>
          {label}
        </Box>
      ) : null}

      <Box component="span" sx={valueSx}>
        {value}
      </Box>
    </Chip>
  )
}
