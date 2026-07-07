// features/playersDatabase/components/profilesPage/preview/PreviewDataStage.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { buildMetricItems } from './logic/previewMetrics.logic.js'
import { buildScoutProfileItems } from './logic/previewScoutProfiles.logic.js'
import { dataSx as sx } from './sx/data.sx.js'

function MetricCube({ item }) {
  return (
    <Box sx={sx.metricCube(item.entity)}>
      <Box sx={sx.metricHeader}>
        {item.iconId ? (
          <Box sx={sx.metricIcon(item.entity)}>
            {iconUi({ id: item.iconId, size: 'sm' })}
          </Box>
        ) : null}

        <Typography sx={sx.metricLabel}>{item.label}</Typography>
      </Box>

      <Typography sx={sx.metricValue(item.entity)}>{item.value}</Typography>
    </Box>
  )
}

function MetricsPreview({ items }) {
  const firstRow = items.slice(0, 3)
  const secondRow = items.slice(3, 5)

  return (
    <Box sx={sx.metricsSection}>
      <Box sx={sx.metricsRowThree}>
        {firstRow.map(item => (
          <MetricCube key={item.id} item={item} />
        ))}
      </Box>

      <Box sx={sx.metricsRowTwo}>
        {secondRow.map(item => (
          <MetricCube key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  )
}

function ScoutProfileRow({ item }) {
  return (
    <Box sx={sx.scoutProfileRow}>
      <Box sx={sx.scoutProfileInfoCube}>
        <Box sx={sx.scoutProfileHeader}>
          {item.iconId ? (
            <Box sx={sx.scoutProfileIcon}>
              {iconUi({ id: item.iconId, size: 'sm' })}
            </Box>
          ) : null}

          <Typography sx={sx.scoutProfileLabel}>{item.label}</Typography>
        </Box>

        <Typography sx={sx.scoutProfileDescription}>
          {item.description || 'אין מידע נוסף להצגה'}
        </Typography>
      </Box>

      <Box sx={sx.scoutProfileCountCube}>
        <Typography sx={sx.scoutProfileCountValue}>{item.value}</Typography>
        <Typography sx={sx.scoutProfileCountLabel}>שחקנים</Typography>
      </Box>
    </Box>
  )
}

function ScoutProfilesPreview({ items }) {
  if (!items.length) return null

  return (
    <Box sx={sx.scoutProfilesSection}>
      {items.map(item => (
        <ScoutProfileRow key={item.id} item={item} />
      ))}
    </Box>
  )
}

export default function PreviewDataStage({ profileResult, metrics }) {
  const metricItems = buildMetricItems(metrics)
  const scoutProfileItems = buildScoutProfileItems({ profileResult })

  return (
    <Box sx={sx.stage}>
      <MetricsPreview items={metricItems} />
      <ScoutProfilesPreview items={scoutProfileItems} />
    </Box>
  )
}
