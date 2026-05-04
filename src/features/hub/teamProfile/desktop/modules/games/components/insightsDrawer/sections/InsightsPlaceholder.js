// teamProfile/modules/games/components/insightsDrawer/sections/InsightsPlaceholder.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { placeSx as sx } from './sx/place.sx.js'

export default function InsightsPlaceholder() {
  return (
    <Box sx={sx.placeholder}>
      <Typography level="title-sm" sx={sx.placeholderTitle}>
        אזור תובנות ראשוניות
      </Typography>

      <Typography level="body-sm" sx={sx.placeholderText}>
        כאן יוצגו בהמשך תובנות קצרות על תחזית הסיום, עמידה ביעדי נקודות,
        שערי זכות ושערי חובה.
      </Typography>
    </Box>
  )
}
