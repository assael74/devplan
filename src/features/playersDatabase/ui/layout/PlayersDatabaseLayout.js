// features/playersDatabase/ui/layout/PlayersDatabaseLayout.js

import * as React from 'react'
import { Box } from '@mui/joy'

import {
  PlayersDatabaseFavoritesProvider,
} from '../favorites/index.js'
import { pdbLayoutSx as sx } from './layout.sx.js'

export default function PlayersDatabaseLayout({ children }) {
  return (
    <PlayersDatabaseFavoritesProvider>
      <Box sx={sx.root}>
        <Box sx={sx.content}>
          {children}
        </Box>
      </Box>
    </PlayersDatabaseFavoritesProvider>
  )
}
