// playerProfile/mobile/modules/videos/components/insightsDrawer/PlayerVideosInsightsDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Box, Sheet, DialogContent, Typography } from '@mui/joy'

import { InsightRowsList, MonthlyActivityList, } from './InsightsRows.js'
import { StatCard, SectionBlock, InsightsDrawerHeader, MonthlyInsightsList } from './InsightsBlocks.js'

import { insightsDrawersSx as sx } from './sx/playerVideos.insightsDrawer.sx.js'
import { buildPlayerVideosInsightsViewModel } from './../../../../../sharedLogic'

const safe = (v) => (v == null ? '' : String(v))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function PlayerVideosInsightsDrawer({
  open,
  onClose,
  videos,
  tags,
  entity,
  seasonStartYear,
}) {
  const vm = useMemo(() => {
    return buildPlayerVideosInsightsViewModel({
      videos,
      tags,
      seasonStartYear,
      tagType: 'analysis',
    })
  }, [videos, tags, seasonStartYear])

  const {
    totals,
    pace,
    monthlyActivity,
    topCategoryRows,
    topTopicRows,
    monthlyCategoryRows,
    monthlyTopicRows,
    title,
    totalVideosSubText,
    paceVideosSubText,
    isEmpty,
  } = vm

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
        <InsightsDrawerHeader entity={entity} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <SectionBlock title={title} icon="insights">
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, }}>
                <StatCard
                  title="סה״כ וידאו"
                  value={toNum(totals.totalVideos)}
                  sub={totalVideosSubText}
                  icon="videoAnalysis"
                />

                <StatCard
                  title="קצב וידאו נכון להיום"
                  value={toNum(pace.avgVideosPerActiveMonth)}
                  sub={paceVideosSubText}
                  icon="speed"
                />
              </Box>
            </SectionBlock>

            <SectionBlock title="קטגוריות ונושאים מובילים" icon="parents">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 700, mb: 0.7 }}>
                    קטגוריות מובילות
                  </Typography>

                  <InsightRowsList
                    items={topCategoryRows}
                    emptyText="אין קטגוריות ניתוח להצגה"
                  />
                </Box>

                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 700, mb: 0.7 }}>
                    נושאים מובילים
                  </Typography>

                  <InsightRowsList
                    items={topTopicRows}
                    emptyText="אין נושאי ניתוח להצגה"
                  />
                </Box>
              </Box>
            </SectionBlock>

            <SectionBlock title="פעילות לפי חודשים" icon="meetingDone">
              <MonthlyActivityList
                items={monthlyActivity}
                emptyText="אין נתוני חודשי פעילות להצגה"
              />
            </SectionBlock>

            <SectionBlock title="קטגוריות מובילות לפי חודש" icon="parents">
              <MonthlyInsightsList
                months={monthlyCategoryRows}
                emptyText="אין נתוני קטגוריות לפי חודשים"
              />
            </SectionBlock>

            <SectionBlock title="נושאים מובילים לפי חודש" icon="children">
              <MonthlyInsightsList
                months={monthlyTopicRows}
                emptyText="אין נתוני נושאים לפי חודשים"
              />
            </SectionBlock>

            {!toNum(totals.totalVideos) ? (
              <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                אין נתוני וידאו להצגה
              </Typography>
            ) : null}
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
