// features/playersDatabase/components/summary/SummaryPage.js

import React from 'react'
import { Box } from '@mui/joy'

import { usePlayersDatabasePage } from '../../hooks/usePlayersDatabasePage.js'
import { DatabaseHeader } from '../sharedUi/index.js'
import { pageSx as sx } from '../page.sx.js'
import SummaryBoard from './SummaryBoard.js'

export default function SummaryPage() {
  const model = usePlayersDatabasePage()

  return (
    <Box sx={sx.root}>
      <DatabaseHeader
        eyebrow="PLAYERS DATABASE"
        title="מאגר שחקנים חיצוני"
        kpis={model.kpis}
      />

      <SummaryBoard />
    </Box>
  )
}
