import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import JoyStarRating from '../../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import { buildFallbackAvatar } from '../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/teamAbilitiesKpi.sx.js'

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

export default function TeamAbilitiesKpi({ entity, summary, globalCount }) {
  const team = entity
  const src = team?.photo || buildFallbackAvatar({ entityType: 'team', id: team?.id, name: team?.teamName })

  const abilitiesDocs = summary?.playersWithAbilities
  const allTeamPlayers = summary?.playersCount
  const rateDocs = allTeamPlayers ? Math.round((abilitiesDocs / allTeamPlayers) * 100) : 0

  const strongestLabel = summary?.strongest?.domainLabel || '—'
  const strongestAvg = toFixed1(summary?.strongest?.avg)

  const weakestLabel = summary?.weakest?.domainLabel || '—'
  const weakestAvg = toFixed1(summary?.weakest?.avg)

  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroTitleWrapSx}>
            <Box sx={sx.heroIconBoxSx}>
              <Avatar src={src} />
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {team?.teamName || 'קבוצה'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                יכולות קבוצה
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
            label="שחקנים עם דיווח"
            value={`${abilitiesDocs}/${allTeamPlayers}`}
            icon={iconUi({ id: 'addAbilities', size: 'md' })}
            subValue={`${rateDocs}% אחוז מילוי טפסים`}
          />

          <KpiCard
            label="ממוצע כללי"
            value={summary?.avgAllLabel || 0}
            icon={iconUi({ id: 'level', size: 'md', sx: { color: '#f3fa14' } })}
          />

          <KpiCard
            label="חוזקות"
            value={`${strongestLabel} (${strongestAvg})`}
            icon={iconUi({ id: 'strength', size: 'lg', sx: { color: '#16A34A' } })}
          />

          <KpiCard
            label="חולשות"
            value={`${weakestLabel} (${weakestAvg})`}
            icon={iconUi({ id: 'weakness', size: 'md', sx: { color: '#DC2626' } })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
