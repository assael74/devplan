// playerProfile/desktop/modules/games/components/insightsDrawer/playerGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Box, Sheet, DialogContent } from '@mui/joy'

import { InsightRowsList } from './InsightsRows.js'
import { StatCard, SectionBlock, InsightsDrawerHeader } from './InsightsBlocks.js'
import { insightsDrawersSx as sx } from './sx/playerGames.insightsDrawer.sx.js'

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
  //console.log(insights)
  return (
    <Drawer
      size="md"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <InsightsDrawerHeader entity={player} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <SectionBlock title="מדדי על" icon="topParm">
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                {viewModel.topStats.map((item) => (
                  <StatCard
                    key={item.id}
                    title={item.title}
                    value={item.value}
                    sub={item.sub}
                    icon={item.icon}
                  />
                ))}
              </Box>
            </SectionBlock>

            <SectionBlock title="איכות הביצוע" icon="performance">
              <InsightRowsList
                items={viewModel.cards}
                emptyText="אין כרטיסי תובנות להצגה"
              />
            </SectionBlock>

            <SectionBlock title="משחקי בית / חוץ" icon="home">
              <InsightRowsList
                items={viewModel.homeAwayItems}
                emptyText="אין נתוני בית / חוץ להצגה"
              />
            </SectionBlock>

            <SectionBlock title="רמת קושי" icon="difficulty">
              <InsightRowsList
                items={viewModel.difficultyItems}
                emptyText="אין נתוני רמת קושי להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פיד תובנות" icon="feed">
              <InsightRowsList
                items={viewModel.feedItems}
                emptyText="אין תובנות טקסטואליות להצגה"
              />
            </SectionBlock>
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
