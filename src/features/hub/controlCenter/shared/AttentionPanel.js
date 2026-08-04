// src/features/hub/controlCenter/shared/AttentionPanel.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { COLORS } from '../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

const STATUS_COLOR_KEY = {
  attention: 'warning',
  missing: 'warning',
  danger: 'danger',
  ok: 'success',
}

function getStatusColors(status) {
  return COLORS.status[STATUS_COLOR_KEY[status] || 'neutral'] || COLORS.status.neutral
}

export default function AttentionPanel({ items = [] }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : []

  if (!list.length) return null

  const visibleItems = list.slice(0, 2)
  const hiddenCount = Math.max(list.length - visibleItems.length, 0)

  return (
    <Sheet
      variant="outlined"
      sx={{
        display: 'grid',
        gap: 0.75,
        p: 1.1,
        borderRadius: 12,
        borderColor: COLORS.status.warning.solid,
        bgcolor: COLORS.status.warning.softBg,
      }}
    >
      <Typography
        level="body-xs"
        sx={{
          fontWeight: 700,
          color: COLORS.status.warning.text,
        }}
      >
        דורש טיפול
      </Typography>

      <Box sx={{ display: 'grid', gap: 0.6 }}>
        {visibleItems.map((item) => {
          const colors = getStatusColors(item.status)

          return (
            <Box
              key={item.id}
              sx={{
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color: colors.text,
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  bgcolor: colors.softBg,
                }}
              >
                {iconUi({ id: 'warning', sx: { fontSize: 15, color: colors.solid } })}
              </Box>

              <Typography level="body-sm" sx={{ minWidth: 0, color: 'inherit' }}>
                {item.text}
              </Typography>
            </Box>
          )
        })}

        {hiddenCount ? (
          <Typography level="body-xs" sx={{ color: COLORS.status.warning.text, fontWeight: 700 }}>
            ועוד {hiddenCount} חוסרים
          </Typography>
        ) : null}
      </Box>
    </Sheet>
  )
}
