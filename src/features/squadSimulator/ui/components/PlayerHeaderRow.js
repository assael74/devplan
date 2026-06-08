// features/squadSimulator/ui/components/PlayerHeaderRow.js

import { Box } from '@mui/joy'

import { rosterSx as sx } from './sx/roster.sx.js'

export default function PlayerHeaderRow() {
  return (
    <Box sx={sx.playerHeaderRow}>
      <Box>שם שחקן</Box>
      <Box>מעמד</Box>
      <Box>ודאות</Box>
      <Box>עמדה</Box>
      <Box>חוליה</Box>
      <Box>מדרגה</Box>
      <Box>שערים</Box>
      <Box>דקות</Box>
      <Box />
    </Box>
  )
}
