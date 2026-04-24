// playerProfile/mobile/modules/videos/components/insightsDrawer/PlayerVideosInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
} from '../../../../../../../../ui/patterns/insights/index.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { InsightRowsList, MonthlyActivityList } from './InsightsRows.js'
import { MonthlyInsightsList } from './InsightsBlocks.js'
import { buildPlayerVideosInsightsViewModel } from './../../../../../sharedLogic'

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
  } = vm

  const header = (
    <InsightsDrawerHeader
      title={entity?.playerFullName || 'שחקן'}
      subtitle="תובנות וידאו"
      avatarSrc={entity?.photo || playerImage}
    />
  )

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={header}
    >
      <InsightsSection title={title} icon="insights">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <InsightsStatCard
            title="סה״כ וידאו"
            value={toNum(totals?.totalVideos)}
            sub={totalVideosSubText}
            icon="videoAnalysis"
          />

          <InsightsStatCard
            title="קצב וידאו נכון להיום"
            value={toNum(pace?.avgVideosPerActiveMonth)}
            sub={paceVideosSubText}
            icon="speed"
          />
        </Box>
      </InsightsSection>

      <InsightsSection title="קטגוריות ונושאים מובילים" icon="parents">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box>
            <Typography level="body-sm" sx={{ fontWeight: 700, mb: 0.7 }}>
              קטגוריות מובילות
            </Typography>

            <InsightRowsList
              items={topCategoryRows || []}
              emptyText="אין קטגוריות ניתוח להצגה"
            />
          </Box>

          <Box>
            <Typography level="body-sm" sx={{ fontWeight: 700, mb: 0.7 }}>
              נושאים מובילים
            </Typography>

            <InsightRowsList
              items={topTopicRows || []}
              emptyText="אין נושאי ניתוח להצגה"
            />
          </Box>
        </Box>
      </InsightsSection>

      <InsightsSection title="פעילות לפי חודשים" icon="meetingDone">
        <MonthlyActivityList
          items={monthlyActivity || []}
          emptyText="אין נתוני חודשי פעילות להצגה"
        />
      </InsightsSection>

      <InsightsSection title="קטגוריות מובילות לפי חודש" icon="parents">
        <MonthlyInsightsList
          months={monthlyCategoryRows || []}
          emptyText="אין נתוני קטגוריות לפי חודשים"
        />
      </InsightsSection>

      <InsightsSection title="נושאים מובילים לפי חודש" icon="children">
        <MonthlyInsightsList
          months={monthlyTopicRows || []}
          emptyText="אין נתוני נושאים לפי חודשים"
        />
      </InsightsSection>

      {!toNum(totals?.totalVideos) ? (
        <Typography level="body-sm" sx={{ opacity: 0.7 }}>
          אין נתוני וידאו להצגה
        </Typography>
      ) : null}
    </InsightsDrawerShell>
  )
}
