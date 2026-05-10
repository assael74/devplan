//  playerProfile/sharedLogic/games/insightsDrawer/cards/score.cards.js

import {
  formatNumber,
  normalizeJoyColor,
} from './cards.shared.js'

import {
  buildScoreTooltip,
} from '../tooltips/index.js'

const getTargetColor = ({ actual, target, fallback = 'neutral' }) => {
  const a = Number(actual)
  const t = Number(target)

  if (!Number.isFinite(a)) return fallback
  if (!Number.isFinite(t) || t <= 0) return fallback

  if (a >= t) return 'success'
  if (a >= t * 0.7) return 'warning'

  return 'danger'
}

const getPositionLayerKey = (brief) => {
  return brief?.metrics?.position?.layerKey || ''
}

const isDefensiveRole = (brief) => {
  const layerKey = getPositionLayerKey(brief)

  return (
    layerKey === 'dmMid' ||
    layerKey === 'defense' ||
    layerKey === 'goalkeeper'
  )
}

const getSeasonTargetSub = (value, fallback = 'לא הוגדר יעד עונתי') => {
  const target = Number(value)

  if (!Number.isFinite(target) || target <= 0) {
    return fallback
  }

  return `יעד עונתי ${formatNumber(target)}`
}

const withTooltip = ({ item, brief, targets, gamesData }) => {
  return {
    ...item,
    tooltip: buildScoreTooltip({
      id: item.id,
      brief,
      targets,
      gamesData
    }),
  }
}

export const buildScoreCards = ({ brief, positionBrief, targets = {}, gamesData = null }) => {
  const metrics = brief?.metrics || {}
  const isDefensive = isDefensiveRole(positionBrief)
  const attackTargets = targets?.explicitTargets?.attack || {}

  const goalsTarget = attackTargets.goalsTarget
  const assistsTarget = attackTargets.assistsTarget
  const contributionsTarget = attackTargets.goalContributionsTarget

  const items = [
    {
      id: 'goals',
      label: 'שערים',
      value: formatNumber(metrics.goals),
      sub: isDefensive
        ? 'יעד התקפי לא מרכזי לעמדה'
        : getSeasonTargetSub(goalsTarget),
      icon: 'goal',
      color: getTargetColor({
        actual: metrics.goals,
        target: goalsTarget,
      }),
    },
    {
      id: 'assists',
      label: 'בישולים',
      value: formatNumber(metrics.assists),
      sub: isDefensive
        ? 'יעד התקפי לא מרכזי לעמדה'
        : getSeasonTargetSub(assistsTarget),
      icon: 'assist',
      color: getTargetColor({
        actual: metrics.assists,
        target: assistsTarget,
      }),
    },
    {
      id: 'goalContributions',
      label: 'מעורבות',
      value: formatNumber(metrics.goalContributions),
      sub: isDefensive
        ? 'יעד התקפי לא מרכזי לעמדה'
        : getSeasonTargetSub(contributionsTarget),
      icon: 'attack',
      color: getTargetColor({
        actual: metrics.goalContributions,
        target: contributionsTarget,
        fallback: normalizeJoyColor(brief?.tone),
      }),
    },
  ]

  return items.map((item) => {
    return withTooltip({
      item,
      brief,
      targets,
      gamesData
    })
  })
}
