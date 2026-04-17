import React from 'react'
import { Box, Chip } from '@mui/joy'

export default function PreviewChipsRow({ chips }) {
  const list = (chips || []).filter(Boolean)
  if (!list.length) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {list.map((c, i) => (
        <Chip key={i} variant="soft">
          {c}
        </Chip>
      ))}
    </Box>
  )
}
