import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import JoyStarRating from '../../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/playerAbilitiesKpi.sx.js'

const toFixed1 = (v) => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : '—')

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography sx={sx.kpiValueSx}>{value}</Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
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

  const avgAll = toFixed1(summary?.avgAll)
  const withVideo = summary?.withVideo ?? 0

  const strongestLabel = summary?.strongest?.domainLabel || '—'
  const strongestAvg = toFixed1(summary?.strongest?.avg)
  const strongestColor = summary?.strongest?.color || 'neutral'

  const weakestLabel = summary?.weakest?.domainLabel || '—'
  const weakestAvg = toFixed1(summary?.weakest?.avg)
  const weakestColor = summary?.weakest?.color || 'neutral'

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
            value={avgAll}
            icon={iconUi({ id: 'meetingReminder', size: 'sm', sx: { color: summary?.color || 'neutral' } })}
          />

          <KpiCard
            label="ממוצע כללי"
            value={withVideo}
            icon={iconUi({ id: 'meetingReminder', size: 'sm', sx: { color: summary?.color || 'neutral' } })}
          />

          <KpiCard
            label="חוזקות"
            value={`${strongestLabel} (${strongestAvg})`}
            icon={iconUi({ id: 'meetingReminder', size: 'sm', sx: { color: strongestColor } })}
          />

          <KpiCard
            label="חולשות"
            value={`${weakestLabel} (${weakestAvg})`}
            icon={iconUi({ id: 'meetingReminder', size: 'sm', sx: { color: weakestColor } })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
