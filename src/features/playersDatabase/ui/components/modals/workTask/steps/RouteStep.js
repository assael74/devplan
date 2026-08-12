// src/features/playersDatabase/ui/components/modals/workTask/steps/RouteStep.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import RouteChoiceCard from '../cards/RouteChoiceCard.js'
import {
  TEAM_ROUTE,
  YEAR_ROUTE,
} from '../workTask.model.js'
import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

export default function RouteStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <Typography level='title-lg' sx={sx.sectionTitle}>
        איך מתחילים את העבודה?
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        בחר את מסלול העבודה המתאים למשימה שברצונך לפתוח.
      </Typography>

      <Box sx={sx.routeGrid}>
        <RouteChoiceCard
          title='שנתון בלבד'
          description='עבודה רוחבית לפי שנתון, רמות ליגה וליגות.'
          selected={model.workRoute === YEAR_ROUTE}
          onClick={() => actions.onRouteChange(YEAR_ROUTE)}
        />
        <RouteChoiceCard
          title='קבוצה + שנתון'
          description='עבודה ממוקדת על קבוצה של מועדון בשנתון מסוים.'
          selected={model.workRoute === TEAM_ROUTE}
          onClick={() => actions.onRouteChange(TEAM_ROUTE)}
        />
      </Box>
    </Box>
  )
}
