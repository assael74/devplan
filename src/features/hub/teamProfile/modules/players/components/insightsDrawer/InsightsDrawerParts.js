// teamProfile/modules/players/components/insightsDrawer/InsightsDrawerParts.js

import React from 'react'
import { Box, Chip, Divider, Sheet, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { buildFallbackAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { teamPlayersInsightsSx as sx } from './sx/teamPlayers.insights.sx.js'

const c = getEntityColors('teams')
const p = getEntityColors('players')

/* ---------------- StatCard ---------------- */

export function StatCard({ title, value, sub, icon }) {
  return (
    <Sheet variant="soft" sx={sx.statCard}>
      <Box sx={sx.statCardHead}>
        <Box sx={sx.iconWrap}>{iconUi({ id: icon, size: 'sm' })}</Box>

        <Typography level="body-xs" sx={{ opacity: 0.8, fontWeight: 600 }}>
          {title}
        </Typography>

        <Typography level="title-sm" sx={{ fontWeight: 700, ml: 'auto' }}>
          {value}
        </Typography>
      </Box>

      {sub ? (
        <Typography level="body-xs" sx={{ opacity: 0.65 }}>
          {sub}
        </Typography>
      ) : null}
    </Sheet>
  )
}

/* ---------------- ChipsList ---------------- */

export function ChipsList({ items = [], iconFallback = 'layers' }) {
  if (!items.length) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
        אין נתונים להצגה
      </Typography>
    )
  }

  return (
    <Box sx={sx.chipsWrap}>
      {items.map((item) => (
        <Chip
          key={item.id}
          size="md"
          variant="soft"
          startDecorator={iconUi({ id: item.icon || item.id || iconFallback, sx: { color: p.accent } })}
          sx={{ maxWidth: '100%' }}
        >
          {item.label} ({item.count})
        </Chip>
      ))}
    </Box>
  )
}

/* ---------------- SectionBlock ---------------- */

export function SectionBlock({ title, icon, children }) {
  return (
    <Box sx={sx.sectionBlock}>
      <Box sx={sx.sectionHead}>
        <Box sx={sx.sectionIcon}>{iconUi({ id: icon })}</Box>

        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ my: 0.1 }} />

      {children}
    </Box>
  )
}

/* ---------------- Drawer Header ---------------- */

export function InsightsDrawerHeader({ entity }) {
  const src = entity?.photo || buildFallbackAvatar({ entityType: 'team', id: entity?.id, name: entity?.teamName, })
  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {entity?.teamName}
          </Typography>

          <Typography level="body-sm" sx={sx.formNameSx} startDecorator={iconUi({id: 'insights'})}>
           תובנות
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
