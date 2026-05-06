// shared/games/insights/team/sections/squad/squad.metrics.js

import {
  calcPercent,
  hasNumber,
  pickNumber,
  toNumber,
} from '../../common/index.js'

function getMetricRow(source, id) {
  const rows = Array.isArray(source?.rows) ? source.rows : []

  return rows.find((row) => row?.id === id) || null
}

function pickMetricPct(source, id, fallback) {
  const row = getMetricRow(source, id)

  if (row && hasNumber(row.pct)) {
    return Number(row.pct)
  }

  return fallback
}

function pickMetricCountFromDisplay(source, id, fallback) {
  const row = getMetricRow(source, id)

  if (!row?.display) return fallback

  const match = String(row.display).match(/(\d+)\s*\/\s*(\d+)/)

  if (!match) return fallback

  return Number(match[1])
}

function pickMetricTotalFromDisplay(source, id, fallback) {
  const row = getMetricRow(source, id)

  if (!row?.display) return fallback

  const match = String(row.display).match(/(\d+)\s*\/\s*(\d+)/)

  if (!match) return fallback

  return Number(match[2])
}

export function buildSquadBaseMetrics(source) {
  const squadSize =
    pickNumber(source, ['activePlayersCount', 'squadCount', 'playersCount'], 0) ||
    pickMetricTotalFromDisplay(source, 'squadUsedPlayersRate', 0)

  const usedPlayers = pickMetricCountFromDisplay(
    source,
    'squadUsedPlayersRate',
    0
  )

  const scorers = pickMetricCountFromDisplay(source, 'squadScorersRate', 0)
  const assisters = pickMetricCountFromDisplay(source, 'squadAssistersRate', 0)

  const goalContributors = pickMetricCountFromDisplay(
    source,
    'squadGoalContributorsRate',
    0
  )

  const starters = pickMetricCountFromDisplay(source, 'squadStartersRate', 0)

  const attackingInvolvementPct = pickMetricPct(
    source,
    'squadGoalContributorsRate',
    0
  )

  const playerIntegrationPct = pickMetricPct(
    source,
    'squadUsedPlayersRate',
    0
  )

  const startersRate = pickMetricPct(source, 'squadStartersRate', 0)
  const lineupStabilityPct = Math.max(0, 100 - startersRate)
  const notUsedPlayers = Math.max(squadSize - usedPlayers, 0)

  return {
    squadSize,
    usedPlayers,
    scorers,
    assisters,
    goalContributors,
    starters,
    notUsedPlayers,
    attackingInvolvementPct,
    playerIntegrationPct,
    lineupStabilityPct,
  }
}

export function buildScorerRows(source) {
  const rows =
    source?.rows ||
    source?.items ||
    source?.players ||
    source?.scorersList ||
    []

  if (!Array.isArray(rows)) return []

  return rows
    .map((row) => {
      const goals = pickNumber(row, ['goals', 'value', 'count', 'total'], null)

      if (!hasNumber(goals)) return null

      return {
        id: row.id || row.playerId || row.name || row.label,
        name: row.name || row.playerName || row.label || 'שחקן',
        goals: Number(goals),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.goals - a.goals)
}

export function buildScorersMetrics(source) {
  const rows = buildScorerRows(source)

  const totalGoalsFromRows = rows.reduce((sum, row) => {
    return sum + toNumber(row.goals, 0)
  }, 0)

  const totalGoals =
    pickNumber(
      source,
      [
        'totalGoalsFromScorers',
        'scorersGoals',
        'goalsFromScorers',
        'totalGoals',
        'goalsFor',
      ],
      totalGoalsFromRows
    ) || totalGoalsFromRows

  const uniqueScorers =
    pickNumber(source, ['uniqueScorers', 'scorers', 'scorersCount'], rows.length) ||
    rows.length

  const oneGoalScorers = pickNumber(
    source,
    ['oneGoalScorers', 'oneGoalScorersCount'],
    rows.filter((row) => row.goals === 1).length
  )

  const scorers3Plus = pickNumber(
    source,
    ['scorers3Plus', 'threePlusScorers', 'scorersOver3'],
    rows.filter((row) => row.goals >= 3).length
  )

  const scorers5Plus = pickNumber(
    source,
    ['scorers5Plus', 'fivePlusScorers', 'scorersOver5'],
    rows.filter((row) => row.goals >= 5).length
  )

  const scorers10Plus = pickNumber(
    source,
    ['scorers10Plus', 'tenPlusScorers', 'scorersOver10'],
    rows.filter((row) => row.goals >= 10).length
  )

  const topScorerGoals = pickNumber(
    source,
    ['topScorerGoals', 'leaderGoals'],
    rows[0]?.goals || 0
  )

  const top3ScorersGoals = pickNumber(
    source,
    ['top3ScorersGoals', 'topThreeScorersGoals'],
    rows.slice(0, 3).reduce((sum, row) => sum + toNumber(row.goals, 0), 0)
  )

  const topScorerDependencyPct = pickNumber(
    source,
    ['topScorerDependencyPct', 'leaderDependencyPct'],
    calcPercent(topScorerGoals, totalGoals)
  )

  const top3DependencyPct = pickNumber(
    source,
    ['top3DependencyPct', 'topThreeDependencyPct'],
    calcPercent(top3ScorersGoals, totalGoals)
  )

  const oneGoalScorersPct = pickNumber(
    source,
    ['oneGoalScorersPct'],
    calcPercent(oneGoalScorers, uniqueScorers)
  )

  const hasScorersData =
    totalGoals > 0 ||
    uniqueScorers > 0 ||
    rows.length > 0 ||
    scorers3Plus > 0 ||
    scorers5Plus > 0 ||
    scorers10Plus > 0

  return {
    hasScorersData,
    rows,
    totalGoalsFromScorers: totalGoals,
    uniqueScorers,
    oneGoalScorers,
    scorers3Plus,
    scorers5Plus,
    scorers10Plus,
    topScorerGoals,
    top3ScorersGoals,
    topScorerDependencyPct,
    top3DependencyPct,
    oneGoalScorersPct,
  }
}
