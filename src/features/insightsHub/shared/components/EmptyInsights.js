// features/insightsHub/shared/components/EmptyInsights.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { emptySx as sx } from './sx/empty.sx'

export default function EmptyInsights({
  title = 'תובנות',
  subtitle = 'כאן יוצגו בהמשך התובנות שנוצרות מתוך העובדות והמדדים.',
}) {
  return (
    <Box sx={sx.emptyRoot}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Chip size="sm" variant="soft" color="success">
          {title}
        </Chip>

        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          0 פריטים
        </Typography>
      </Box>

      <Box sx={sx.boxWrap}>
        <Box sx={sx.boxWrapText}>
          <Box sx={sx.boxWrapIcon}>
            {iconUi({ id: 'insights', size: 'md' })}
          </Box>

          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            אין תובנות להצגה כרגע
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.secondary', maxWidth: 260 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
