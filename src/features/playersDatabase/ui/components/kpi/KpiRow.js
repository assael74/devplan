// src/features/playersDatabase/ui/components/kpi/KpiRow.js

import { Box } from '@mui/joy'

import { kpiRowSx as sx } from './sx/kpiRow.sx.js'

export default function KpiRow({ children, sx: externalSx }) {
  return (
    <Box sx={[sx.row, externalSx]}>
      {children}
    </Box>
  )
}
