// src/features/teams/teamProfile/modules/performance/components/performance.table.ui.js
import React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'
import SwapVertRounded from '@mui/icons-material/SwapVertRounded'
import ThumbUpAltRounded from '@mui/icons-material/ThumbUpAltRounded'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi'

export const pctTextSx = {
  color: 'neutral.500',
  fontWeight: 700,
}

export const initialsFromName = (name) => {
  const s = String(name || '').trim()
  if (!s) return 'P'
  const parts = s.split(/\s+/).filter(Boolean)
  const a = parts[0][0] || ''
  const b = parts.length > 1 ? parts[parts.length - 1][0] || '' : ''
  return (a + b).toUpperCase() || 'P'
}

export const Th = ({ col, active, dir, onClick, thInlineSx, rowSpan  }) => {
  const { label, w, isPct, iconId } = col
  const iconNode = iconId ? iconUi({ id: iconId }) : null
  const canSort = !!col?.sortKey && typeof onClick === 'function'

  return (
    <th
      rowSpan={rowSpan}
      onClick={onClick}
      style={{
        textAlign: col.align || 'center',
        cursor: canSort ? 'pointer' : 'default',
        width: w,
        minWidth: w,
        maxWidth: w,
        ...(isPct
            ? {
                backgroundColor: 'rgba(59, 130, 246, 0.06)',
                borderLeft: '2px solid rgba(59, 130, 246, 0.35)',
              }
            : null),
      }}
    >
      <Box sx={thInlineSx}>
        {label === '+' ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              maxWidth: w - 26,
              overflow: 'hidden',
              ...(isPct ? pctTextSx : null),
            }}
          >
            <ThumbUpAltRounded fontSize="small" sx={{ color: 'success.600' }} />
          </Box>
          ) : (
          <Tooltip title={label || ''} placement="top" arrow>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                maxWidth: w - 26,
                overflow: 'hidden',
                ...(isPct ? pctTextSx : null),
              }}
            >
              {iconNode ? (
                iconNode
              ) : (
                <Typography
                  level="body-xs"
                  sx={{
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Typography>
              )}
            </Box>
          </Tooltip>
        )}
        {canSort ? (
          <SwapVertRounded
            fontSize="small"
            sx={{
              opacity: active ? 1 : 0.35,
              transform: active && dir === 'asc' ? 'rotate(180deg)' : 'none',
            }}
          />
        ) : null}
      </Box>
    </th>
  )
}

export const tdInlineStyle = (col) => {
  const w = col?.w
  const isPct = !!col?.isPct

  return {
    textAlign: 'center',
    width: w,
    minWidth: w,
    maxWidth: w,
    fontVariantNumeric: 'tabular-nums',
    ...(isPct
      ? {
          backgroundColor: 'rgba(59, 130, 246, 0.06)',
          fontWeight: 700,
          borderLeft: '2px solid rgba(59, 130, 246, 0.35)',
        }
      : null),
  }
}

export const fmtPct = (v) => (v != null ? `${v}%` : '—')
