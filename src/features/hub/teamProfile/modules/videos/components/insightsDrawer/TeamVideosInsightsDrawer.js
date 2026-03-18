// teamProfile/modules/videos/components/insightsDrawer/TeamVideosInsightsDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Box, Sheet, DialogContent, Typography } from '@mui/joy'

import { InsightRowsList, MonthlyActivityList, } from './InsightsRows.js'
import { StatCard, SectionBlock, InsightsDrawerHeader, MonthlyInsightsList } from './InsightsBlocks.js'

import { insightsDrawersSx as sx } from './sx/teamVideos.insightsDrawer.sx.js'
import { buildVideoInsights } from '../../../../../../../shared/videoAnalysis/insights/videoInsights.build.js'

const safe = (v) => (v == null ? '' : String(v))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const buildTopCategoryRows = (items = []) =>
  items.map((item) => ({
    id: item.id,
    title: item.label || 'קטגוריה',
    value: toNum(item.total),
    subValue: `${toNum(item.pct)}% מסך הוידאו`,
    icon: 'parents',
    color: item.color || '',
    endText: item.monthsCount ? `${item.monthsCount} חו׳` : '',
  }))

const buildTopTopicRows = (items = []) =>
  items.map((item) => ({
    id: item.id,
    title: item.label || 'נושא',
    value: toNum(item.total),
    subValue: item.parentLabel
      ? `${item.parentLabel} · ${toNum(item.pct)}%`
      : `${toNum(item.pct)}% מסך הוידאו`,
    icon: 'children' || 'tag',
    color: item.color || '',
    endText: item.monthsCount ? `${item.monthsCount} חו׳` : '',
  }))

const buildMonthlyCategoryRows = (months = [], limit = 3) =>
  months.map((month) => ({
    monthKey: month.monthKey,
    monthLabel: month.monthLabel,
    emptyText: 'אין קטגוריות פעילות בחודש זה',
    items: (Array.isArray(month.items) ? month.items : []).slice(0, limit).map((item) => ({
      id: `${month.monthKey}-${item.id}`,
      title: item.label || 'קטגוריה',
      value: toNum(item.total),
      subValue:
        item.analysis || item.meeting
          ? `ניתוחים ${toNum(item.analysis)} · מפגשים ${toNum(item.meeting)}`
          : '',
      icon: 'parents' || 'layers',
      color: item.color || '',
      endText: item.pct ? `${toNum(item.pct)}%` : '',
    })),
  }))

const buildMonthlyTopicRows = (months = [], limit = 4) =>
  months.map((month) => ({
    monthKey: month.monthKey,
    monthLabel: month.monthLabel,
    emptyText: 'אין נושאים פעילים בחודש זה',
    items: (Array.isArray(month.items) ? month.items : []).slice(0, limit).map((item) => ({
      id: `${month.monthKey}-${item.id}`,
      title: item.label || 'נושא',
      value: toNum(item.total),
      subValue: item.parentLabel
        ? `${item.parentLabel} · ניתוחים ${toNum(item.analysis)} · מפגשים ${toNum(item.meeting)}`
        : `ניתוחים ${toNum(item.analysis)} · מפגשים ${toNum(item.meeting)}`,
      icon: 'children' || 'tag',
      color: item.color || '',
      endText: item.pct ? `${toNum(item.pct)}%` : '',
    })),
  }))

export default function TeamVideosInsightsDrawer({
  open,
  onClose,
  videos,
  tags,
  entity,
  seasonStartYear,
}) {
  const insights = useMemo(() => {
    return buildVideoInsights({
      videos,
      tags,
      seasonStartYear,
      tagType: 'analysis',
    })
  }, [videos, tags, seasonStartYear])

  const totals = insights?.totals || {}
  const pace = insights?.pace || {}
  const topCategories = insights?.topCategories || []
  const topTopics = insights?.topTopics || []
  const monthlyActivity = insights?.monthlyActivity || []
  const monthlyTopCategories = insights?.monthlyTopCategories || []
  const monthlyTopTopics = insights?.monthlyTopTopics || []

  const topCategoryRows = buildTopCategoryRows(topCategories)
  const topTopicRows = buildTopTopicRows(topTopics)
  const monthlyCategoryRows = buildMonthlyCategoryRows(monthlyTopCategories, 3)
  const monthlyTopicRows = buildMonthlyTopicRows(monthlyTopTopics, 4)

  const title = `תמונת מצב ל - ${toNum(totals.activeMonths)} חודשי פעילות`
  const totalVideosSubText = `ניתוחי וידאו ${toNum(totals.analysisVideos)} · מפגשי וידאו ${toNum(totals.meetingVideos)}`
  const paceVideosSubText = `ניתוחי וידאו ${toNum(pace.analysisVideos)} · מפגשי וידאו ${toNum(pace.avgVideosPerActiveMonth)}`

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
