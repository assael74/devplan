// features\hub\sharedProfile\EmptyState.js
import React from 'react'
import { Sheet, Typography, Button, Box } from '@mui/joy'

export default function EmptyState({ title, desc, actionLabel, onAction }) {
  return (
    <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md' }}>
      <Typography level="title-sm">{title || 'אין נתונים'}</Typography>
      {desc ? (
        <Typography level="body-sm" sx={{ opacity: 0.75, mt: 0.5 }}>
          {desc}
        </Typography>
      ) : null}

      {actionLabel ? (
        <Box sx={{ mt: 1.25 }}>
          <Button size="sm" variant="soft" onClick={onAction}>
            {actionLabel}
          </Button>
        </Box>
      ) : null}
    </Sheet>
  )
}
