// playerProfile/sharedUi/insights/playerGames/sections/shared/SectionEmptyState.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

export default function SectionEmptyState({
  sx,
  title = 'אין מספיק נתונים',
  text = 'המידע יוצג לאחר חיבור המדדים.',
}) {
  return (
    <Sheet variant="soft" sx={sx?.emptyState}>
      <Typography level="title-sm" sx={sx?.emptyTitle}>
        {title}
      </Typography>

      <Typography level="body-xs" sx={sx?.emptyText}>
        {text}
      </Typography>
    </Sheet>
  )
}
