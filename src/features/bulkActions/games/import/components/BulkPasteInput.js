// src/features/bulkActions/games/import/components/BulkPasteInput.js

import React from 'react'
import { Box, Textarea, Typography } from '@mui/joy'

import { bulkSx as sx } from './sx/bulk.sx.js'

export default function BulkPasteInput({
  value = '',
  onChange,
  placeholder = '',
  minRows = 8,
}) {
  const hasPastedData = Boolean(value.trim())

  return (
    <Box sx={sx.inputRoot}>
      <Typography level="title-sm">
        הדבקת נתונים
      </Typography>

      <Textarea
        minRows={hasPastedData ? 3 : minRows}
        maxRows={hasPastedData ? 3 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        slotProps={{
          textarea: {
            className: 'dpScrollThin',
          },
        }}
        sx={sx.pasteTextarea}
      />

      <Typography level="body-xs" sx={sx.mutedText}>
        ניתן להעתיק ישירות מאקסל או Google Sheets. השורה הראשונה חייבת להיות כותרות.
      </Typography>
    </Box>
  )
}
