// src/features/videoHub/components/filters/rows/ActiveFiltersChipsRow.js
import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function ActiveFiltersChipsRow({
  total,
  shown,
  sortLabel,
  sortDir,
  activeChips,
  onRemoveChip,
}) {
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography level="body-xs" sx={{ opacity: 0.75 }}>
        מציג {shown} מתוך {total} · מיון: {sortLabel} {sortDir === 'desc' ? '↓' : '↑'}
      </Typography>

      {activeChips.map((c) => (
        <Chip
          key={c.key}
          size="sm"
          variant="soft"
          endDecorator={
            <Box onClick={() => onRemoveChip(c.key)} style={{ cursor: 'pointer', display: 'flex' }}>
              {iconUi({ id: 'close' })}
            </Box>
          }
        >
          {c.label}: {c.value}
        </Chip>
      ))}
    </Box>
  )
}
