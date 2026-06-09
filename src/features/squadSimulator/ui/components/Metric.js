// features/squadSimulator/ui/components/Metric.js

import { Sheet, Typography } from '@mui/joy'

import { rosterSx as sx } from './sx/roster.sx.js'

const METRIC_ACCENTS = {
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#64748b',
}

export default function Metric({ label, value, color = 'neutral', sub, children, compact = false }) {
  return (
    <Sheet
      sx={{
        ...sx.metric,
        ...(compact ? sx.metricCompact : null),
        '--metric-accent': METRIC_ACCENTS[color] || METRIC_ACCENTS.neutral,
      }}
    >
      <Typography level="body-sm" sx={compact ? sx.metricLabelCompact : sx.metricLabel}>
        {label}
      </Typography>
      {value ? (
        <Typography level="h3" color={color} sx={compact ? sx.metricValueCompact : sx.metricValue}>
          {value}
        </Typography>
      ) : null}
      {sub ? (
        <Typography level="body-xs" sx={compact ? sx.metricSubCompact : sx.metricSub}>
          {sub}
        </Typography>
      ) : null}
      {children}
    </Sheet>
  )
}
