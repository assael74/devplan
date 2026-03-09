// src/ui/sort/SortTrigger.js
import React, { useMemo } from 'react'
import { Chip, Typography, Box, IconButton } from '@mui/joy'
import { findOptionLabel } from './sort.utils'
import { iconUi } from '../../core/icons/iconUi.js'

export default function SortTrigger({
  value,
  options,
  onOpen,
  dir = 'desc',
  labelFallback = 'מיון',
  onSort,
}) {
  const label = useMemo(
    () => findOptionLabel(options, value, labelFallback),
    [options, value, labelFallback]
  )

  const arrow = dir === 'asc' ? '↑' : '↓'

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Chip
        size="sm"
        variant="soft"
        onClick={onOpen}
        startDecorator={iconUi({ id: 'sort' })}
        sx={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {label}
          </Typography>
          <Typography sx={{ flex: '0 0 auto' }}>{arrow}</Typography>
        </Box>
      </Chip>
      <IconButton
        size="sm"
        variant="soft"
        onClick={onSort}
        sx={{
          borderRadius: 8,
          bgcolor: 'rgba(0,0,0,0.08)',
          p: 0.4,
          minHeight: 15,
          minWidth: 15,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.14)' }
        }}
      >
        {iconUi({ id: 'swapVert' })}
      </IconButton>
    </Box>

  )
}
