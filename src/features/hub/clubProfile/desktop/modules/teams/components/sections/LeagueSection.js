// clubProfile/desktop/modules/teams/components/sections/LeagueSection.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  buildLeagueSectionModel,
} from './ui/leagueSection.ui.js'

import { leagueSx as sx } from './sx/league.sx.js'

function LeagueChip({
  icon,
  color = 'neutral',
  children,
}) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={iconUi({ id: icon, size: 'xs' })}
      sx={sx.chip}
    >
      {children}
    </Chip>
  )
}

export default function LeagueSection({ row }) {
  const model = buildLeagueSectionModel(row)

  if (!model.hasLeagueData) {
    return (
      <Box sx={sx.root}>
        <Chip size="sm" variant="outlined" color="neutral" sx={sx.chip}>
          ללא נתוני ליגה
        </Chip>
      </Box>
    )
  }

  return (
    <Box sx={sx.root}>
      <LeagueChip icon="leaguePos">
        מקום {model.position}
      </LeagueChip>

      <LeagueChip icon="points">
        {model.points} נק׳
      </LeagueChip>

      <LeagueChip icon="goal" color="success">
        {model.goalsFor}
      </LeagueChip>

      <LeagueChip icon="goal" color="danger">
        {model.goalsAgainst}
      </LeagueChip>
    </Box>
  )
}
