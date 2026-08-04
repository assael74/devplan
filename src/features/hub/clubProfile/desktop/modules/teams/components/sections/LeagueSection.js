// clubProfile/desktop/modules/teams/components/sections/LeagueSection.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  buildLeagueSectionModel,
} from './ui/leagueSection.ui.js'

import { leagueSx as sx } from './sx/league.sx.js'

function LeagueMetric({ icon, label, value, tone = 'neutral' }) {
  return (
    <Box sx={sx.metric(tone)}>
      {iconUi({ id: icon, size: 'xs' })}
      <Typography level="body-xs" sx={sx.metricText}>
        <span>{label}</span>
        <strong>{value}</strong>
      </Typography>
    </Box>
  )
}

export default function LeagueSection({ row }) {
  const model = buildLeagueSectionModel(row)

  if (!model.hasLeagueData) {
    return (
      <Box sx={sx.root}>
        <Typography level="body-xs" sx={sx.emptyText}>
          ללא נתוני ליגה
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.root}>
      <LeagueMetric icon="leaguePos" label="מקום" value={model.position} />
      <LeagueMetric icon="points" label="נקודות" value={model.points} />
      <LeagueMetric icon="goal" label="זכות" value={model.goalsFor} tone="success" />
      <LeagueMetric icon="goal" label="חובה" value={model.goalsAgainst} tone="danger" />
    </Box>
  )
}
