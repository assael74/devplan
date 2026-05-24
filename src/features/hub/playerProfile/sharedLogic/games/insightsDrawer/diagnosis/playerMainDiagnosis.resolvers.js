// playerProfile/sharedLogic/games/insightsDrawer/diagnosis/playerMainDiagnosis.resolvers.js

export const EMPTY = '—'

export const toNum = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const hasValue = value => {
  return value !== undefined && value !== null && value !== ''
}

export const getBrief = (insights, key) => {
  return insights?.briefs[key] || insights?.sections[key] || null
}

export const getPrimaryItem = brief => {
  const items = Array.isArray(brief?.items) ? brief.items : []

  return (
    items.find(item => item?.id === 'action_focus') ||
    items[0] ||
    null
  )
}

export const resolveRole = (insights = {}) => {
  const role =
    insights?.targets?.role ||
    insights?.games?.targets?.role ||
    {}

  return {
    id: role?.id || role?.value || '',
    label: role?.label || 'לא הוגדר מעמד',
    icon: role?.idIcon || role?.iconId || 'squad',
    color: role?.color || 'neutral',
    weight: toNum(role?.weight, 0),
    isDefined: Boolean(role?.id || role?.value),
  }
}

export const resolveUsage = (insights = {}) => {
  return (
    insights?.games?.usage ||
    insights?.summary?.usage ||
    {}
  )
}

export const resolveRoleTarget = (insights = {}) => {
  return (
    insights?.targets?.roleTarget ||
    insights?.games?.targets?.roleTarget ||
    {}
  )
}

export const resolveReliability = (insights = {}) => {
  return (
    insights?.reliability ||
    insights?.games?.reliability ||
    insights?.profileData?.playerInsight?.reliability ||
    insights?.profileData?.insightProfile?.reliability ||
    {}
  )
}

export const resolveScoring = (insights = {}) => {
  return (
    insights?.scoring ||
    insights?.games?.scoring ||
    insights?.profileData?.playerScoring ||
    insights?.profileData?.scoring?.player ||
    null
  )
}

export const resolveScoringSummary = (insights = {}) => {
  const scoring = resolveScoring(insights)

  return (
    scoring?.summary ||
    insights?.games?.scoringSummary ||
    {}
  )
}

export const resolveInsightModel = (insights = {}) => {
  return (
    insights?.playerInsight ||
    insights?.insightProfile ||
    insights?.profileData?.playerInsight ||
    insights?.profileData?.insightProfile ||
    null
  )
}

export const resolveInsightProfile = (insights = {}) => {
  const model = resolveInsightModel(insights)

  return (
    model?.profile ||
    model?.insight ||
    null
  )
}

export const pickScoringValue = ({ summary, games, insight, keys, fallback = null }) => {
  const list = Array.isArray(keys) ? keys : [keys]

  for (const key of list) {
    if (hasValue(insight?.[key])) return insight[key]
    if (hasValue(summary?.[key])) return summary[key]
    if (hasValue(games?.[key])) return games[key]
  }

  return fallback
}

export const resolvePerformance = (insights = {}) => {
  const games = insights?.games || {}
  const summary = resolveScoringSummary(insights)
  const insight = resolveInsightModel(insights)

  const rating = pickScoringValue({
    summary,
    games,
    insight,
    keys: ['ratingRaw', 'rating', 'avgRating'],
  })

  const impact = pickScoringValue({
    summary,
    games,
    insight,
    keys: ['tva', 'cumulativeImpact', 'totalImpact'],
  })

  const minutes = pickScoringValue({
    summary,
    games,
    insight,
    keys: ['minutes', 'totalMinutes'],
    fallback: games?.usage?.minutesPlayed,
  })

  const goals = pickScoringValue({
    summary,
    games,
    insight,
    keys: ['goals'],
    fallback: games?.scoring?.goals,
  })

  const assists = pickScoringValue({
    summary,
    games,
    insight,
    keys: ['assists'],
    fallback: games?.scoring?.assists,
  })

  const involvement = pickScoringValue({
    summary,
    games,
    insight,
    keys: ['involvement', 'goalContributions'],
    fallback: toNum(goals, 0) + toNum(assists, 0),
  })

  return {
    rating,
    impact,
    minutes,
    goals,
    assists,
    involvement,
  }
}
