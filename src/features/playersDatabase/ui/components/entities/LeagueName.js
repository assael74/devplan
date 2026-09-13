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
  levelSx,
  levelEndDecorator = null,
  showName = true,
}) {
  const leagueLevel = Number(level)
  const hasLevel = showLevel && Number.isFinite(leagueLevel) && leagueLevel > 0

  return (
    <Box sx={sx.root}>
      {showName ? (
        <Typography
          component='span'
          sx={[sx.name(fontSize), nameSx]}
        >
          {clean(value) || '-'}
        </Typography>
      ) : null}

      {hasLevel ? (
        <Box
          component='span'
          sx={[
            sx.level({ fontSize, levelFontSize }),
            levelSx,
          ]}
        >
          {`L${leagueLevel}`}
          {levelEndDecorator}
        </Box>
      ) : null}
    </Box>
  )
}
