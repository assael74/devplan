import React from 'react'
import { Box, Button } from '@mui/joy'

export default function PreviewQuickActions({ actions }) {
  const list = (actions || []).filter(Boolean)
  if (!list.length) return null

  return (
    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {list.map((a) => (
        <Button
          key={a.key}
          size="sm"
          variant={a.variant || 'soft'}
          onClick={a.onClick}
          disabled={a.disabled}
        >
          {a.label}
        </Button>
      ))}
    </Box>
  )
}
