// src/features/playersDatabase/ui/components/modals/workTask/steps/ReviewStep.js

import * as React from 'react'
import {
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { LeagueReviewContext } from '../WorkTaskContext.js'
import LeagueChoiceCard from '../cards/LeagueChoiceCard.js'
import { clean } from '../workTask.model.js'
import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

export default function ReviewStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <LeagueReviewContext
        birthYear={model.birthYear}
        leagueLevel={model.leagueLevel}
      />

      <Box sx={sx.reviewHeader}>
        <Typography level='title-lg' sx={sx.sectionTitle}>
          סקירת הליגות
        </Typography>

        <Box sx={sx.seasonFilter}>
          <Typography level='body-xs' sx={sx.fieldLabel}>
            עונה
          </Typography>
          <Select
            size='sm'
            value={model.seasonKey}
            sx={sx.seasonSelect}
            onChange={(event, value) => actions.onSeasonChange(value || 'all')}
          >
            <Option value='all'>כל העונות</Option>
            {model.seasonOptions.map(season => (
              <Option key={season} value={season}>
                {season}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={sx.leagueGrid}>
        {model.reviewRows.length ? (
          model.reviewRows.map(row => {
            const rowKey = `${row.leagueId}-${row.seasonKey}-${row.birthYear}`

            return (
              <LeagueChoiceCard
                key={rowKey}
                row={row}
                selected={model.selectedLeagueKey === rowKey}
                onClick={() => actions.onLeagueSelect(rowKey)}
              />
            )
          })
        ) : (
          <Box sx={sx.emptyState}>
            <Typography sx={sx.emptyTitle}>
              לא נמצאו ליגות בהקשר הזה
            </Typography>
            <Typography level='body-xs' sx={sx.emptyCaption}>
              נסה עונה אחרת או חזור לבחירת רמת הליגה.
            </Typography>
          </Box>
        )}
      </Box>

      {model.selectedLeague ? (
        <Box sx={sx.selectedTaskPreview}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            משימה שתיווצר
          </Typography>
          <Typography sx={sx.selectedTaskTitle}>
            הוספת קבוצות · {clean(
              model.selectedLeague.leagueName || model.selectedLeague.name
            )}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}
