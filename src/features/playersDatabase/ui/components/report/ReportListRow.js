// features/playersDatabase/ui/components/report/ReportListRow.js

import {
  Box,
  Sheet,
} from '@mui/joy'

import { reportListRowSx as sx } from './sx/reportListRow.sx.js'

export default function ReportListRow({
  identity,
  stats,
  third,
  fourth,
}) {
  return (
    <Sheet variant='plain' sx={sx.row}>
      <Box sx={sx.identityArea}>{identity}</Box>
      <Box sx={sx.statsArea}>{stats}</Box>
      <Box sx={sx.performanceArea}>{third}</Box>
      <Box sx={sx.performanceArea}>{fourth}</Box>
    </Sheet>
  )
}
