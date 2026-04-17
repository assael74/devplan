// teamProfile/modules/videos/components/insightsDrawer/InsightsRows.js

import React from 'react'
import { Box, Sheet, Typography, Divider, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { insightsRowsSx as sx } from './sx/teamVideos.insightsRows.sx.js'

const c = getEntityColors('videoAnalysis')

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function InsightRow({
  title,
  value,
  subValue = '',
  icon = 'insights',
  color = '',
  endText = '',
}) {
  return (
    <Sheet variant="soft" sx={sx.insightRow}>
      <Box sx={sx.insightIconWrap(color)}>
        {iconUi({ id: icon, size: 'sm' })}
      </Box>

      <Box sx={sx.insightTextWrap}>
        <Typography level="body-sm" sx={sx.insightTitle}>
          {title}
        </Typography>

        {subValue ? (
          <Typography level="body-xs" sx={sx.insightSub}>
            {subValue}
          </Typography>
        ) : null}
      </Box>

      <Divider orientation="vertical" />

      <Box sx={sx.insightEndWrap}>
        {endText ? (
          <Typography level="body-xs" sx={sx.insightEndText}>
            {endText}
          </Typography>
        ) : null}

        <Chip size="sm" variant="outlined" color="neutral" sx={sx.insightValue}>
          {value}
        </Chip>
      </Box>
    </Sheet>
  )
}

export function InsightRowsList({ items = [], emptyText = 'אין נתונים להצגה' }) {
  if (!items.length) {
    return <Typography level="body-sm" sx={{ opacity: 0.7 }}>{emptyText}</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {items.map((item) => (
        <InsightRow key={item.id} {...item} />
      ))}
    </Box>
  )
}

export function MonthlyActivityRow({
  monthLabel,
  totalVideos,
  analysisVideos,
  meetingVideos,
  hasActivity,
}) {
  return (
    <Sheet variant="soft" sx={sx.monthRow}>
      <Box sx={sx.monthLabelWrap}>
        <Box sx={sx.monthDot(hasActivity)} />

        <Typography level="body-sm" sx={{ fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', }}>
          {monthLabel}
        </Typography>
      </Box>

      <MetricMini title="סה״כ" value={toNum(totalVideos)} />
      <MetricMini title="ניתוחים" value={toNum(analysisVideos)} />
      <MetricMini title="מפגשים" value={toNum(meetingVideos)} />
    </Sheet>
  )
}

export function MonthlyActivityList({ items = [], emptyText = 'אין נתוני חודשים להצגה' }) {
  if (!items.length) {
    return <Typography level="body-sm" sx={{ opacity: 0.7 }}>{emptyText}</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {items.map((item) => (
        <MonthlyActivityRow key={item.monthKey} {...item} />
      ))}
    </Box>
  )
}

function MetricMini({ title, value }) {
  return (
    <Box sx={sx.metricMiniWrap}>
      <Typography level="body-xs" sx={{ opacity: 0.72, fontSize: 11 }}>
        {title}
      </Typography>

      <Typography level="body-sm" variant='outlined' sx={sx.metricMiniValue}>
        {value}
      </Typography>
    </Box>
  )
}
