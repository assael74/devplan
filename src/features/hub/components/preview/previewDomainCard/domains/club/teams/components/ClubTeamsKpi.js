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
        <Typography sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.15 }}>{label}</Typography>
        {icon}
      </Box>
      <Typography sx={sx.kpiValueSx}>{value ?? 0}</Typography>
    </Sheet>
  )
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

            <Box sx={{ minWidth: 0, display: 'grid', gap: 0.1 }}>
              <Typography level="title-md" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
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
            value={summary?.activeTeamsTotal}
            icon={iconUi({ id: 'team', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label="סה״כ שחקנים"
            value={`${summary?.playersTotal}`}
            icon={iconUi({ id: 'players', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label="שחקני מפתח"
            value={summary?.keyPlayersTotal}
            icon={iconUi({ id: 'keyPlayer', size: 'sm', sx: { color: c.accent } })}
          />

          <KpiCard
            label="שחקני פרויקט"
            value={summary?.projectPlayersTotal}
            icon={iconUi({ id: 'project', size: 'sm', sx: { color: c.accent } })}
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
