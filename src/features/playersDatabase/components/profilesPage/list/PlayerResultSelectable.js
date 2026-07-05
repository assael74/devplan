// features/playersDatabase/components/profilesPage/list/PlayerResultSelectable.js

import React from 'react'
import { Box, Checkbox } from '@mui/joy'

import PlayerResult from './PlayerResult.js'
import { playerSx as sx } from './sx/player.sx.js'

export default function PlayerResultSelectable({
  player,
  result,
  removingProfileId,
  selected,
  selectionMode,
  onToggleSelect,
  onEditLink,
  onRemoveProfile,
}) {
  if (!selectionMode) {
    return (
      <PlayerResult
        player={player}
        result={result}
        removingProfileId={removingProfileId}
        onEditLink={onEditLink}
        onRemoveProfile={onRemoveProfile}
      />
    )
  }

  return (
    <Box sx={sx.selectable}>
      <Checkbox
        size="sm"
        checked={selected}
        sx={sx.checkbox}
        onChange={() => onToggleSelect(player)}
      />

      <Box sx={sx.selectableContent}>
        <PlayerResult
          player={player}
          result={result}
          removingProfileId={removingProfileId}
          onEditLink={onEditLink}
          onRemoveProfile={onRemoveProfile}
        />
      </Box>
    </Box>
  )
}
