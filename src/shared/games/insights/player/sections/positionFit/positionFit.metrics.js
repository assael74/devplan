// shared/games/insights/player/sections/positionFit/positionFit.metrics.js

import {
  pickNumber,
} from '../../../team/common/index.js'

function getScoringSource(insights = {}) {
  return insights?.games?.scoring || insights?.summary?.scoring || {}
}

function getDefenseSource(insights = {}) {
  return insights?.games?.defense || insights?.summary?.defense || {}
}

function getUsageSource(insights = {}) {
  return insights?.games?.usage || insights?.summary?.usage || {}
}

export function buildPlayerPositionFitMetrics(insights = {}) {
  const targets = insights?.targets || insights?.games?.targets || {}

  const position = targets?.position || {}
  const positionTarget = targets?.positionTarget || {}

  const scoring = getScoringSource(insights)
  const defense = getDefenseSource(insights)
  const usage = getUsageSource(insights)

  return {
    position,
    positionTarget,

    minutesPct: pickNumber(usage, ['minutesPct'], 0),
    startsPctFromTeamGames: pickNumber(usage, ['startsPctFromTeamGames'], 0),

    goals: pickNumber(scoring, ['goals'], 0),
    assists: pickNumber(scoring, ['assists'], 0),
    goalContributions: pickNumber(scoring, ['goalContributions'], 0),

    goalsPerGame: pickNumber(scoring, ['goalsPerGame'], 0),
    assistsPerGame: pickNumber(scoring, ['assistsPerGame'], 0),
    contributionsPerGame: pickNumber(scoring, ['contributionsPerGame'], 0),
    teamGoalsSharePct: pickNumber(scoring, ['teamGoalsSharePct'], 0),

    goalsAgainst: pickNumber(defense, ['goalsAgainst'], 0),
    goalsAgainstPerGame: pickNumber(defense, ['goalsAgainstPerGame'], 0),
    cleanSheets: pickNumber(defense, ['cleanSheets'], 0),
    cleanSheetPct: pickNumber(defense, ['cleanSheetPct'], 0),

    goalsAgainstPerGameTarget: pickNumber(
      targets?.defense,
      ['goalsAgainstPerGameTarget'],
      0
    ),

    hasPosition: Boolean(position?.layerKey),
    hasPositionTarget: Boolean(positionTarget?.id),
    hasAnyData:
      pickNumber(usage, ['minutesPct'], 0) > 0 ||
      pickNumber(scoring, ['goalContributions'], 0) > 0 ||
      pickNumber(defense, ['goalsAgainst'], 0) > 0,
    isAttackRole:
      position?.layerKey === 'attack' ||
      position?.layerKey === 'atMidfield',
    isMiddleRole:
      position?.layerKey === 'midfield' ||
      position?.layerKey === 'dmMid',
    isDefensiveRole:
      position?.layerKey === 'defense' ||
      position?.layerKey === 'goalkeeper',
  }
}
