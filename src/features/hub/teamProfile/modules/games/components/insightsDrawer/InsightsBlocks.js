// teamProfile/modules/games/components/insightsDrawer/InsightsBlocks.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Typography,
  Avatar,
  DialogTitle,
  ModalClose,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { insightsBlockSx as sx } from './sx/teamGames.insightsBlock.sx.js'
import { InsightRow } from './InsightsRows.js'

const c = getEntityColors('teams')

export function StatCard({ title, value, sub, icon }) {
  return (
    <Sheet variant="soft" sx={sx.statCard}>
      <Box sx={sx.statCardHead}>
        <Box sx={sx.iconWrap}>{iconUi({ id: icon, size: 'sm' })}</Box>

        <Typography level="body-md" sx={{ opacity: 0.82, fontWeight: 700, fontSize: 12 }}>
          {title}
        </Typography>

        <Typography level="body-sm" variant="outlined" sx={sx.insightValue}>
          {value}
        </Typography>
      </Box>

      {sub ? (
        <Typography level="body-xs" sx={{ opacity: 0.68 }}>
          {sub}
        </Typography>
      ) : null}
    </Sheet>
  )
}

export function SectionBlock({ title, icon, children, endDecorator = null }) {
  return (
    <Box sx={sx.sectionBlock}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.sectionIcon}>{iconUi({ id: icon })}</Box>

        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        {endDecorator}
      </Box>

      <Divider sx={{ my: 0.1 }} />

      {children}
    </Box>
  )
}

export function InsightsDrawerHeader({ entity }) {
  const club = entity?.club
  const src = resolveEntityAvatar({ entityType: 'team', entity: entity, parentEntity: entity?.club, subline: entity?.club?.name, })
  const clubName = club?.clubName || 'מועדון'
  const teamName = entity?.teamName || ''
  const teamYearLabel = entity?.teamYear ? `שנתון ${entity.teamYear}` : ''
  const leagueLabel = entity?.league || ''
  const title = [`${clubName} ${teamName}`.trim(), teamYearLabel, leagueLabel].filter(Boolean).join(' · ')

  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={sx.headerRow}>
        <Avatar src={src} sx={{ width: 40, height: 40, flexShrink: 0, }} />

        <Box sx={sx.headerContent}>
          {/* שורה 1 – מועדון + קבוצה */}
          <Typography level="title-md" sx={sx.titleMain}>
            {clubName} · {teamName}
          </Typography>

          {/* שורה 2 – שנתון + ליגה */}
          <Typography level="body-sm" sx={{ opacity: 0.7, fontSize: 12, lineHeight: 1.2, }}>
            {[teamYearLabel, leagueLabel].filter(Boolean).join(' · ')}
          </Typography>

          {/* שורה 3 – סוג מגירה */}
          <Typography
            level="body-sm"
            sx={{ opacity: 0.8, fontSize: 12, lineHeight: 1.2, }}
            startDecorator={iconUi({ id: 'insights' })}
          >
            תובנות משחקי קבוצה
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
