// playerProfile/mobile/modules/abilities/components/insightsDrawer/InsightsBlocks.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Typography,
  Avatar,
  DialogTitle,
  ModalClose,
  Chip,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { resolvePlayerFullName } from '../../../../../../../../shared/abilities/abilities.resolvers.js'

import { insightsBlockSx as sx } from './sx/playerAbilities.insightsBlock.sx.js'

const c = getEntityColors('players')

export function StatCard({ title, value, sub, icon }) {
  return (
    <Sheet variant="soft" sx={sx.statCard}>
      <Box sx={sx.statCardHead}>
        <Box sx={sx.iconWrap}>{iconUi({ id: icon, size: 'sm' })}</Box>

        <Typography level="body-md" sx={{ opacity: 0.82, fontWeight: 700, fontSize: 12 }}>
          {title}
        </Typography>

        <Typography level="body-sm" sx={sx.insightValue}>
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

export function InsightsDrawerHeader({ entity, isEligible = false }) {
  const src = entity?.photo || playerImage
  const playerName = resolvePlayerFullName(entity) || entity?.name || 'שחקן'

  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <Avatar src={src} />

        <Box sx={{ ml: 1, minWidth: 0 }}>
          <Typography level="title-md" sx={{ fontWeight: 700 }}>
            {playerName}
          </Typography>

          <Typography
            level="body-sm"
            sx={{ opacity: 0.8 }}
            startDecorator={iconUi({ id: 'insights' })}
          >
            תובנות יכולות שחקן
          </Typography>
        </Box>

        <Chip
          size="sm"
          color={isEligible ? 'success' : 'warning'}
          variant="soft"
          sx={{ ml: 'auto', mr: 6, mt: -2 }}
        >
          {isEligible ? 'מוכן לתובנות' : 'חסר כיסוי'}
        </Chip>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
