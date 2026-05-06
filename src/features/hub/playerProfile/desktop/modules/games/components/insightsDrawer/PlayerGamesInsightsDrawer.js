// playerProfile/desktop/modules/games/components/insightsDrawer/PlayerGamesInsightsDrawer.js

import React from 'react'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights/index.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import {
  PlayerGamesInsightsContent,
} from '../../../../../sharedUi/insights/playerGames/index.js'

const resolvePlayerGamesRows = ({
  games,
  player,
}) => {
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
  entity,
  team,
}) {
  const livePlayer = player || entity || {}
  const liveTeam = team || livePlayer?.team || {}

  const rows = resolvePlayerGamesRows({
    games,
    player: livePlayer,
  })

  const title =
    livePlayer?.playerFullName ||
    livePlayer?.fullName ||
    livePlayer?.name ||
    'שחקן'

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={title}
          subtitle="תובנות משחקי שחקן"
          avatarSrc={livePlayer?.photo || playerImage}
        />
      }
    >
      <PlayerGamesInsightsContent
        games={rows}
        player={livePlayer}
        team={liveTeam}
      />
    </InsightsDrawerShell>
  )
}
