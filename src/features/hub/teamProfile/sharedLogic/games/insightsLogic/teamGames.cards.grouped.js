// teamProfile/sharedLogic/games/insightsLogic/teamGames.cards.grouped.js

import {
  toNum,
  calcPointsPct,
  getDifficultyColor,
  resolveVenueIcon,
  resolveDifficultyBuckets,
} from './teamGames.cards.shared.js'

export const buildHomeAwayInsightItems = (summary) => {
  const grouped = summary?.grouped || {}
  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway) ? grouped.byHomeOrAway : []

  return byHomeOrAway.map((item) => {
    const pct = toNum(item?.pointsPct || calcPointsPct(item?.points, item?.total))

    return {
      id: item?.id,
      title: item?.label,
      value: `${pct}%`,
      subValue: `${toNum(item?.points)}/${toNum(item?.total) * 3} נק׳ · ${toNum(item?.total)} משחקים`,
      icon: resolveVenueIcon(item?.id),
      color: item?.id === 'home' ? 'success' : item?.id === 'away' ? 'danger' : 'neutral',
      chips: [
        {
          id: item?.id,
          label: item?.label || '',
          icon: resolveVenueIcon(item?.id),
          color: item?.id === 'home' ? 'success' : item?.id === 'away' ? 'danger' : 'neutral',
        },
      ],
    }
  })
}

export const buildDifficultyInsightItems = (summary) => {
  const grouped = summary?.grouped || {}
  const buckets = resolveDifficultyBuckets(grouped)

  return buckets.map((item) => ({
    id: item.id,
    title: item.label,
    value: `${item.pointsPct}%`,
    subValue:
      item.total > 0
        ? `${item.points}/${item.total * 3} נק׳ · ${item.total} משחקים`
        : 'אין משחקים בקטגוריה זו',
    icon: item.idIcon || 'difficulty',
    color: getDifficultyColor(item.id),
  }))
}

export const buildFeedInsightItems = (insights) => {
  const feed = Array.isArray(insights?.ui?.feed) ? insights.ui.feed : []

  return feed.map((item) => ({
    id: item?.id,
    title: item?.label,
    value:
      item?.color === 'success'
        ? 'חזק'
        : item?.color === 'danger'
          ? 'חלש'
          : 'מידע',
    subValue: item?.text || '',
    icon: 'insights',
    color: item?.color || 'neutral',
  }))
}
