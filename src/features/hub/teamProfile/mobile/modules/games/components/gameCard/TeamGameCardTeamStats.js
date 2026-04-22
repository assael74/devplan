// teamProfile/mobile/modules/games/components/gameCard/TeamGameCardTeamStats.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

import {
  getGamePlayers,
  getSquadPlayers,
  getPlayedPlayers,
  getScorers,
  getAssisters,
} from '../../../../../sharedLogic'

export default function TeamGameCardTeamStats({ game }) {
  const players = getGamePlayers(game)
  const teamPlayers = Array.isArray(game?.team?.players) ? game.team.players : []

  const squad = getSquadPlayers(players)
  const played = getPlayedPlayers(players)
  const scorers = getScorers(players)
  const assisters = getAssisters(players)

  const totalTeam = teamPlayers.length

  return (
    <Box sx={sx.playerStatsWrap}>
      <Chip
        size="sm"
        variant="soft"
        color="primary"
        startDecorator={iconUi({ id: 'entry', size: 'sm' })}
      >
        סגל {squad.length} / {totalTeam}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="success"
        startDecorator={iconUi({ id: 'done', size: 'sm' })}
      >
        שותפו {played.length}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={scorers.length ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'goals', size: 'sm' })}
      >
        כובשים {scorers.length}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={assisters.length ? 'primary' : 'neutral'}
        startDecorator={iconUi({ id: 'assists', size: 'sm' })}
      >
        מבשלים {assisters.length}
      </Chip>
    </Box>
  )
}
