// C:\projects\devplan\src\ui\patterns\schedule\ScheduleWeekBlock.js
import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'
import { ScheduleRow } from './components/ScheduleRows.js'
import { scheduleWeekBlockSx as sx } from './sx/scheduleWeekBlock.sx.js'

export default function ScheduleWeekBlock({
  title,
  rows = [],
  count = null,
  mode = 'profile',
}) {
  const items = Array.isArray(rows) ? rows : []
  const safeCount = count == null ? items.filter((row) => !row?.isEmpty).length : count

  return (
    <Sheet variant="plain" sx={sx.weekBlock(mode)}>
      <Box sx={sx.weekHeader}>
        <Box sx={sx.weekTitleWrap}>
          <Box sx={sx.weekAccent} />

          <Typography
            level={mode === 'modal' ? 'title-sm' : 'title-md'}
            sx={{ fontWeight: 700 }}
            noWrap
          >
            {title}
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color="primary" sx={sx.countChip(mode)}>
          {safeCount}
        </Chip>
      </Box>

      <Box sx={sx.weekScroll(mode)} className="dpScrollThin">
        {items.length ? (
          <Box sx={sx.rows(mode)}>
            {items.map((row, index) => (
              <ScheduleRow
                key={row?.id || row?.dayKey || row?.dayLabel || `${title}-${index}`}
                row={row}
                mode={mode}
              />
            ))}
          </Box>
        ) : (
          <Box sx={sx.emptyWrap(mode)}>
            <Box sx={sx.empty}>
              <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                אין אימונים להצגה
              </Typography>

              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.25 }}>
                המערכת לא זיהתה ימים רלוונטיים לשבוע זה.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Sheet>
  )
}
