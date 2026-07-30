// features/playersDatabase/ui/components/tables/TableRankBadge.js

import { Box } from '@mui/joy'

import { tableRankBadgeSx as sx } from './sx/tableRankBadge.sx.js'

const resolveRankLabel = value => {
  const rank = Number(value)
  return Number.isFinite(rank) && rank > 0 ? rank : '-'
}

export default function TableRankBadge({ value }) {
  return (
    <Box sx={sx.root}>
      {resolveRankLabel(value)}
    </Box>
  )
}
