// teamProfile/modules/games/components/insightsDrawer/sections/ForecastCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { forecastSx as sx } from './sx/forecast.sx.js'

function ForecastHeroCard({ forecast }) {
  const level = forecast?.level || null
  const color = forecast?.color || level?.color || 'neutral'

  return (
    <Sheet variant="soft" sx={sx.forecastHeroCard(color)}>
      <Box sx={sx.heroTop}>
        <Typography level="body-sm" sx={sx.heroTitle}>
          תחזית סיום
        </Typography>

        {level?.shortLabel ? (
          <Chip
            size="sm"
            variant="soft"
            color={color}
            startDecorator={iconUi({ id: 'projection', size: 'sm' })}
          >
            {level.shortLabel}
          </Chip>
        ) : null}
      </Box>

      <Box sx={sx.heroBody}>
        <Typography level="h3" sx={{ ...sx.forecastValue, ...sx.heroMain }}>
          {level?.rankRangeLabel || '—'}
        </Typography>

        <Box />

        <Typography level="body-xs" sx={sx.heroSubBottom}>
          לפי קצב נוכחי · {forecast?.projectedPoints ?? '—'} נק׳ צפויות
        </Typography>
      </Box>
    </Sheet>
  )
}

function TargetHeroCard({ forecast }) {
  const targetLevel = forecast?.targetLevel || null
  const targetPosition = forecast?.targetPosition

  return (
    <Sheet variant="soft" sx={sx.heroCard('neutral')}>
      <Box sx={sx.heroTop}>
        <Typography level="body-sm" sx={sx.heroTitle}>
          יעד שהוגדר
        </Typography>

        {targetLevel?.shortLabel ? (
          <Chip
            size="sm"
            variant="soft"
            color={targetLevel?.color || 'neutral'}
            startDecorator={iconUi({ id: 'target', size: 'sm' })}
          >
            {targetLevel.shortLabel}
          </Chip>
        ) : null}
      </Box>

      <Box sx={sx.heroBody}>
        <Typography level="h3" sx={{ ...sx.heroValue, ...sx.heroMain }}>
          {targetPosition ? `מקום ${targetPosition}` : '—'}
        </Typography>

        <Box />

        <Typography level="body-xs" sx={sx.heroSubBottom}>
          {targetLevel?.rankRangeLabel
            ? `רמת יעד: ${targetLevel.rankRangeLabel}`
            : 'לא הוגדרה רמת יעד'}
        </Typography>
      </Box>
    </Sheet>
  )
}

function ReliabilityHeroCard({ forecast }) {
  const reliability = forecast?.reliability || {}
  const color = reliability?.color || 'neutral'

  return (
    <Sheet variant="soft" sx={sx.heroCard(color)}>
      <Box sx={sx.heroTop}>
        <Typography level="body-sm" sx={sx.heroTitle}>
          מהימנות
        </Typography>

        {reliability?.label ? (
          <Chip
            size="sm"
            variant="soft"
            color={color}
            startDecorator={iconUi({
              id: reliability?.icon || 'info',
              size: 'sm',
            })}
          >
            {reliability.label}
          </Chip>
        ) : null}
      </Box>

      <Box sx={sx.heroBody}>
        <Typography level="h3" sx={{ ...sx.heroValue, ...sx.heroMain }}>
          {reliability?.sourceLabel || '—'}
        </Typography>

        <Box />

        <Typography level="body-xs" sx={sx.heroSubBottom}>
          {reliability?.description || 'לא זוהה מקור נתונים'}
        </Typography>
      </Box>
    </Sheet>
  )
}

export default function ForecastCards({ forecast }) {
  return (
    <Box sx={sx.forecastGrid}>
      <ForecastHeroCard forecast={forecast} />
      <TargetHeroCard forecast={forecast} />
      <ReliabilityHeroCard forecast={forecast} />
    </Box>
  )
}
