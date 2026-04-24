// playerProfile/desktop/modules/games/components/insightsDrawer/playerGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
} from '../../../../../../../../ui/patterns/insights/index.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { InsightRowsList } from './InsightsRows.js'

import { buildPlayerGamesInsights } from '../../../../../../../../shared/games/insights/GamesInsights.build.js'
import { createGameRowNormalizer } from '../../../../../../../../shared/games/games.normalize.logic.js'
import { buildPlayerGamesDrawerViewModel } from '../../../../../sharedLogic'

export default function PlayerGamesInsightsDrawer({
  open,
  onClose,
  games,
  player,
}) {
  const normalizeRow = useMemo(() => createGameRowNormalizer({}), [])

  const insights = useMemo(() => {
    return buildPlayerGamesInsights({
      rows: Array.isArray(games) ? games : [],
      normalizeRow,
      player,
    })
  }, [games, player, normalizeRow])

  const viewModel = useMemo(() => {
    return buildPlayerGamesDrawerViewModel(insights)
  }, [insights])

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
      <InsightsSection title="מדדי על" icon="topParm">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {(viewModel?.topStats || []).map((item) => (
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
        <InsightRowsList
          items={viewModel?.cards || []}
          emptyText="אין כרטיסי תובנות להצגה"
        />
      </InsightsSection>

      <InsightsSection title="משחקי בית / חוץ" icon="home">
        <InsightRowsList
          items={viewModel?.homeAwayItems || []}
          emptyText="אין נתוני בית / חוץ להצגה"
        />
      </InsightsSection>

      <InsightsSection title="רמת קושי" icon="difficulty">
        <InsightRowsList
          items={viewModel?.difficultyItems || []}
          emptyText="אין נתוני רמת קושי להצגה"
        />
      </InsightsSection>

      <InsightsSection title="פיד תובנות" icon="feed">
        <InsightRowsList
          items={viewModel?.feedItems || []}
          emptyText="אין תובנות טקסטואליות להצגה"
        />
      </InsightsSection>
    </InsightsDrawerShell>
  )
}
