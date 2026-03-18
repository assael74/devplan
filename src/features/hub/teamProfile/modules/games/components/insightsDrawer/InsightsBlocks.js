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
import { buildFallbackAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

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
  const src = entity?.photo || buildFallbackAvatar({ entityType: 'team', id: entity?.id, name: entity?.teamName })

  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {entity?.teamName}
          </Typography>

          <Typography
            level="body-sm"
            sx={sx.formNameSx}
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
