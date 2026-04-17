// playerProfile/mobile/modules/games/components/gameCard/PlayerGameCardPlayerStats.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function PlayerGameCardPlayerStats({ game }) {
  const timePlayed = Number(game?.timePlayed || 0)
  const goals = Number(game?.goals || 0)
  const assists = Number(game?.assists || 0)
  const isStarter = !!game?.isStarting

  return (
    <Box sx={sx.playerStatsWrap}>
      <Chip
        size="sm"
        variant={isStarter ? 'solid' : 'soft'}
        color={isStarter ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: isStarter ? 'isStart' : 'isSquad', size: 'sm' })}
      >
        {isStarter ? 'הרכב' : 'ספסל'}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="primary"
        startDecorator={iconUi({ id: 'timePlayed', size: 'sm' })}
      >
        {timePlayed} דק׳
      </Chip>

      {goals > 0 ? (
        <Chip
          size="sm"
          variant="soft"
          color="success"
          startDecorator={iconUi({ id: 'goals', size: 'sm' })}
        >
          {goals} שערים
        </Chip>
      ) : null}

      {assists > 0 ? (
        <Chip
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({ id: 'assists', size: 'sm' })}
        >
          {assists} בישולים
        </Chip>
      ) : null}

      {goals === 0 && assists === 0 ? (
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={iconUi({ id: 'player', size: 'sm' })}
        >
          ללא תרומה
        </Chip>
      ) : null}
    </Box>
  )
}
