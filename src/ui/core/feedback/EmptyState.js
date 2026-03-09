import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

export default function EmptyState({ title, hint, actionText, onAction }) {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography level="title-md">{title}</Typography>
      {hint ? (
        <Typography level="body-sm" sx={{ mt: 1, color: 'text.tertiary' }}>
          {hint}
        </Typography>
      ) : null}
      {actionText ? (
        <Button sx={{ mt: 2 }} variant="soft" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </Box>
  )
}
