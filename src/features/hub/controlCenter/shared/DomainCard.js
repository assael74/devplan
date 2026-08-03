// src/features/hub/controlCenter/shared/DomainCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

export default function DomainCard({ domain, onOpen, compact = false }) {
  const colors = getEntityColors(domain?.colorKey)

  return (
    <Sheet
      component="button"
      type="button"
      variant="outlined"
      onClick={() => onOpen?.(domain)}
      sx={{
        width: '100%',
        minHeight: compact ? 82 : 112,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        p: compact ? 1.25 : 1.5,
        borderRadius: 12,
        borderColor: 'divider',
        bgcolor: 'background.surface',
        color: 'text.primary',
        textAlign: 'right',
        cursor: 'pointer',
        transition: 'border-color 160ms ease, background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
        '&:hover, &:focus-visible': {
          borderColor: colors.accent,
          bgcolor: colors.bg,
          boxShadow: 'sm',
          transform: 'translateY(-1px)',
        },
        '&:hover .domain-card-arrow, &:focus-visible .domain-card-arrow': {
          opacity: 1,
          transform: 'translateX(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: compact ? 38 : 42,
          height: compact ? 38 : 42,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          bgcolor: colors.bg,
          color: colors.accent,
        }}
      >
        {iconUi({ id: domain?.iconId, size: 'small' })}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {domain?.label}
        </Typography>

        <Typography
          level="body-sm"
          sx={{
            mt: 0.45,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {domain?.primary}
        </Typography>

        <Typography level="body-xs" sx={{ mt: 0.2, color: 'text.tertiary' }}>
          {domain?.secondary}
        </Typography>
      </Box>

      <Box
        className="domain-card-arrow"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: colors.accent,
          opacity: 0.55,
          transition: 'opacity 160ms ease, transform 160ms ease',
        }}
      >
        {iconUi({ id: 'forward', size: 'small' })}
      </Box>
    </Sheet>
  )
}
