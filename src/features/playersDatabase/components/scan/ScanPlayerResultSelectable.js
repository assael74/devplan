// src/features/playersDatabase/components/scan/ScanPlayerResultSelectable.js

import React from 'react'
import { Box, Checkbox } from '@mui/joy'

import ScanPlayerResult from './ScanPlayerResult.js'
import { scanPlayerSx as sx } from './sx/player.sx.js'

export default function ScanPlayerResultSelectable({ player, selected, selectionMode, onToggleSelect, onEditLink, onRemoveProfile }) {
  if (!selectionMode) return <ScanPlayerResult player={player} onEditLink={onEditLink} onRemoveProfile={onRemoveProfile} />

  return (
    <Box sx={sx.selectable}>
      <Checkbox size="sm" checked={selected} onChange={() => onToggleSelect?.(player)} sx={sx.checkbox} />
      <Box sx={sx.selectableContent}><ScanPlayerResult player={player} onEditLink={onEditLink} onRemoveProfile={onRemoveProfile} /></Box>
    </Box>
  )
}
