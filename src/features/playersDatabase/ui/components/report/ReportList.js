// features/playersDatabase/ui/components/report/ReportList.js

import {
  Box,
  Sheet,
} from '@mui/joy'

import { reportListSx as sx } from './sx/reportList.sx.js'

export default function ReportList({ rows = [], renderRow, emptyText = 'אין נתונים להצגה.' }) {
  if (!rows.length) {
    return (
      <Sheet variant='plain' sx={sx.empty}>
        {emptyText}
      </Sheet>
    )
  }

  return (
    <Box sx={sx.list}>
      {rows.map((row, index) => renderRow(row, index))}
    </Box>
  )
}
