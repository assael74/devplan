// src/features/hub/controlCenter/shared/DomainCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { COLORS, devPlanColors, getEntityColors } from '../../../../ui/core/theme/Colors.js'

const STATUS_COLOR_KEY = {
  ok: 'success',
  attention: 'warning',
  missing: 'warning',
  empty: 'neutral',
  info: 'info',
}

const STATUS_LABEL = {
  ok: 'תקין',
  attention: 'דורש טיפול',
  missing: 'חסר מידע',
  empty: 'אין נתונים',
  info: 'מידע',
}

function getStatusColors(status) {
  return COLORS.status[STATUS_COLOR_KEY[status] || 'neutral'] || COLORS.status.neutral
}

export default function DomainCard({ domain, onOpen, compact = false }) {
  const colors = getEntityColors(domain?.colorKey)
  const statusColors = getStatusColors(domain?.status)

  return (
    <Sheet
      component="button"
      type="button"
      variant="outlined"
      onClick={() => onOpen?.(domain)}
      sx={{
        width: '100%',
        minHeight: compact ? 78 : 94,
        display: 'flex',
        alignItems: 'center',
        gap: 1.05,
        p: compact ? 1 : 1.25,
        borderRadius: 10,
        borderColor: 'neutral.300',
        bgcolor: COLORS.entity.domain.base.bg,
        color: COLORS.entity.domain.base.text,
        textAlign: 'right',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        transition: 'border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
        '&:hover, &:focus-visible': {
          borderColor: devPlanColors.tertiary,
          bgcolor: devPlanColors.secondaryLight,
          boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)',
        },
        '&:hover .domain-icon-box, &:focus-visible .domain-icon-box': {
          bgcolor: colors.bg,
          color: colors.accent,
          boxShadow: `inset 0 0 0 1px ${colors.accent}33`,
        },
        '&:hover .domain-action, &:focus-visible .domain-action': {
          color: devPlanColors.tertiaryDark,
          transform: 'translateX(-2px)',
        },
      }}
    >
      <Box
        className="domain-icon-box"
        sx={{
          width: compact ? 38 : 42,
          height: compact ? 38 : 42,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9,
          bgcolor: 'background.level1',
          color: colors.accent,
          boxShadow: 'inset 0 0 0 1px var(--joy-palette-divider)',
          transition: 'background-color 160ms ease, color 160ms ease, box-shadow 160ms ease',
        }}
      >
        {iconUi({ id: domain?.iconId, size: 'small' })}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, display: 'grid', gap: 0.28 }}>
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography level="title-sm" noWrap sx={{ minWidth: 0, fontWeight: 800 }}>
            {domain?.label}
          </Typography>

          <Typography
            level="body-sm"
            noWrap
            sx={{
              flexShrink: 0,
              fontWeight: 800,
              color: 'text.primary',
            }}
          >
            {domain?.primary}
          </Typography>
        </Box>

        <Typography level="body-xs" noWrap sx={{ color: COLORS.entity.domain.base.subText }}>
          {domain?.secondary}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mt: 0.2,
          }}
        >
          <Typography
            level="body-xs"
            noWrap
            sx={{
              minWidth: 0,
              px: 0.65,
              py: 0.25,
              borderRadius: 999,
              bgcolor: statusColors.softBg,
              color: statusColors.text,
              fontWeight: 700,
            }}
          >
            {domain?.statusLabel || STATUS_LABEL[domain?.status] || 'מידע'}
          </Typography>

          <Box
            className="domain-action"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              color: devPlanColors.tertiary,
              fontWeight: 800,
              fontSize: 13.5,
              lineHeight: 1,
              flexShrink: 0,
              transition: 'color 160ms ease, transform 160ms ease',
            }}
          >
            <Box component="span">{domain?.actionText || 'פתח'}</Box>
            {iconUi({ id: 'forward', sx: { fontSize: 19 } })}
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
