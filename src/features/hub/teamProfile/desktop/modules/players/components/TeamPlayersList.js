// teamProfile/desktop/modules/players/components/TeamPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamPlayerRow from './TeamPlayerRow.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function TeamPlayersList({
  rows,
  loaded,
  viewMode,
  managementPrintMode,
  selectionMode = false,
  selectedPlayerIdsSet,
  onTogglePlayerSelection,
  onEditPlayer,
  onAvatarClick,
  onEditPosition,
}) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו שחקנים להצגה</Typography>

        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.list}>
      {rows.map(row => (
        <TeamPlayerRow
          key={row.id}
          row={row}
          loaded={loaded}
          viewMode={viewMode}
          managementPrintMode={managementPrintMode}
          selectionMode={selectionMode}
          selected={selectedPlayerIdsSet?.has(row.id)}
          onToggleSelection={onTogglePlayerSelection}
          onAvatarClick={onAvatarClick}
          onEditPlayer={onEditPlayer}
          onEditPosition={onEditPosition}
        />
      ))}
    </Box>
  )
}
