import { VIDEO_INSIGHTS_DEFAULT_TAG_TYPE } from './videoInsights.constants.js'
import {
  buildSeasonMonths,
  buildSeasonMonthMap,
  isMonthInSeason,
  resolveVideoMonthKey,
} from './videoInsights.months.js'
import {
  buildTagsByIdObject,
  extractVideoTopicRelations,
  getVideoType,
  sortByTotalDescThenLabel,
  toPct,
} from './videoInsights.helpers.js'

const safeArr = (v) => (Array.isArray(v) ? v : [])

const buildActivityMonthRow = (base) => ({
  ...base,
  totalVideos: 0,
  analysisVideos: 0,
  meetingVideos: 0,
  hasActivity: false,
})

const buildCategoryBucket = (item) => ({
  id: item?.id || '',
  label: item?.label || 'קטגוריה',
  iconId: item?.iconId || '',
  color: item?.color || '',
  total: 0,
  analysis: 0,
  meeting: 0,
  months: new Set(),
})

const buildTopicBucket = (item) => ({
  id: item?.id || '',
  label: item?.label || 'נושא',
  parentId: item?.parentId || '',
  parentLabel: item?.parentLabel || '',
  iconId: item?.iconId || '',
  color: item?.color || '',
  total: 0,
  analysis: 0,
  meeting: 0,
  months: new Set(),
})

const ensureBucket = (map, key, builder) => {
  if (!key) return null
  if (!map.has(key)) map.set(key, builder())
  return map.get(key)
}

const finalizeCategoryRows = (map, totalVideos) =>
  Array.from(map.values())
    .map((row) => ({
      id: row.id,
      label: row.label,
      iconId: row.iconId,
      color: row.color,
      total: row.total,
      analysis: row.analysis,
      meeting: row.meeting,
      monthsCount: row.months.size,
      pct: toPct(row.total, totalVideos),
    }))
    .sort(sortByTotalDescThenLabel)

const finalizeTopicRows = (map, totalVideos) =>
  Array.from(map.values())
    .map((row) => ({
      id: row.id,
      label: row.label,
      parentId: row.parentId,
      parentLabel: row.parentLabel,
      iconId: row.iconId,
      color: row.color,
      total: row.total,
      analysis: row.analysis,
      meeting: row.meeting,
      monthsCount: row.months.size,
      pct: toPct(row.total, totalVideos),
    }))
    .sort(sortByTotalDescThenLabel)

const finalizeMonthlyEntityRows = (seasonMonths, monthMap, totalVideos, type) =>
  seasonMonths.map((month) => {
    const raw = monthMap.get(month.monthKey)
    const items = raw ? Array.from(raw.values()) : []

    const normalized = items
      .map((row) => ({
        ...(type === 'topic'
          ? {
              id: row.id,
              label: row.label,
              parentId: row.parentId || '',
              parentLabel: row.parentLabel || '',
            }
          : {
              id: row.id,
              label: row.label,
            }),
        iconId: row.iconId || '',
        color: row.color || '',
        total: row.total,
        analysis: row.analysis,
        meeting: row.meeting,
        pct: toPct(row.total, totalVideos),
      }))
      .sort(sortByTotalDescThenLabel)

    return {
      monthKey: month.monthKey,
      monthLabel: month.monthLabel,
      items: normalized,
      hasActivity: normalized.length > 0,
    }
  })

export const buildVideoInsights = ({
  videos = [],
  tags = [],
  seasonStartYear,
  tagType = VIDEO_INSIGHTS_DEFAULT_TAG_TYPE,
}) => {
  const tagsById = buildTagsByIdObject(tags)

  const derivedMonthKeys = safeArr(videos)
    .map((video) => resolveVideoMonthKey(video))
    .filter(Boolean)

  const uniqueDerivedMonthKeys = Array.from(new Set(derivedMonthKeys)).sort()

  const seasonMonths = seasonStartYear
    ? buildSeasonMonths(seasonStartYear)
    : uniqueDerivedMonthKeys.map((monthKey, index) => ({
        index,
        order: index + 1,
        monthKey,
        monthLabel: monthKey,
      }))

  const seasonMonthMap = new Map(seasonMonths.map((month) => [month.monthKey, month]))

  const activityRowsMap = new Map(
    seasonMonths.map((month) => [month.monthKey, buildActivityMonthRow(month)])
  )

  const globalCategoriesMap = new Map()
  const globalTopicsMap = new Map()

  const monthlyCategoriesMap = new Map(
    seasonMonths.map((month) => [month.monthKey, new Map()])
  )

  const monthlyTopicsMap = new Map(
    seasonMonths.map((month) => [month.monthKey, new Map()])
  )

  let totalVideos = 0
  let analysisVideos = 0
  let meetingVideos = 0
  let activeMonths = 0

  for (const video of safeArr(videos).filter(Boolean)) {
    const monthKey = resolveVideoMonthKey(video)
    if (!monthKey) continue

    if (seasonStartYear && !isMonthInSeason(monthKey, seasonStartYear)) continue

    const seasonMonth = seasonMonthMap.get(monthKey)
    if (!seasonMonth) continue

    const videoType = getVideoType(video)
    const activityRow = activityRowsMap.get(monthKey)
    if (!activityRow) continue

    totalVideos += 1
    if (videoType === 'meeting') meetingVideos += 1
    else analysisVideos += 1

    activityRow.totalVideos += 1
    activityRow[videoType === 'meeting' ? 'meetingVideos' : 'analysisVideos'] += 1
    activityRow.hasActivity = true

    const { categories, topics } = extractVideoTopicRelations({
      video,
      tagsById,
      tags,
      tagType,
    })

    const monthlyCategories = monthlyCategoriesMap.get(monthKey)
    const monthlyTopics = monthlyTopicsMap.get(monthKey)

    for (const category of categories) {
      const globalBucket = ensureBucket(globalCategoriesMap, category.id, () =>
        buildCategoryBucket(category)
      )

      if (globalBucket) {
        globalBucket.total += 1
        globalBucket[videoType] += 1
        globalBucket.months.add(monthKey)
      }

      const monthlyBucket = ensureBucket(monthlyCategories, category.id, () =>
        buildCategoryBucket(category)
      )

      if (monthlyBucket) {
        monthlyBucket.total += 1
        monthlyBucket[videoType] += 1
      }
    }

    for (const topic of topics) {
      const globalBucket = ensureBucket(globalTopicsMap, topic.id, () =>
        buildTopicBucket(topic)
      )

      if (globalBucket) {
        globalBucket.total += 1
        globalBucket[videoType] += 1
        globalBucket.months.add(monthKey)
      }

      const monthlyBucket = ensureBucket(monthlyTopics, topic.id, () =>
        buildTopicBucket(topic)
      )

      if (monthlyBucket) {
        monthlyBucket.total += 1
        monthlyBucket[videoType] += 1
      }
    }
  }

  const monthlyActivity = seasonMonths.map((month) => {
    const row = activityRowsMap.get(month.monthKey) || buildActivityMonthRow(month)
    return {
      monthKey: row.monthKey,
      monthLabel: row.monthLabel,
      totalVideos: row.totalVideos,
      analysisVideos: row.analysisVideos,
      meetingVideos: row.meetingVideos,
      hasActivity: row.hasActivity,
    }
  })

  activeMonths = monthlyActivity.filter((item) => item.hasActivity).length

  const topCategories = finalizeCategoryRows(globalCategoriesMap, totalVideos)
  const topTopics = finalizeTopicRows(globalTopicsMap, totalVideos)

  const monthlyTopCategories = finalizeMonthlyEntityRows(
    seasonMonths,
    monthlyCategoriesMap,
    totalVideos,
    'category'
  )

  const monthlyTopTopics = finalizeMonthlyEntityRows(
    seasonMonths,
    monthlyTopicsMap,
    totalVideos,
    'topic'
  )

  return {
    totals: {
      totalVideos,
      analysisVideos,
      meetingVideos,
      activeMonths,
      totalCategories: topCategories.length,
      totalTopics: topTopics.length,
    },

    pace: {
      seasonMonths: seasonMonths.length,
      avgVideosPerMonth: seasonMonths.length ? Number((totalVideos / seasonMonths.length).toFixed(1)) : 0,
      avgAnalysisPerMonth: seasonMonths.length ? Number((analysisVideos / seasonMonths.length).toFixed(1)) : 0,
      avgMeetingsPerMonth: seasonMonths.length ? Number((meetingVideos / seasonMonths.length).toFixed(1)) : 0,
      avgVideosPerActiveMonth: activeMonths ? Number((totalVideos / activeMonths).toFixed(1)) : 0,
    },

    topCategories,
    topTopics,
    monthlyActivity,
    monthlyTopCategories,
    monthlyTopTopics,
  }
}
