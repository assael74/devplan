import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'
import LabelIcon from '@mui/icons-material/Label'

export default function MeetingTagsPanel({ sx, selected }) {
  return (
    <Sheet sx={sx.panel} variant="outlined">
      <Box sx={sx.panelTitleRow}>
        <Typography level="title-sm" sx={sx.panelTitle}>תגיות</Typography>
      </Box>

      {Array.isArray(selected?.tags) && selected.tags.length ? (
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {selected.tags.map((t) => (
            <Chip key={String(t)} size="sm" variant="soft" startDecorator={<LabelIcon />}>
              {String(t)}
            </Chip>
          ))}
        </Box>
      ) : (
        <Typography level="body-sm" sx={{ opacity: 0.7 }}>
          אין תגיות למפגש.
        </Typography>
      )}
    </Sheet>
  )
}
