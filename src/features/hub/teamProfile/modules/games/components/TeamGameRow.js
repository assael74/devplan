// teamProfile/modules/games/components/TeamGameRow.js

import React from 'react'
import { Box, Divider, Tooltip, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import { rowSx as sx } from '../sx/teamGames.row.sx.js'
import {
  InfoTeamsSection,
  ResultGameSection,
  PlayerImpactSection,
  PlayerEntrySection,
} from './sections/TeamGamesSection.js'

export default function TeamGameRow({
  game,
  onEdit,
  onEditEntry
}) {
  const handleEdit = () => {
    if (onEdit) onEdit(game)
  }
  
  return (
    <Box sx={sx.rowCardSx}>
      <InfoTeamsSection game={game} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <ResultGameSection game={game} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <PlayerImpactSection game={game} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <PlayerEntrySection game={game} onEditEntry={onEditEntry} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <Box sx={sx.actionsCellSx}>
        <Tooltip title="עריכת נתוני משחק">
          <IconButton size="sm" variant="plain" onClick={handleEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
