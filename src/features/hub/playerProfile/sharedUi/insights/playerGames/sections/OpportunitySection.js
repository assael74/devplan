// playerProfile/sharedUi/insights/playerGames/sections/OpportunitySection.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  buildOpportunityView,
} from '../../../../sharedLogic/games/insightsDrawer/index.js'

import {
  SectionMetricsGrid,
  SectionTakeaway,
} from './shared/index.js'

import { opportunitySx as sx } from './sx/Opportunity.sx.js'

const emptyTitle = 'אין מספיק נתוני הזדמנות'
const emptyText = 'כדי לנתח שילוב בסגל נדרשים נתוני דקות, הרכב ושיוך למשחקי ליגה.'

export default function OpportunitySection({ data, brief, gamesData = null }) {
  const model = buildOpportunityView({
    data,
    brief,
    gamesData
  })

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleBlock}>
          <Typography level="body-sm" sx={sx.title}>
            מדדי הזדמנות
          </Typography>

          <Typography level="body-xs" sx={sx.subtitle}>
            בדיקה האם נפח השימוש בפועל תואם את המעמד שהוגדר לשחקן
          </Typography>
        </Box>
      </Box>

      <SectionMetricsGrid
        sx={sx}
        metrics={model.metrics}
        emptyTitle={emptyTitle}
        emptyText={emptyText}
      />

      <SectionTakeaway
        sx={sx}
        takeaway={model.takeaway}
      />
    </Sheet>
  )
}
