import React from 'react'
import { Box, Sheet, Typography, Avatar } from '@mui/joy'

import JoyStarRating from '../../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/playerAbilitiesKpi.sx.js'

function KpiCard({ label, value, subValue = '', icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography sx={sx.kpiValueSx}>{value}</Typography>

      {subValue ? (
        <Box sx={sx.kpiSubBoxSx}>
          <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
        </Box>
      ) : null}
    </Sheet>
  )
}

function LevelStars({ label, value }) {
  const v = value === 0 || value ? Number(value) : null

  return (
    <Box sx={{ display: 'grid', justifyItems: 'start', minWidth: 72 }}>
      <Typography level="title-sm" sx={{ opacity: 0.75, lineHeight: 1.1 }}>
        {label}
      </Typography>
      <JoyStarRating value={v} size="md" />
    </Box>
  )
}

export default function PlayerAbilitiesKpi({ entity, summary, globalCount }) {
  const playerName = `${entity?.playerFirstName || ''} ${entity?.playerLastName || ''}`.trim()

  const strongestLabel = summary?.strongest?.domainLabel || '—'
  const strongestAvg =
    Number.isFinite(Number(summary?.strongest?.avg)) ? `(${summary.strongest.avg})` : ''

  const weakestLabel = summary?.weakest?.domainLabel || '—'
  const weakestAvg =
    Number.isFinite(Number(summary?.weakest?.avg)) ? `(${summary.weakest.avg})` : ''

  const formsCount = Number(entity?.abilitiesState?.evaluation?.formsCount || 0)
  const evaluatorsCount = Number(entity?.abilitiesState?.evaluation?.evaluatorsCount || 0)

  const completionValue = `${globalCount?.filled || 0}/${globalCount?.total || 0}`

  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroTitleWrapSx}>
            <Box sx={sx.heroIconBoxSx}>
              <Avatar src={entity?.photo || playerImage} />
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {playerName || 'שחקן'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                יכולות השחקן
              </Typography>
            </Box>
          </Box>

          <Box sx={sx.heroStarsWrapSx}>
            <LevelStars label="יכולת" value={entity?.level} />
            <LevelStars label="פוטנציאל" value={entity?.levelPotential} />
          </Box>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="יכולות שהושלמו"
            value={completionValue}
            icon={iconUi({ id: 'abilities', size: 'sm' })}
          />

          <KpiCard
            label="דוחות שבוצעו"
            value={formsCount}
            icon={iconUi({ id: 'form', size: 'sm' })}
          />

          <KpiCard
            label="מעריכים"
            value={evaluatorsCount}
            icon={iconUi({ id: 'group', size: 'sm' })}
          />

          <KpiCard
            label="יכולת חלשה"
            value={`${weakestLabel} ${weakestAvg}`.trim()}
            icon={iconUi({ id: 'warning', size: 'sm' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
