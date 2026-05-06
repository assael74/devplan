// teamProfile/sharedLogic/games/insightsLogic/cards/grouped.cards.js

import {
  toNum,
  toText,
  calcPointsPct,
  pointsColor,
  getDifficultyColor,
  resolveVenueIcon,
  resolveDifficultyBuckets,
} from './cards.shared.js'

export const buildHomeAwayInsightItems = (games) => {
  const grouped = games?.grouped || {}
  const byHomeOrAway = Array.isArray(grouped?.byHomeOrAway)
    ? grouped.byHomeOrAway
    : []

  return byHomeOrAway.map((item) => {
    const pct = toNum(item?.pointsPct || calcPointsPct(item?.points, item?.total))

    return {
      id: item?.id,
      title: item?.label,
      value: `${pct}%`,
      subValue: `${toNum(item?.points)}/${toNum(item?.total) * 3} נק׳ · ${toNum(item?.total)} משחקים`,
      icon: resolveVenueIcon(item?.id),
      color:
        item?.id === 'home'
          ? 'success'
          : item?.id === 'away'
            ? 'danger'
            : 'neutral',
      level: 'medium',
      chips: [
        {
          id: item?.id,
          label: item?.label || '',
          icon: resolveVenueIcon(item?.id),
          color:
            item?.id === 'home'
              ? 'success'
              : item?.id === 'away'
                ? 'danger'
                : 'neutral',
        },
      ],
    }
  })
}

export const buildDifficultyInsightItems = (games) => {
  const grouped = games?.grouped || {}
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
    level: 'medium',
  }))
}

const buildLeagueFeedFallbackItems = (league) => {
  if (!league?.isReady) return []

  const pointsRate = toNum(league?.pointsRate)
  const pointsPerGame = toText(league?.pointsPerGame, '0')
  const playedGames = toText(league?.playedGames, '0')
  const totalGames = toText(league?.totalGames, '0')

  const goalsFor = toText(league?.goalsFor, '0')
  const goalsAgainst = toText(league?.goalsAgainst, '0')
  const goalsForPerGame = toText(league?.goalsForPerGame, '0')
  const goalsAgainstPerGame = toText(league?.goalsAgainstPerGame, '0')
  const goalDifference = toNum(league?.goalDifference)

  const projectedTotalPoints = toText(league?.projectedTotalPoints, '0')
  const projectedGoalsFor = toText(league?.projectedGoalsFor, '0')
  const projectedGoalsAgainst = toText(league?.projectedGoalsAgainst, '0')

  return [
    {
      id: 'leaguePointsPace',
      title: 'קצב צבירת נקודות',
      value: `${pointsPerGame} נק׳ למשחק`,
      subValue: `${toText(league?.points, '0')}/${toText(league?.maxPoints, '0')} נק׳ · ${pointsRate}% הצלחה · ${playedGames}/${totalGames} משחקים`,
      icon: 'points',
      color: pointsColor(pointsRate),
      level: 'light',
    },
    {
      id: 'leagueGoalsProfile',
      title: 'פרופיל שערים',
      value: `${goalsFor} - ${goalsAgainst}`,
      subValue: `שערי זכות למשחק: ${goalsForPerGame} · שערי חובה למשחק: ${goalsAgainstPerGame}`,
      icon: 'result',
      color: goalDifference >= 0 ? 'success' : 'danger',
      level: 'light',
    },
    {
      id: 'leagueSeasonProjection',
      title: 'תחזית סוף עונה',
      value: `${projectedTotalPoints} נק׳`,
      subValue: `צפי שערים: ${projectedGoalsFor} - ${projectedGoalsAgainst}`,
      icon: 'projection',
      color: pointsColor(pointsRate),
      level: 'light',
    },
  ]
}

export const buildFeedInsightItems = (insights) => {
  const feed = Array.isArray(insights?.ui?.feed)
    ? insights.ui.feed
    : Array.isArray(insights?.feed)
      ? insights.feed
      : []

  if (feed.length > 0) {
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
      level: item?.level || 'medium',
    }))
  }

  const league = insights?.league || insights?.summary?.light || null

  return buildLeagueFeedFallbackItems(league)
}
