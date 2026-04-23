// teamProfile/mobile/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { buildTeamGamesInsights } from '../../../../../../../../shared/games/insights/GamesInsights.build.js'
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
      rows: Array.isArray(games) ? games : [],
      normalizeRow,
    })
  }, [games, normalizeRow])

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
      <InsightsSection title="מדדי על" icon="topParm">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          {Array.isArray(viewModel?.topStats) &&
            viewModel.topStats.map((item) => (
              <InsightsStatCard
                key={item.id}
                title={item.title}
                value={item.value}
                sub={item.sub}
                icon={item.icon}
              />
            ))}
        </Box>
      </InsightsSection>

      <InsightsSection title="איכות הביצוע" icon="performance">
        <InsightsChipsList
          items={Array.isArray(viewModel?.cards) ? viewModel.cards : []}
          iconFallback="insights"
        />
      </InsightsSection>

      <InsightsSection title="משחקי בית / חוץ" icon="home">
        <InsightsChipsList
          items={Array.isArray(viewModel?.homeAwayItems) ? viewModel.homeAwayItems : []}
          iconFallback="home"
        />
      </InsightsSection>

      <InsightsSection title="רמת קושי" icon="difficulty">
        <InsightsChipsList
          items={Array.isArray(viewModel?.difficultyItems) ? viewModel.difficultyItems : []}
          iconFallback="difficulty"
        />
      </InsightsSection>

      <InsightsSection title="פיד תובנות" icon="feed">
        <InsightsChipsList
          items={Array.isArray(viewModel?.feedItems) ? viewModel.feedItems : []}
          iconFallback="feed"
        />
      </InsightsSection>
    </InsightsDrawerShell>
  )
}
