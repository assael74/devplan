// teamProfile/desktop/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React from 'react'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights/index.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { TeamGamesInsightsContent } from '../../../../../sharedUi/insights/teamGames/index.js'

const c = getEntityColors('teams')

export default function TeamGamesInsightsDrawer({
  open,
  onClose,
  games,
  entity,
  team,
}) {
  const liveTeam = team || entity || {}

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity: liveTeam,
    parentEntity: liveTeam?.club,
    subline: liveTeam?.club?.name || liveTeam?.club?.clubName,
  })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={liveTeam?.teamName || liveTeam?.name || ''}
          subtitle="תובנות משחקי הקבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      <TeamGamesInsightsContent
        games={games}
        entity={entity}
        team={team}
      />
    </InsightsDrawerShell>
  )
}
