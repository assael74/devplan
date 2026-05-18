// TEAMPROFILE/sharedUi/insights/teamPlayers/print/PrintView.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  buildTeamPlayersInsightsPrintModel,
} from '../../../../sharedLogic/players/insightsLogic/print/index.js'

import {
  PrintRecommendations,
  PrintRoleSections,
  PrintSummary,
} from './printSections.js'

import { baseSx as sx } from './sx/base.sx.js'

export default function PrintView({
  team,
  model,
  games,
  performanceScope,
}) {
  const printModel = buildTeamPlayersInsightsPrintModel({
    team,
    model,
    games,
    performanceScope,
  })

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Typography sx={sx.title}>
          {printModel.title}
        </Typography>

        <Typography sx={sx.subtitle}>
          {printModel.teamName}
        </Typography>
      </Box>

      <Box sx={sx.scopeBox} className="dpPrintSection">
        <Typography sx={sx.scopeTitle}>
          {printModel.scope.title}
        </Typography>

        <Typography sx={sx.scopeText}>
          {printModel.scope.description}
        </Typography>
      </Box>

      <PrintSummary items={printModel.summary} />
      <PrintRoleSections sections={printModel.roleSections} />
      <PrintRecommendations items={printModel.recommendations} />

      <Box sx={sx.footer}>
        הופק מתוך DevPlan · דוח תפקוד סגל לפי הסקופ הנבחר
      </Box>
    </Box>
  )
}
