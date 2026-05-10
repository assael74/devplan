// teamProfile/mobile/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights'

import { TeamGamesInsightsContent } from '../../../../../sharedUi/insights/teamGames/index.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { buildTeamGamesInsights } from '../../../../../../../../shared/games/insights/team/index.js'
import { createGameRowNormalizer } from '../../../../../../../../shared/games/games.normalize.logic.js'

import { buildTeamGamesDrawerViewModel } from './../../../../../sharedLogic/games'

const c = getEntityColors('teams')

export default function TeamGamesInsightsDrawer({
  open,
  onClose,
  games,
  team,
  entity,
}) {
  const liveTeam = team || entity || {}

  const normalizeRow = useMemo(() => createGameRowNormalizer({}), [])

  const insights = useMemo(() => {
    return buildTeamGamesInsights({
      team: liveTeam,
      rows: Array.isArray(games) ? games : [],
      normalizeRow,
    })
  }, [games, liveTeam, normalizeRow])

  const viewModel = useMemo(() => {
    return buildTeamGamesDrawerViewModel(insights)
  }, [insights])

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
