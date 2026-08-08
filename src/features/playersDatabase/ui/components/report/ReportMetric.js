// features/playersDatabase/ui/components/report/ReportMetric.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { reportMetricSx as sx } from './sx/reportMetric.sx.js'

export default function ReportMetric({ label, value, compact = false }) {
  return (
    <Box sx={sx.metric({ compact })}>
      <Typography component='span' sx={sx.metricLabel}>
        {label}
      </Typography>
      <Typography component='span' sx={sx.metricValue}>
        {value}
      </Typography>
    </Box>
  )
}
