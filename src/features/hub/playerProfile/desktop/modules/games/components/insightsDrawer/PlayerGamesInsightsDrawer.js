// playerProfile/desktop/modules/games/components/insightsDrawer/PlayerGamesInsightsDrawer.js

import React from 'react'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights/index.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import {
  PlayerGamesInsightsContent,
} from '../../../../../sharedUi/insights/playerGames/index.js'

const c = getEntityColors('players')

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
  entity,
  team,
  scoring,
  profileData
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
          colorSx={{ bgcolor: c.bg }}
          subtitle="תובנות משחקי שחקן"
          avatarSrc={livePlayer?.photo || playerImage}
        />
      }
    >
      <PlayerGamesInsightsContent
        games={rows}
        scoring={scoring}
        profileData={profileData}
        player={livePlayer}
        team={liveTeam}
      />
    </InsightsDrawerShell>
  )
}
