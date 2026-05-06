// shared/games/insights/team/sections/squad/squad.sources.js

export function resolveSquadSource(insights) {
  if (!insights) return null

  return (
    insights.squadMetrics ||
    insights.squad ||
    insights.games?.squadMetrics ||
    insights.active?.squadMetrics ||
    null
  )
}

export function resolveScorersSource(insights, squadSource) {
  if (!insights && !squadSource) return null

  return (
    insights?.scorersMetrics ||
    insights?.scorers ||
    insights?.games?.scorersMetrics ||
    insights?.games?.scorers ||
    insights?.active?.scorersMetrics ||
    insights?.active?.scorers ||
    squadSource?.scorersMetrics ||
    squadSource?.scorers ||
    squadSource?.scoringDistribution ||
    null
  )
}
