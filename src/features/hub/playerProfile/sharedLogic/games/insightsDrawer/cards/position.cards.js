//  playerProfile/sharedLogic/games/insightsDrawer/cards/position.cards.js

import {
  formatNumber,
  formatPercent,
  normalizeJoyColor,
} from './cards.shared.js'

import {
  buildPositionTooltip,
} from '../tooltips/index.js'

const resolveGoalsAgainstColor = (value, target) => {
  const actual = Number(value)
  const limit = Number(target)

  if (!Number.isFinite(actual)) return 'neutral'

  if (Number.isFinite(limit) && limit > 0) {
    if (actual <= limit) return 'success'
    if (actual <= limit + 0.35) return 'warning'
    return 'danger'
  }

  if (actual <= 1) return 'success'
  if (actual <= 1.7) return 'warning'

  return 'danger'
}

const getLayerKey = (brief = {}) => {
  return brief?.metrics?.position?.layerKey || ''
}

const isDefensiveRole = (brief = {}) => {
  const layerKey = getLayerKey(brief)

  return (
    layerKey === 'dmMid' ||
    layerKey === 'defense' ||
    layerKey === 'goalkeeper'
  )
}

const getDefenseTargetSub = (value, fallback = 'לא הוגדר יעד ספיגה') => {
  const target = Number(value)

  if (!Number.isFinite(target) || target <= 0) {
    return fallback
  }

  return `יעד עד ${formatNumber(target, 2)} למשחק`
}

const getSeasonTargetSub = (value, fallback = 'לא הוגדר יעד עונתי') => {
  const target = Number(value)

  if (!Number.isFinite(target) || target <= 0) {
    return fallback
  }

  return `יעד עונתי ${formatNumber(target)}`
}

const withTooltip = ({ item, brief, targets, }) => {
  return {
    ...item,
    tooltip: buildPositionTooltip({
      id: item.id,
      brief,
      targets,
    }),
  }
}

const buildDefenseCards = ({ brief, targets, compact = false }) => {
  const metrics = brief?.metrics || {}
  const defenseTargets = targets?.explicitTargets?.defense || {}

  const goalsAgainstTarget =
    metrics.goalsAgainstPerGameTarget ||
    defenseTargets.goalsAgainstPerGameTarget

  const items = [
    {
      id: 'goalsAgainstPerGame',
      label: 'ספיגה למשחק',
      value: formatNumber(metrics.goalsAgainstPerGame, 2),
      sub: getDefenseTargetSub(goalsAgainstTarget),
      icon: 'defense',
      color: resolveGoalsAgainstColor(
        metrics.goalsAgainstPerGame,
        goalsAgainstTarget
      ),
    },
    {
      id: 'cleanSheetPct',
      label: 'רשת נקייה',
      value: formatPercent(metrics.cleanSheetPct),
      sub: `${formatNumber(metrics.cleanSheets)} משחקים`,
      icon: 'verified',
      color: 'neutral',
    },
  ]

  if (compact) return items

  return [
    ...items,
    {
      id: 'goalContributions',
      label: 'תרומה התקפית',
      value: formatNumber(metrics.goalContributions),
      sub: 'בונוס לעמדה, לא יעד מרכזי',
      icon: 'attack',
      color: 'neutral',
    },
  ]
}

const buildAttackCards = ({ brief, targets, }) => {
  const metrics = brief?.metrics || {}
  const attackTargets = targets?.explicitTargets?.attack || {}

  return [
    {
      id: 'goalContributions',
      label: 'מעורבות',
      value: formatNumber(metrics.goalContributions),
      sub: getSeasonTargetSub(attackTargets.goalContributionsTarget),
      icon: 'attack',
      color: normalizeJoyColor(brief?.tone),
    },
    {
      id: 'goals',
      label: 'שערים',
      value: formatNumber(metrics.goals),
      sub: getSeasonTargetSub(attackTargets.goalsTarget),
      icon: 'goal',
      color: 'neutral',
    },
    {
      id: 'assists',
      label: 'בישולים',
      value: formatNumber(metrics.assists),
      sub: getSeasonTargetSub(attackTargets.assistsTarget),
      icon: 'assist',
      color: 'neutral',
    },
  ]
}

export const buildPositionCards = ({ brief, targets = {}, mode = 'auto', compact = false, }) => {
  const resolvedMode =
    mode === 'auto'
      ? isDefensiveRole(brief)
        ? 'defense'
        : 'attack'
      : mode

  const items = resolvedMode === 'defense'
    ? buildDefenseCards({
        brief,
        targets,
        compact,
      })
    : buildAttackCards({
        brief,
        targets,
      })

  return items.map((item) => {
    return withTooltip({
      item,
      brief,
      targets,
    })
  })
}
