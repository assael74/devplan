// C:\projects\devplan\src\ui\domains\staff\ui\StaffSummaryBar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

export default function StaffSummaryBar({ summary }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      <Chip size="sm" variant="soft">
        {`צוות: ${summary?.total ?? 0}`}
      </Chip>

      <Chip size="sm" variant="soft" color="success">
        {`יש קשר: ${summary?.withContact ?? 0}`}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={(summary?.missingContact ?? 0) ? 'warning' : 'neutral'}
      >
        {`חסרי קשר: ${summary?.missingContact ?? 0}`}
      </Chip>
    </Box>
  )
}
