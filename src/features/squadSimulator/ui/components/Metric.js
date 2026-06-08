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

export default function Metric({ label, value, color = 'neutral', sub, children }) {
  return (
    <Sheet
      sx={{
        ...sx.metric,
        '--metric-accent': METRIC_ACCENTS[color] || METRIC_ACCENTS.neutral,
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      {value ? (
        <Typography level="h3" color={color}>
          {value}
        </Typography>
      ) : null}
      {sub ? (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {sub}
        </Typography>
      ) : null}
      {children}
    </Sheet>
  )
}
