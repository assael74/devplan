// src/features/bulkActions/players/import/components/PlayersBulkPasteInput.js

import React from 'react'
import { Box, Textarea, Typography } from '@mui/joy'

import { playersImportSx as sx } from './sx/playersImport.sx.js'

export default function PlayersBulkPasteInput({
  value = '',
  onChange,
  placeholder = '',
  minRows = 4,
}) {
  return (
    <Box sx={sx.inputRoot}>
      <Typography level="title-sm">
        הדבקת נתונים
      </Typography>

      <Textarea
        minRows={3}
        maxRows={3}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        sx={sx.pasteTextarea}
        slotProps={{
          textarea: {
            className: 'dpScrollThin',
          },
        }}
      />

      <Typography level="body-xs" sx={sx.mutedText}>
        ניתן להעתיק ישירות מאקסל או Google Sheets. השורה הראשונה חייבת להיות שורת כותרות.
      </Typography>
    </Box>
  )
}
