// preview/previewDomainCard/domains/team/players/components/TeamPlayersKpi.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { heroSx as sx } from '../sx/teamPlayersKpi.sx'

const c = getEntityColors('players')

function KpiCard({ label, value, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>
      <Typography sx={sx.kpiValueSx}>{value ?? 0}</Typography>
    </Sheet>
  )
}

export default function TeamPlayersKpi({ entity, summary }) {
  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  const positionsSummary = Array.isArray(summary?.positionsSummary) ? summary.positionsSummary : []

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
                {entity?.name || entity?.teamName || 'קבוצה'}
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            סגל שחקנים
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label='סה״כ שחקנים'
            value={summary?.playersCount}
            icon={iconUi({ id: 'players', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label='שחקני מפתח'
            value={summary?.keyCount}
            icon={iconUi({ id: 'keyPlayer', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label='ממוצע פוטנציאל'
            value={summary?.avgPotential}
            icon={iconUi({ id: 'stats', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label={`מתחת ל־${summary?.minutesBelowThreshold ?? 50}%`}
            value={summary?.belowMinutesCount}
            icon={iconUi({ id: 'time', size: 'sm', sx: { color: c.accent } })}
          />
        </Box>

        {!!positionsSummary.length && (
          <Box sx={sx.positionsRowSx}>
            {positionsSummary.map((item) => (
              <Chip
                key={item.label}
                size="sm"
                variant="soft"
                color="neutral"
                sx={sx.positionChipSx}
              >
                {item.label} {item.count}
              </Chip>
            ))}
          </Box>
        )}
      </Box>
    </Sheet>
  )
}
