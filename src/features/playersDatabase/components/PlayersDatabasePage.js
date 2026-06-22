// src/features/playersDatabase/components/PlayersDatabasePage.js

import React from 'react'
import { Box } from '@mui/joy'

import { usePlayersDatabasePage } from '../hooks/usePlayersDatabasePage.js'

import Board from './leagues/board/Board.js'
import Hero from './hero/Hero.js'
import { pageSx as sx } from './page.sx.js'

export default function PlayersDatabasePage() {
  const model = usePlayersDatabasePage()

  return (
    <Box sx={sx.root}>
      <Hero kpis={model.kpis} actions={model.actions} />

      <Board />
    </Box>
  )
}
