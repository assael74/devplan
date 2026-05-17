// teamProfile/modules/players/components/insightsDrawer/TeamPlayersInsightsDrawer.js

import React from 'react'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { TeamPlayersInsightsContent } from '../../../../../sharedUi/insights/teamPlayers/index.js'

const c = getEntityColors('teams')

export default function TeamPlayersInsightsDrawer({
  open,
  onClose,
  rows,
  summary,
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
          subtitle="תובנות שחקני הקבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      <TeamPlayersInsightsContent
        rows={rows}
        summary={summary}
        team={liveTeam}
      />
    </InsightsDrawerShell>
  )
}
