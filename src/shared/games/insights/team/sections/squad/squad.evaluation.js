// shared/games/insights/team/sections/squad/squad.evaluation.js

import {
  evaluateHigherIsBetter,
  evaluateLowerIsBetter,
  evaluateRange,
} from '../../common/index.js'

import {
  getTeamGamesScorersTargetsByLevelId,
  getTeamGamesSquadUsageTargetsByLevelId,
} from '../../../../../teams/targets/index.js'

export function buildSquadUsageEvaluation(usage, performance) {
  const targets = getTeamGamesSquadUsageTargetsByLevelId(
    performance?.targetLevelId
  )

  if (!targets || !usage?.hasData) {
    return {
      hasTargets: Boolean(targets),
      targets,
      rows: [],
      summary: {
        greenCount: 0,
        redCount: 0,
        warningCount: 0,
        isStrong: false,
        isRisk: false,
      },
    }
  }

  const rows = [
    {
      id: 'players500Pct',
      group: 'integration',
      label: 'שחקני 500+ דקות',
      value: usage.players500Pct,
      count: usage.players500Count,
      target: targets.players500Pct,
      suffix: '%',
      evaluation: evaluateRange(usage.players500Pct, targets.players500Pct),
    },
    {
      id: 'players1000Pct',
      group: 'integration',
      label: 'שחקני 1000+ דקות',
      value: usage.players1000Pct,
      count: usage.players1000Count,
      target: targets.players1000Pct,
      suffix: '%',
      evaluation: evaluateRange(usage.players1000Pct, targets.players1000Pct),
    },
    {
      id: 'players1500Pct',
      group: 'lineup',
      label: 'שחקני 1500+ דקות',
      value: usage.players1500Pct,
      count: usage.players1500Count,
      target: targets.players1500Pct,
      suffix: '%',
      evaluation: evaluateRange(usage.players1500Pct, targets.players1500Pct),
    },
    {
      id: 'players2000Pct',
      group: 'lineup',
      label: 'שחקני 2000+ דקות',
      value: usage.players2000Pct,
      count: usage.players2000Count,
      target: targets.players2000Pct,
      suffix: '%',
      evaluation: evaluateRange(usage.players2000Pct, targets.players2000Pct),
    },
    {
      id: 'players20StartsPct',
      group: 'lineup',
      label: 'שחקני 20+ בהרכב פותח',
      value: usage.players20StartsPct,
      count: usage.players20StartsCount,
      target: targets.players20StartsPct,
      suffix: '%',
      evaluation: evaluateRange(
        usage.players20StartsPct,
        targets.players20StartsPct
      ),
    },
    {
      id: 'top14MinutesPct',
      group: 'lineup',
      label: 'ריכוזיות דקות',
      value: usage.top14MinutesPct,
      count: null,
      target: targets.top14MinutesPct,
      suffix: '%',
      evaluation: evaluateRange(usage.top14MinutesPct, targets.top14MinutesPct),
    },
  ]

  return buildEvaluationResult({ targets, rows })
}

export function buildScorersEvaluation(scorers, performance) {
  const targets = getTeamGamesScorersTargetsByLevelId(performance?.targetLevelId)

  if (!targets || !scorers?.hasScorersData) {
    return {
      hasTargets: Boolean(targets),
      targets,
      rows: [],
      summary: {
        greenCount: 0,
        redCount: 0,
        warningCount: 0,
        isStrong: false,
        isRisk: false,
      },
    }
  }

  const rows = [
    {
      id: 'uniqueScorers',
      label: 'כובשים שונים',
      value: scorers.uniqueScorers,
      target: targets.uniqueScorers,
      evaluation: evaluateHigherIsBetter(
        scorers.uniqueScorers,
        targets.uniqueScorers
      ),
    },
    {
      id: 'scorers3Plus',
      label: 'שחקנים עם 3+ שערים',
      value: scorers.scorers3Plus,
      target: targets.scorers3Plus,
      evaluation: evaluateHigherIsBetter(
        scorers.scorers3Plus,
        targets.scorers3Plus
      ),
    },
    {
      id: 'scorers5Plus',
      label: 'שחקנים עם 5+ שערים',
      value: scorers.scorers5Plus,
      target: targets.scorers5Plus,
      evaluation: evaluateHigherIsBetter(
        scorers.scorers5Plus,
        targets.scorers5Plus
      ),
    },
    {
      id: 'scorers10Plus',
      label: 'שחקנים עם 10+ שערים',
      value: scorers.scorers10Plus,
      target: targets.scorers10Plus,
      evaluation: evaluateHigherIsBetter(
        scorers.scorers10Plus,
        targets.scorers10Plus
      ),
    },
    {
      id: 'topScorerDependencyPct',
      label: 'תלות בכובש מוביל',
      value: scorers.topScorerDependencyPct,
      suffix: '%',
      target: targets.topScorerDependencyPct,
      evaluation: evaluateLowerIsBetter(
        scorers.topScorerDependencyPct,
        targets.topScorerDependencyPct
      ),
    },
    {
      id: 'top3DependencyPct',
      label: 'תלות טופ 3',
      value: scorers.top3DependencyPct,
      suffix: '%',
      target: targets.top3DependencyPct,
      evaluation: evaluateLowerIsBetter(
        scorers.top3DependencyPct,
        targets.top3DependencyPct
      ),
    },
    {
      id: 'oneGoalScorersPct',
      label: 'כובשים חד־פעמיים',
      value: scorers.oneGoalScorersPct,
      suffix: '%',
      target: targets.oneGoalScorersPct,
      evaluation: evaluateLowerIsBetter(
        scorers.oneGoalScorersPct,
        targets.oneGoalScorersPct
      ),
    },
  ]

  return buildEvaluationResult({ targets, rows })
}

function buildEvaluationResult({ targets, rows }) {
  const greenCount = rows.filter((row) => row.evaluation.isGreen).length
  const redCount = rows.filter((row) => row.evaluation.isRed).length
  const warningCount = rows.filter((row) => {
    return row.evaluation.isRed || row.evaluation.isWatch
  }).length

  return {
    hasTargets: true,
    targets,
    rows,
    summary: {
      greenCount,
      redCount,
      warningCount,
      isStrong: redCount === 0 && greenCount >= 4,
      isRisk: redCount >= 2,
    },
  }
}
