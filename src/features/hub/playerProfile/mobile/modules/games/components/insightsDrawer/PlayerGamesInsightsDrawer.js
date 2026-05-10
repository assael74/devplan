// playerProfile/desktop/modules/games/components/insightsDrawer/playerGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights/index.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import {
  PlayerGamesInsightsContent,
} from '../../../../../sharedUi/insights/playerGames/index.js'

const resolvePlayerGamesRows = ({ games, player }) => {
  if (Array.isArray(games)) return games
  if (Array.isArray(player?.playerGames)) return player.playerGames
  if (Array.isArray(player?.games)) return player.games

  return []
}

export default function PlayerGamesInsightsDrawer({
  open,
  onClose,
  games,
  player,
}) {
  const team = player?.team
  const rows = resolvePlayerGamesRows({
    games,
    player,
  })

  const header = (
    <InsightsDrawerHeader
      title={player?.playerFullName || 'שחקן'}
      subtitle="תובנות משחקים"
      avatarSrc={player?.photo || playerImage}
    />
  )

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={header}
    >
      <PlayerGamesInsightsContent
        games={rows}
        player={player}
        team={team}
      />
    </InsightsDrawerShell>
  )
}
