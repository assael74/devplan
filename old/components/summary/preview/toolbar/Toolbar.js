// features/playersDatabase/components/summary/preview/toolbar/Toolbar.js

import React from 'react'
import {
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../../../leagues/leagueUtils.js'
import { toolbarSx as sx } from './toolbar.sx.js'

export default function Toolbar({ league }) {
  return (
    <Box sx={sx.root}>
      <Typography level="title-md" sx={sx.title}>
        {league?.leagueName}
        {' | '}
        {league?.ageGroupLabel}
      </Typography>

      <Box sx={sx.chips}>
        <Chip size="sm" variant="soft" color="neutral">
          מזהה {league?.id}
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          רמה {getLeagueLevelLabel(league?.level)}
        </Chip>

        <Chip size="sm" variant="soft" color="neutral">
          {getLeagueRegionLabel(league?.region)}
        </Chip>
      </Box>
    </Box>
  )
}
