// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskContext.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { workTaskContextSx as sx } from './sx/workTaskContext.sx.js'

export function LeaguePageContext({ leagueContext }) {
  return (
    <Box sx={sx.leaguePageContext}>
      <Box sx={sx.leaguePageContextItem}>
        <Typography level='body-xs' sx={sx.reviewContextLabel}>
          שנתון
        </Typography>
        <Typography sx={sx.leaguePageContextValue}>
          {leagueContext?.league?.birthYear || '-'}
        </Typography>
      </Box>

      <Box sx={sx.leaguePageContextItem}>
        <Typography level='body-xs' sx={sx.reviewContextLabel}>
          ליגה
        </Typography>
        <Typography sx={sx.leaguePageContextValue}>
          {leagueContext?.league?.name || '-'}
        </Typography>
      </Box>

      <Box sx={sx.leaguePageContextItem}>
        <Typography level='body-xs' sx={sx.reviewContextLabel}>
          עונה
        </Typography>
        <Typography sx={sx.leaguePageContextValue}>
          {leagueContext?.seasonKey || '-'}
        </Typography>
      </Box>
    </Box>
  )
}

export function YearFocus({ birthYear }) {
  return (
    <Box sx={sx.yearFocus}>
      <Typography level='body-xs' sx={sx.yearFocusLabel}>
        עובדים על שנתון
      </Typography>
      <Typography sx={sx.yearFocusValue}>
        {birthYear}
      </Typography>
    </Box>
  )
}

export function LeagueReviewContext({ birthYear, leagueLevel }) {
  return (
    <Box sx={sx.reviewContext}>
      <Box>
        <Typography level='body-xs' sx={sx.reviewContextLabel}>
          שנתון עבודה
        </Typography>
        <Typography sx={sx.reviewContextValue}>
          {birthYear}
        </Typography>
      </Box>

      <Box>
        <Typography level='body-xs' sx={sx.reviewContextLabel}>
          רמת ליגה
        </Typography>
        <Typography sx={sx.reviewContextValue}>
          רמה {leagueLevel}
        </Typography>
      </Box>
    </Box>
  )
}
