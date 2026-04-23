// teamProfile/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights/index.js'

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
  entity,
}) {
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
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={entity?.teamName || entity?.name || ''}
          subtitle="תובנות ממשחקי הקבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      <InsightsSection title="מדדי על" icon="topParm">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
          }}
        >
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
          emptyText="אין כרטיסי תובנות להצגה"
        />
      </InsightsSection>

      <InsightsSection title="משחקי בית / חוץ" icon="home">
        <InsightsChipsList
          items={Array.isArray(viewModel?.homeAwayItems) ? viewModel.homeAwayItems : []}
          iconFallback="home"
          emptyText="אין נתוני בית / חוץ להצגה"
        />
      </InsightsSection>

      <InsightsSection title="רמת קושי" icon="difficulty">
        <InsightsChipsList
          items={Array.isArray(viewModel?.difficultyItems) ? viewModel.difficultyItems : []}
          iconFallback="difficulty"
          emptyText="אין נתוני רמת קושי להצגה"
        />
      </InsightsSection>

      <InsightsSection title="פיד תובנות" icon="feed">
        <InsightsChipsList
          items={Array.isArray(viewModel?.feedItems) ? viewModel.feedItems : []}
          iconFallback="feed"
          emptyText="אין תובנות טקסטואליות להצגה"
        />
      </InsightsSection>
    </InsightsDrawerShell>
  )
}
