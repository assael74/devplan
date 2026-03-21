import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerGamesSectionsSx as sx } from '../../sx/playerGames.sections.sx.js'
import {
  getGamePlayers,
  getScorers,
  getAssisters,
} from './playerGames.section.utils.js'

export function PlayerImpactSection({ game }) {
  const goals = Number(game?.goals || 0)
  const assists = Number(game?.assists || 0)

  return (
    <Box sx={sx.impactCellSx}>
      <Chip size="md" color="success" startDecorator={iconUi({id: 'goals'})}>
         שערים : {goals}
      </Chip>

      <Chip size="md" color="primary" startDecorator={iconUi({id: 'assists'})}>
         בישולים : {assists}
      </Chip>
    </Box>
  )
}
