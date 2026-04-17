import React from 'react'
import { Box, Sheet, Typography, Avatar } from '@mui/joy'

import JoyStarRating from '../../../../../../../../../../ui/domains/ratings/JoyStarRating.js'
import { resolveEntityAvatar } from '../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/teamAbilitiesKpi.sx.js'

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

function toScoreText(v) {
  const n = Number(v)
  return Number.isFinite(n) ? `${Math.round(n * 10) / 10}` : '—'
}

export default function TeamAbilitiesKpi({ entity, context, summary, globalCount }) {
  const teamName = entity?.teamName || entity?.name || 'קבוצה'
  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  const strongestLabel = summary?.strongest?.domainLabel || '—'
  const strongestAvg = Number.isFinite(Number(summary?.strongest?.avg))
    ? `(${summary.strongest.avg})`
    : ''

  const weakestLabel = summary?.weakest?.domainLabel || '—'
  const weakestAvg = Number.isFinite(Number(summary?.weakest?.avg))
    ? `(${summary.weakest.avg})`
    : ''

  const teamLevel =
    entity?.abilitiesState?.teamLevel ??
    entity?.abilitiesState?.level ??
    summary?.avgAll ??
    null

  const teamPotential =
    entity?.abilitiesState?.teamPotential ??
    entity?.abilitiesState?.levelPotential ??
    null

  const playersCount = Number(summary?.playersCount || 0)
  const playersWithAbilities = Number(summary?.playersWithAbilities || 0)
  const completionValue = `${globalCount?.filled || 0}/${globalCount?.total || 0}`

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
                {teamName}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                יכולות קבוצה
              </Typography>
            </Box>
          </Box>

          <Box sx={sx.heroStarsWrapSx}>
            <LevelStars label="יכולת" value={teamLevel} />
            <LevelStars label="פוטנציאל" value={teamPotential} />
          </Box>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="יכולות שהושלמו"
            value={completionValue}
            subValue={summary?.completionPct ? `${summary.completionPct}% כיסוי` : ''}
            icon={iconUi({ id: 'abilities', size: 'sm' })}
          />

          <KpiCard
            label="שחקנים עם יכולות"
            value={playersWithAbilities}
            subValue={playersCount ? `מתוך ${playersCount} שחקנים` : ''}
            icon={iconUi({ id: 'group', size: 'sm' })}
          />

          <KpiCard
            label="יכולת חזקה"
            value={`${strongestLabel} ${strongestAvg}`.trim()}
            icon={iconUi({ id: 'trendUp', size: 'sm' })}
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
