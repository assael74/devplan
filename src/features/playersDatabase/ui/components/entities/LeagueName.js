// src/features/playersDatabase/ui/components/entities/LeagueName.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { leagueNameSx as sx } from './sx/leagueName.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export default function LeagueName({
  value = '',
  level = '',
  showLevel = false,
  fontSize = 13,
  levelFontSize = null,
  nameSx,
}) {
  const leagueLevel = Number(level)
  const hasLevel = showLevel && Number.isFinite(leagueLevel) && leagueLevel > 0

  return (
    <Box sx={sx.root}>
      <Typography
        component='span'
        sx={[sx.name(fontSize), nameSx]}
      >
        {clean(value) || '-'}
      </Typography>

      {hasLevel ? (
        <Box
          component='span'
          title={`רמת ליגה ${leagueLevel}`}
          sx={sx.level({
            fontSize,
            levelFontSize,
          })}
        >
          {`L${leagueLevel}`}
        </Box>
      ) : null}
    </Box>
  )
}
