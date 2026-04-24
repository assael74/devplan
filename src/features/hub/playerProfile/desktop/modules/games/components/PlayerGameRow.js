// playerProfile/desktop/modules/games/components/PlayerGameRow.js

import React from 'react'
import { Box, Divider, Tooltip, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { rowSx as sx } from '../sx/row.sx.js'
import {
  InfoPlayerSection,
  ResultGameSection,
  PlayerImpactSection,
  PlayerEntrySection,
} from './sections/PlayerGamesSection.js'

export default function PlayerGameRow({
  game,
  onEdit,
  onEditEntry,
}) {
  //console.log(game)
  return (
    <Box sx={sx.rowCardSx}>
      <InfoPlayerSection game={game} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <ResultGameSection game={game} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <PlayerImpactSection game={game} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <PlayerEntrySection game={game} onEditEntry={onEditEntry} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <Box sx={sx.actionsCellSx}>
        <Tooltip title="עריכת נתוני משחק">
          <IconButton size="sm" variant="plain" onClick={() => onEditEntry(game)}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
