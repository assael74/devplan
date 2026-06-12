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
  return (
    <Box sx={sx.inputRoot}>
      <Typography level="title-sm">
        הדבקת נתונים
      </Typography>

      <Textarea
        minRows={minRows}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        sx={sx.pasteTextarea}
      />

      <Typography level="body-xs" sx={sx.mutedText}>
        ניתן להעתיק ישירות מאקסל או Google Sheets. השורה הראשונה חייבת להיות כותרות.
      </Typography>
    </Box>
  )
}
