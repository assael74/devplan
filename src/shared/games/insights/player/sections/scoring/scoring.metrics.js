// shared/games/insights/player/sections/scoring/scoring.metrics.js

import {
  pickNumber,
} from '../../../team/common/index.js'

function getScoringSource(insights = {}) {
  return insights?.games?.scoring || insights?.summary?.scoring || insights?.scoring || null
}

function getTargets(insights = {}) {
  return insights?.targets || insights?.games?.targets || {}
}

export function buildPlayerScoringMetrics(insights = {}) {
  const source = getScoringSource(insights)
  const targets = getTargets(insights)

  const position = targets?.position || {}
  const positionTarget = targets?.positionTarget || {}
  const attackTargets = targets?.attack || {}

  const goals = pickNumber(source, ['goals'], 0)
  const assists = pickNumber(source, ['assists'], 0)
  const goalContributions = pickNumber(source, ['goalContributions'], goals + assists)

  const goalsPerGame = pickNumber(source, ['goalsPerGame'], 0)
  const assistsPerGame = pickNumber(source, ['assistsPerGame'], 0)
  const contributionsPerGame = pickNumber(source, ['contributionsPerGame'], 0)
  const minutesPlayed = pickNumber(source, ['minutesPlayed'], 0)

  const goalContribGames = pickNumber(source, ['goalContribGames'], 0)
  const goalContribGamesPct = pickNumber(source, ['goalContribGamesPct'], 0)

  const teamGoalsFor = pickNumber(source, ['teamGoalsFor'], 0)
  const teamGoalsSharePct = pickNumber(source, ['teamGoalsSharePct'], 0)

  return {
    source,

    position,
    positionTarget,
    attackTargets,

    goals,
    assists,
    goalContributions,

    goalsPerGame,
    assistsPerGame,
    contributionsPerGame,

    goalContribGames,
    goalContribGamesPct,

    teamGoalsFor,
    teamGoalsSharePct,
    minutesPlayed,

    goalsTarget: pickNumber(attackTargets, ['goalsTarget'], 0),
    assistsTarget: pickNumber(attackTargets, ['assistsTarget'], 0),
    goalContributionsTarget: pickNumber(attackTargets, ['goalContributionsTarget'], 0),
    teamGoalsShareTargetPct: pickNumber(attackTargets, ['teamGoalsShareTargetPct'], 0),

    hasPosition: Boolean(position?.layerKey),
    hasPositionTarget: Boolean(positionTarget?.id),
    hasAnyData:
      minutesPlayed > 0 ||
      goals > 0 ||
      assists > 0 ||
      goalContributions > 0 ||
      teamGoalsFor > 0,
    hasScoringData: goals > 0 || assists > 0 || goalContributions > 0,
    hasTeamGoalsContext: teamGoalsFor > 0,
    hasManualAttackTargets:
      pickNumber(attackTargets, ['goalsTarget'], 0) > 0 ||
      pickNumber(attackTargets, ['assistsTarget'], 0) > 0,
  }
}
