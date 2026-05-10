//  playerProfile/sharedLogic/games/insightsDrawer/cards/impact.cards.js

import {
  formatNumber,
  formatPercent,
  toNum,
} from './cards.shared.js'

import {
  buildImpactTooltip,
} from '../tooltips/index.js'

const formatGap = (value, digits = 2) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'
  if (number > 0) return `+${formatNumber(number, digits)}`
  if (number < 0) return formatNumber(number, digits)

  return '0'
}

const getGapColor = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'neutral'
  if (number > 0) return 'success'
  if (number < 0) return 'warning'

  return 'neutral'
}

const withTooltip = ({ item, brief }) => {
  return {
    ...item,
    tooltip: buildImpactTooltip({
      id: item.id,
      brief,
    }),
  }
}

export const buildImpactCards = (brief = {}) => {
  const metrics = brief?.metrics || {}
  const withPlayer = metrics.withPlayer || {}
  const withoutPlayer = metrics.withoutPlayer || {}

  const items = [
    {
      id: 'withPlayerPointsRate',
      label: 'איתו',
      value: formatPercent(withPlayer.pointsRate),
      sub: `${formatNumber(withPlayer.points)}/${formatNumber(
        withPlayer.maxPoints
      )} נק׳`,
      icon: 'player',
      color: 'neutral',
    },
    {
      id: 'withoutPlayerPointsRate',
      label: 'בלעדיו',
      value: formatPercent(withoutPlayer.pointsRate),
      sub: `${formatNumber(withoutPlayer.points)}/${formatNumber(
        withoutPlayer.maxPoints
      )} נק׳`,
      icon: 'team',
      color: 'neutral',
    },
    {
      id: 'pointsPerGameGap',
      label: 'פער נק׳ למשחק',
      value: formatGap(metrics.pointsPerGameGap),
      sub: 'איתו מול בלעדיו',
      icon: 'trend',
      color: getGapColor(metrics.pointsPerGameGap),
    },
  ]

  return items.map((item) => {
    return withTooltip({
      item,
      brief,
    })
  })
}
