// preview/previewDomainCard/domains/club/teams/components/ClubTeamsKpi.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { heroSx as sx } from '../sx/clubTeamsKpi.sx'

const c = getEntityColors('teams')

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

function formatLevel(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export default function ClubTeamsKpi({ entity, summary }) {
  const src = resolveEntityAvatar({
    entityType: 'club',
    entity,
    subline: entity?.clubName || entity?.name,
  })

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
                {entity?.clubName || entity?.name || 'מועדון'}
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="success" sx={sx.heroBadgeSx}>
            קבוצות מועדון
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="סה״כ קבוצות"
            value={summary?.totalTeams}
            icon={iconUi({ id: 'team', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label="קבוצות פעילות"
            value={summary?.activeTeams}
            icon={iconUi({ id: 'check', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label="סה״כ שחקנים"
            value={summary?.totalPlayers}
            icon={iconUi({ id: 'players', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label="רמה ממוצעת"
            value={formatLevel(summary?.avgLevel)}
            icon={iconUi({ id: 'stats', size: 'sm', sx: { color: c.accent } })}
          />
        </Box>

        <Box sx={sx.tagsRowSx}>
          <Chip size="sm" variant="soft" color="neutral" sx={sx.tagChipSx}>
            צוות מועדון {summary?.clubRoles ?? 0}
          </Chip>

          <Chip size="sm" variant="soft" color="neutral" sx={sx.tagChipSx}>
            קבוצות פרויקט {summary?.projectTeams ?? 0}
          </Chip>
        </Box>
      </Box>
    </Sheet>
  )
}
