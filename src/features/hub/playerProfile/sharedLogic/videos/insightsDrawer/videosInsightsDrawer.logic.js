//

import { buildVideoInsights } from '../../../../../../shared/videoAnalysis/insights/videoInsights.build.js'

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const buildTopCategoryRows = (items = []) =>
  items.map((item) => ({
    id: item?.id || '',
    title: item?.label || 'קטגוריה',
    value: toNum(item?.total),
    subValue: `${toNum(item?.pct)}% מסך הוידאו`,
    icon: item?.iconId || 'parents',
    color: item?.color || '',
    endText: item?.monthsCount ? `${toNum(item.monthsCount)} חו׳` : '',
  }))

export const buildTopTopicRows = (items = []) =>
  items.map((item) => ({
    id: item?.id || '',
    title: item?.label || 'נושא',
    value: toNum(item?.total),
    subValue: item?.parentLabel
      ? `${item.parentLabel} · ${toNum(item?.pct)}%`
      : `${toNum(item?.pct)}% מסך הוידאו`,
    icon: item?.iconId || 'children',
    color: item?.color || '',
    endText: item?.monthsCount ? `${toNum(item.monthsCount)} חו׳` : '',
  }))

export const buildMonthlyCategoryRows = (months = [], limit = 3) =>
  months.map((month) => ({
    monthKey: month?.monthKey || '',
    monthLabel: month?.monthLabel || '',
    emptyText: 'אין קטגוריות פעילות בחודש זה',
    items: (Array.isArray(month?.items) ? month.items : [])
      .slice(0, limit)
      .map((item) => ({
        id: `${month?.monthKey || 'month'}-${item?.id || 'item'}`,
        title: item?.label || 'קטגוריה',
        value: toNum(item?.total),
        subValue:
          item?.analysis || item?.meeting
            ? `ניתוחים ${toNum(item?.analysis)} · מפגשים ${toNum(item?.meeting)}`
            : '',
        icon: item?.iconId || 'parents',
        color: item?.color || '',
        endText: item?.pct ? `${toNum(item.pct)}%` : '',
      })),
  }))

export const buildMonthlyTopicRows = (months = [], limit = 4) =>
  months.map((month) => ({
    monthKey: month?.monthKey || '',
    monthLabel: month?.monthLabel || '',
    emptyText: 'אין נושאים פעילים בחודש זה',
    items: (Array.isArray(month?.items) ? month.items : [])
      .slice(0, limit)
      .map((item) => ({
        id: `${month?.monthKey || 'month'}-${item?.id || 'item'}`,
        title: item?.label || 'נושא',
        value: toNum(item?.total),
        subValue: item?.parentLabel
          ? `${item.parentLabel} · ניתוחים ${toNum(item?.analysis)} · מפגשים ${toNum(item?.meeting)}`
          : `ניתוחים ${toNum(item?.analysis)} · מפגשים ${toNum(item?.meeting)}`,
        icon: item?.iconId || 'children',
        color: item?.color || '',
        endText: item?.pct ? `${toNum(item.pct)}%` : '',
      })),
  }))

export const buildPlayerVideosInsightsViewModel = ({
  videos = [],
  tags = [],
  seasonStartYear,
  tagType = 'analysis',
}) => {
  const insights = buildVideoInsights({
    videos,
    tags,
    seasonStartYear,
    tagType,
  })

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

  return {
    insights,

    totals,
    pace,

    topCategories,
    topTopics,
    monthlyActivity,
    monthlyTopCategories,
    monthlyTopTopics,

    topCategoryRows,
    topTopicRows,
    monthlyCategoryRows,
    monthlyTopicRows,

    title: `תמונת מצב ל - ${toNum(totals?.activeMonths)} חודשי פעילות`,
    totalVideosSubText: `ניתוחי וידאו ${toNum(totals?.analysisVideos)} · מפגשי וידאו ${toNum(totals?.meetingVideos)}`,
    paceVideosSubText: `ממוצע כללי ${toNum(pace?.avgVideosPerMonth)} · לחודש פעיל ${toNum(pace?.avgVideosPerActiveMonth)}`,
    isEmpty: !toNum(totals?.totalVideos),
  }
}
