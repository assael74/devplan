// videoHub/components/filters/rows/ActiveFiltersChipsRow.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { alpha } from '@mui/system'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { filterSx as sx } from '../filterRow.sx'

const TONE_COLORS = {
  green: '#16A34A',
  orange: '#F97316',
  blue: '#2563EB',
  purple: '#7C3AED',
  yellow: '#D97706',
  cyan: '#0891B2',
  teal: '#0F766E',
  neutral: '#64748B',
}

const getChipColor = chip => chip?.color || TONE_COLORS[chip?.tone] || ''

function renderChipIcon(chip) {
  if (!chip?.iconId) return null

  const color = getChipColor(chip) || '#64748B'

  return (
    <Box
      sx={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha(color, 0.12),
        color,

        '& svg': {
          fontSize: 13,
        },
      }}
    >
      {iconUi({ id: chip.iconId, size: 'sm' })}
    </Box>
  )
}

function getChipSx(chip) {
  const color = getChipColor(chip)

  if (!color) return undefined

  return {
    borderColor: alpha(color, 0.28),
    bgcolor: alpha(color, 0.1),
    color,
    fontWeight: 700,
  }
}

function getChipText(chip) {
  if (chip?.compact || !chip?.label) return chip?.value
  return `${chip.label}: ${chip.value}`
}

export default function ActiveFiltersChipsRow({
  total,
  shown,
  sortLabel,
  sortDir,
  activeChips,
  onRemoveChip,
}) {
  return (
    <Box sx={sx.chipRow}>
      <Typography level="body-xs" sx={{ opacity: 0.75 }}>
        מציג {shown} מתוך {total} · מיון: {sortLabel} {sortDir === 'desc' ? '↓' : '↑'}
      </Typography>

      {activeChips.map((c) => (
        <Chip
          key={c.key}
          size="sm"
          variant="soft"
          startDecorator={renderChipIcon(c)}
          endDecorator={
            <Box onClick={() => onRemoveChip(c.key)} style={{ cursor: 'pointer', display: 'flex' }}>
              {iconUi({ id: 'close' })}
            </Box>
          }
          sx={getChipSx(c)}
        >
          {getChipText(c)}
        </Chip>
      ))}
    </Box>
  )
}
