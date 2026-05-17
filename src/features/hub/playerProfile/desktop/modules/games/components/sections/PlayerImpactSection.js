import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { sectionsSx as sx } from '../../sx/sections.sx.js'
import {
  getGamePlayers,
  getScorers,
  getAssisters,
} from '../../../../../sharedLogic'

export function PlayerImpactSection({ game }) {
  const goals = Number(game?.goals || 0)
  const assists = Number(game?.assists || 0)
  const isNotZero = (num) => num > 0
  const colorG = isNotZero(goals) ? 'success' : 'neutral'
  const colorA = isNotZero(assists) ? 'primary' : 'neutral'
  const variant = (num) => isNotZero(num) ? 'soft' : 'outlined'
  const border = { border: '1px solid', borderColor: 'divider' }

  return (
    <Box sx={sx.impactCellSx}>
      <Chip size="md" color={colorG} variant={variant(goals)} startDecorator={iconUi({id: 'goals'})} sx={border}>
         שערים : {goals}
      </Chip>

      <Chip size="md" color={colorA} variant={variant(assists)} startDecorator={iconUi({id: 'assists'})} sx={border}>
         בישולים : {assists}
      </Chip>
    </Box>
  )
}
