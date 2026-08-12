// src/features/playersDatabase/ui/components/modals/workTask/steps/LevelStep.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { YearFocus } from '../WorkTaskContext.js'
import LevelChoiceCard from '../cards/LevelChoiceCard.js'
import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

export default function LevelStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <YearFocus birthYear={model.birthYear} />

      <Typography level='title-lg' sx={sx.sectionTitle}>
        בחירת רמת ליגה
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        בכל רמה מוצג מצב טבלאות הליגה לפי עונה.
      </Typography>

      <Box sx={sx.levelGrid}>
        {model.availableLevelOptions.map(option => {
          const seasonMap = model.levelSummaryMap.get(String(option.value)) || new Map()
          const seasons = [...seasonMap.entries()]
            .sort(([seasonA], [seasonB]) => seasonB.localeCompare(seasonA))
            .map(([season, summary]) => {
              const missingCount = summary.missing + summary.partial
              const statusLabel = missingCount === 0
                ? `${summary.full} ליגות מלאות · אין טבלאות חסרות`
                : `${summary.full} ליגות מלאות · ${missingCount} טבלאות להשלמה`

              return {
                key: `${option.value}-${season}`,
                season,
                missingCount,
                statusLabel,
              }
            })

          return (
            <LevelChoiceCard
              key={option.value}
              label={option.label}
              seasons={seasons}
              selected={String(model.leagueLevel) === String(option.value)}
              onClick={() => actions.onLeagueLevelChange(String(option.value))}
            />
          )
        })}
      </Box>

      {!model.availableLevelOptions.length ? (
        <Box sx={sx.emptyState}>
          <Typography sx={sx.emptyTitle}>
            אין רמות ליגה זמינות לשנתון הזה
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}
