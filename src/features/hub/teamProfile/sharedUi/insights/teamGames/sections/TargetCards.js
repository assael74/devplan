// teamProfile/sharedUi/insights/teamGames/sections/TargetCards.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { targetSx as sx } from './sx/target.sx.js'

function resolveProjectedValue(item) {
  if (item?.projected !== undefined && item?.projected !== null) {
    return item.projected
  }

  return '—'
}

function resolveTargetValue(item) {
  if (item?.target !== undefined && item?.target !== null) {
    return item.target
  }

  if (item?.benchmark !== undefined && item?.benchmark !== null) {
    return item.benchmark
  }

  return '—'
}

function formatTargetValue(item) {
  return `${resolveProjectedValue(item)} / ${resolveTargetValue(item)}`
}

function TargetMetricCard({ item }) {
  return (
    <Sheet variant="soft" sx={sx.metricCard(item?.color || 'neutral')}>
      <Box sx={sx.metricTop}>
        <Typography level="body-sm" sx={sx.metricTitle}>
          {item.title}
        </Typography>

        <Box>
          {iconUi({
            id: item.icon || 'target',
            size: 'sm',
          })}
        </Box>
      </Box>

      <Box>
        <Typography level="h3" sx={sx.metricValue}>
          {item.progressPct}%
        </Typography>

        <Typography level="body-xs" sx={sx.metricSub}>
          {formatTargetValue(item)}
        </Typography>
      </Box>
    </Sheet>
  )
}

function EmptyTargetCard() {
  return (
    <Sheet variant="soft" sx={sx.metricCard('neutral')}>
      <Box sx={sx.metricTop}>
        <Typography level="body-sm" sx={sx.metricTitle}>
          לא הוגדרו יעדים
        </Typography>

        <Box>
          {iconUi({
            id: 'target',
            size: 'sm',
          })}
        </Box>
      </Box>

      <Box>
        <Typography level="h3" sx={sx.metricValue}>
          —
        </Typography>

        <Typography level="body-xs" sx={sx.metricSub}>
          כדי לחשב עמידה ביעד צריך להגדיר יעדי נקודות, שערי זכות או שערי חובה
        </Typography>
      </Box>
    </Sheet>
  )
}

export default function TargetCards({ rows = [] }) {
  const safeRows = Array.isArray(rows) ? rows : []

  return (
    <Box sx={sx.gridThree}>
      {safeRows.length > 0 ? (
        safeRows.map((item) => (
          <TargetMetricCard key={item.id} item={item} />
        ))
      ) : (
        <EmptyTargetCard />
      )}
    </Box>
  )
}
