// features/insightsHub/overview/components/OverviewHeader.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { overviewSx as sx } from './sx/overview.sx'

export default function OverviewHeader() {
  return (
    <Sheet variant="plain" sx={sx.headerRoot}>
      <Box sx={sx.wrapHeader} />

      <Box sx={{ position: 'relative', display: 'grid', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={sx.secondIconWrap}>
            {iconUi({ id: 'insights', size: 'lg' })}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              level="h3"
              sx={{ fontWeight: 700, letterSpacing: '-0.03em', fontSize: 24 }}
            >
              מודל תובנות
            </Typography>

            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              איך המערכת הופכת דאטה יבש לתובנה מקצועית
            </Typography>
          </Box>
        </Box>

        <Typography level="body-sm" sx={sx.typoBody}>
          עמוד זה מרכז את שיטת העבודה של התובנות במערכת: קודם נאספות עובדות,
          אחר כך מחושבים מדדים, ורק לאחר מכן נוצרת תובנה עם משמעות מקצועית
          ורמת מהימנות.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          <Chip size="sm" variant="soft" color="neutral">
            Facts
          </Chip>
          <Chip size="sm" variant="soft" color="primary">
            Metrics
          </Chip>
          <Chip size="sm" variant="soft" color="success">
            Insights
          </Chip>
          <Chip size="sm" variant="soft" color="warning">
            Reliability
          </Chip>
        </Box>
      </Box>
    </Sheet>
  )
}
