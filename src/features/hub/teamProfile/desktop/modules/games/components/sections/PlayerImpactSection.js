import React from 'react'
import { Box } from '@mui/joy'

import { teamGamesSectionsSx as sx } from '../../sx/teamGames.sections.sx.js'
import {
  getGamePlayers,
  getScorers,
  getAssisters,
} from './teamGames.section.utils.js'
import TeamPlayersStatRow from './TeamPlayersStatRow.js'

export function PlayerImpactSection({ game }) {
  const players = getGamePlayers(game)
  const scorers = getScorers(players)
  const assisters = getAssisters(players)

  return (
    <Box sx={sx.impactCellSx}>
      <TeamPlayersStatRow title="כובשים:" players={scorers} statKey="goals" />
      <TeamPlayersStatRow title="מבשלים:" players={assisters} statKey="assists" />
    </Box>
  )
}
