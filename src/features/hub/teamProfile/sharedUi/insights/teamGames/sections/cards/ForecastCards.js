// teamProfile/sharedUi/insights/teamGames/sections/cards/ForecastCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { forecastSx as sx } from '../sx/forecast.sx.js'

const getProfileRankLabel = (profile) => {
  return (
    profile?.rankRangeLabel ||
    profile?.rankLabel ||
    profile?.shortLabel ||
    profile?.label ||
    ''
  )
}

const getProfileShortLabel = (profile) => {
  return profile?.shortLabel || profile?.label || ''
}

const getTargetLabel = (forecast = {}) => {
  const mode = forecast?.targetPositionMode || ''
  const position = forecast?.targetPosition || ''
  const targetLevel = forecast?.targetLevel || forecast?.targetProfile || null

  if (mode === 'exact' && position) {
    return `מקום ${position}`
  }

  if (mode === 'range') {
    return getProfileRankLabel(targetLevel) || '—'
  }

  if (forecast?.targetLabel) {
    return forecast.targetLabel
  }

  return getProfileRankLabel(targetLevel) || '—'
}

function ForecastHeroCard({ forecast, isMobile }) {
  const level = forecast?.level || null
  const color = forecast?.color || level?.color || 'neutral'
  const rankLabel = getProfileRankLabel(level)

  return (
    <Sheet variant="soft" sx={sx.forecastHeroCard(color)}>
      <Box sx={!isMobile ? sx.heroTop : sx.heroTopM}>
        <Typography level="body-sm" sx={sx.heroTitle}>
          תחזית סיום
        </Typography>

        {getProfileShortLabel(level) ? (
          <Chip
            size="sm"
            variant="soft"
            color={color}
            startDecorator={iconUi({ id: 'projection', size: 'sm' })}
          >
            {getProfileShortLabel(level)}
          </Chip>
        ) : null}
      </Box>

      <Box sx={!isMobile ? sx.heroBody : sx.heroBodyM}>
        <Typography level="h3" sx={sx.forecastValue}>
          {rankLabel || '—'}
        </Typography>

        <Box />

        <Typography level="body-xs" sx={sx.heroSubBottom}>
          לפי קצב נוכחי · {forecast?.projectedPoints ?? '—'} נק׳ צפויות
        </Typography>
      </Box>
    </Sheet>
  )
}

function TargetHeroCard({ forecast, isMobile }) {
  const targetLevel = forecast?.targetLevel || forecast?.targetProfile || null
  const targetLabel = getTargetLabel(forecast)
  const targetRankLabel = getProfileRankLabel(targetLevel)
  const targetShortLabel = getProfileShortLabel(targetLevel)

  return (
    <Sheet variant="soft" sx={sx.heroCard(targetLevel?.color || 'neutral')}>
      <Box sx={!isMobile ? sx.heroTop : sx.heroTopM}>
        <Typography level="body-sm" sx={sx.heroTitle}>
          יעד שהוגדר
        </Typography>

        {targetShortLabel ? (
          <Chip
            size="sm"
            variant="soft"
            color={targetLevel?.color || 'neutral'}
            startDecorator={iconUi({ id: 'target', size: 'sm' })}
          >
            {targetShortLabel}
          </Chip>
        ) : null}
      </Box>

      <Box sx={!isMobile ? sx.heroBody : sx.heroBodyM}>
        <Typography level="h3" sx={sx.heroValue}>
          {targetLabel}
        </Typography>

        <Box />

        <Typography level="body-xs" sx={sx.heroSubBottom}>
          {targetRankLabel
            ? `רמת יעד: ${targetRankLabel}`
            : 'לא הוגדרה רמת יעד'}
        </Typography>
      </Box>
    </Sheet>
  )
}

function ReliabilityHeroCard({ forecast, isMobile }) {
  const reliability = forecast?.reliability || {}
  const color = reliability?.color || 'neutral'

  return (
    <Sheet variant="soft" sx={sx.heroCard(color)}>
      <Box sx={!isMobile ? sx.heroTop : sx.heroTopM}>
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

      <Box sx={!isMobile ? sx.heroBody : sx.heroBodyM}>
        <Typography level="h3" sx={sx.heroValue}>
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

export default function ForecastCards({ forecast, isMobile }) {
  return (
    <Box sx={sx.forecastGrid}>
      <ForecastHeroCard forecast={forecast} isMobile={isMobile} />
      <TargetHeroCard forecast={forecast} isMobile={isMobile} />
      <ReliabilityHeroCard forecast={forecast} isMobile={isMobile} />
    </Box>
  )
}
