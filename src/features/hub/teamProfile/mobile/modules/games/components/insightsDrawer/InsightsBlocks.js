// playerProfile/desktop/modules/games/components/insightsDrawer/InsightsBlocks.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Typography,
  Avatar,
  DialogTitle,
  ModalClose,
  Tooltip
} from '@mui/joy'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { insightsBlockSx as sx } from './sx/insightsBlock.sx.js'
import { InsightRow } from './InsightsRows.js'

const c = getEntityColors('players')

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
  const team = entity?.team
  const src = entity?.photo || playerImage
  const clubName = club?.clubName || 'מועדון'
  const teamName = team?.teamName || ''
  const teamYearLabel = team?.teamYear ? `שנתון ${team.teamYear}` : ''
  const leagueLabel = team?.league || ''
  const title = [`${clubName} ${teamName}`.trim(), teamYearLabel, leagueLabel].filter(Boolean).join(' · ')

  return (
    <DialogTitle sx={sx.dialTit}>
      <Box sx={sx.headerRow}>
        <Avatar src={src} sx={{ width: 40, height: 40, flexShrink: 0, }} />

        <Box sx={sx.headerContent}>
          {/* שורה 1 – מועדון + קבוצה */}
          <Typography level="title-md" sx={sx.titleMain}>
            {entity?.playerFullName} · {clubName}
          </Typography>

          {/* שורה 2 – שנתון + ליגה */}
          <Typography level="body-sm" sx={{ opacity: 0.7, fontSize: 12, lineHeight: 1.2, }}>
            {[teamName, teamYearLabel, leagueLabel].filter(Boolean).join(' · ')}
          </Typography>

          {/* שורה 3 – סוג מגירה */}
          <Typography
            level="body-sm"
            sx={{ opacity: 0.8, fontSize: 12, lineHeight: 1.2, }}
            startDecorator={iconUi({ id: 'insights' })}
          >
            תובנות משחקי השחקן
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
