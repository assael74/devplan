// teamProfile/sharedLogic/games/insightsLogic/squad/squad.scorers.js

import { toNum } from '../common/index.js'

const roundPct = (count, total) => {
  const c = toNum(count)
  const t = toNum(total)

  if (!t) return 0
  return Math.round((c / t) * 100)
}

export const buildScorersMetrics = (scorers = []) => {
  const rows = Array.isArray(scorers) ? scorers : []

  const totalGoalsFromScorers = rows.reduce((sum, player) => {
    return sum + toNum(player?.goals)
  }, 0)

  const uniqueScorers = rows.length

  const oneGoalScorers = rows.filter((player) => {
    return toNum(player?.goals) === 1
  }).length

  const scorers3Plus = rows.filter((player) => {
    return toNum(player?.goals) >= 3
  }).length

  const scorers5Plus = rows.filter((player) => {
    return toNum(player?.goals) >= 5
  }).length

  const scorers10Plus = rows.filter((player) => {
    return toNum(player?.goals) >= 10
  }).length

  const topScorerGoals = toNum(rows?.[0]?.goals)

  const top3ScorersGoals = rows.slice(0, 3).reduce((sum, player) => {
    return sum + toNum(player?.goals)
  }, 0)

  return {
    hasData: totalGoalsFromScorers > 0 || uniqueScorers > 0,
    rows,
    totalGoalsFromScorers,
    uniqueScorers,
    oneGoalScorers,
    scorers3Plus,
    scorers5Plus,
    scorers10Plus,
    topScorer: rows?.[0] || null,
    top3Scorers: rows.slice(0, 3),
    topScorerGoals,
    top3ScorersGoals,
    topScorerDependencyPct: roundPct(topScorerGoals, totalGoalsFromScorers),
    top3DependencyPct: roundPct(top3ScorersGoals, totalGoalsFromScorers),
    oneGoalScorersPct: roundPct(oneGoalScorers, uniqueScorers),
  }
}
