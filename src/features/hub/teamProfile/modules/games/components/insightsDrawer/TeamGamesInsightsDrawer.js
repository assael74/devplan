// teamProfile/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Box, Sheet, DialogContent } from '@mui/joy'

import { InsightRowsList } from './InsightsRows.js'
import { StatCard, SectionBlock, InsightsDrawerHeader } from './InsightsBlocks.js'

import { insightsDrawersSx as sx } from './sx/teamGames.insightsDrawer.sx.js'
import { buildTeamGamesInsights } from '../../../../../../../shared/games/insights/GamesInsights.build.js'
import { createGameRowNormalizer } from '../../../../../../../shared/games/games.normalize.logic.js'

const toCardValue = (v) => {
  if (v == null || v === '') return '—'
  return v
}

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

  const cards = Array.isArray(insights?.ui?.cards) ? insights.ui.cards : []
  const feed = Array.isArray(insights?.ui?.feed) ? insights.ui.feed : []

  const success = insights?.summary?.core?.success || {}
  const goals = insights?.summary?.core?.goals || {}
  const streaks = insights?.summary?.trends?.streaks || {}
  const grouped = insights?.summary?.grouped || {}

  const homeAwayItems = Array.isArray(grouped?.byVenue)
    ? grouped.byVenue.map((item) => ({
        id: item.id,
        title: item.label,
        value: `${item.points}/${item.total * 3}`,
        subValue: `${item.ppg} נק׳ למשחק`,
        icon: item.id === 'home' ? 'home' : 'away',
      }))
    : []

  const typeItems = Array.isArray(grouped?.byType)
    ? grouped.byType.map((item) => ({
        id: item.id,
        title: item.label,
        value: `${item.ppg}`,
        subValue: `${item.points} נק׳ · ${item.total} משחקים`,
        icon: 'game',
      }))
    : []

  const feedItems = feed.map((item) => ({
    id: item.id,
    title: item.label,
    value: item.color === 'success' ? 'חזק' : item.color === 'danger' ? 'חלש' : 'מידע',
    subValue: item.text,
    icon: 'insights',
  }))

  return (
    <Drawer
      size="lg"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <InsightsDrawerHeader entity={entity} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <SectionBlock title="מדדי על" icon="insights">
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                <StatCard
                  title="אחוז הצלחה"
                  value={`${toCardValue(success?.successPct)}%`}
                  sub={`${toCardValue(success?.points)}/${toCardValue(success?.maxPoints)} נק׳`}
                  icon="success"
                />

                <StatCard
                  title="נקודות למשחק"
                  value={toCardValue(success?.ppg)}
                  sub={`${toCardValue(success?.gamesPlayed)} משחקים`}
                  icon="points"
                />

                <StatCard
                  title="שערים"
                  value={`${toCardValue(goals?.gf)} - ${toCardValue(goals?.ga)}`}
                  sub={`הפרש ${toCardValue(goals?.gd)}`}
                  icon="result"
                />

                <StatCard
                  title="רצף נוכחי"
                  value={toCardValue(streaks?.currentStreakCount)}
                  sub={toCardValue(streaks?.currentStreakTypeH)}
                  icon="trend"
                />
              </Box>
            </SectionBlock>

            <SectionBlock title="כרטיסי תובנות" icon="cards">
              <InsightRowsList
                items={cards.map((item) => ({
                  id: item.id,
                  title: item.label,
                  value: item.value,
                  subValue: item.subValue,
                  icon: item.icon || 'insights',
                }))}
                emptyText="אין כרטיסי תובנות להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פיצול בית / חוץ" icon="home">
              <InsightRowsList
                items={homeAwayItems}
                emptyText="אין נתוני בית / חוץ להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פיצול לפי סוג משחק" icon="game">
              <InsightRowsList
                items={typeItems}
                emptyText="אין נתוני סוג משחק להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פיד תובנות" icon="feed">
              <InsightRowsList
                items={feedItems}
                emptyText="אין תובנות טקסטואליות להצגה"
              />
            </SectionBlock>
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
