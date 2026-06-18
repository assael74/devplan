// src/features/firestoreUsage/components/UsageKpis.js

import React from 'react'
import {
  Box,
  Card,
  Chip,
  Typography,
} from '@mui/joy'

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import UploadRoundedIcon from '@mui/icons-material/UploadRounded'

import { kpiSx as sx } from './sx/kpi.sx.js'
import { getUsageStatusColor } from '../sharedLogic/firestoreUsageThresholds.js'

const KPI_ICONS = {
  reads: VisibilityRoundedIcon,
  writes: EditRoundedIcon,
  logicalDeletes: DeleteSweepRoundedIcon,
  listenerUpdates: SyncRoundedIcon,
  estimatedReadKb: DownloadRoundedIcon,
  estimatedWriteKb: UploadRoundedIcon,
}

const KPI_COLORS = {
  reads: 'primary',
  writes: 'success',
  logicalDeletes: 'danger',
  listenerUpdates: 'warning',
  estimatedReadKb: 'neutral',
  estimatedWriteKb: 'neutral',
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const formatValue = item => {
  const value = Number(item?.value || 0)

  if (item?.format === 'kb') {
    return `${numberFormatter.format(value)} KB`
  }

  return numberFormatter.format(value)
}

function UsageKpiCard({ item }) {
  const Icon = KPI_ICONS[item.id] || VisibilityRoundedIcon

  const color = KPI_COLORS[item.id] || 'neutral'
  const statusColor = getUsageStatusColor(item.status)
  const statusLabel =
    item.status === 'danger'
      ? 'חריג'
      : item.status === 'warning'
        ? 'גבוה'
        : 'תקין'

  return (
    <Card variant="outlined" sx={sx.card(color)}>
      <Box sx={sx.cardContent}>
        <Box sx={sx.cardHeader}>
          <Typography level="body-xs" textColor="text.tertiary" fontWeight="lg">
            {item.label}
          </Typography>

          <Chip size="sm" variant="soft" color={color}>
            <Icon fontSize="small" />
          </Chip>
        </Box>

        <Box sx={sx.valueRow}>
          <Chip
            size="sm"
            variant="soft"
            color={statusColor}
            sx={sx.statusChip}
          >
            {statusLabel}
          </Chip>

          <Typography level="h2" sx={sx.value}>
            {formatValue(item)}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

export default function UsageKpis({ items = [] }) {
  return (
    <Box sx={sx.grid}>
      {items.map(item => (
        <UsageKpiCard
          key={item.id}
          item={item}
        />
      ))}
    </Box>
  )
}
