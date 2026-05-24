// playerProfile/sharedLogic/games/module/playerGames.trendPanel.logic.js

import {
  formatPlayerGameSigned,
  toPlayerGamePerfNumber,
} from './playerGames.performance.logic.js'

export const PLAYER_TREND_CHART_CONFIG = {
  height: 190,
  topPad: 18,
  bottomPad: 38,
  sidePad: 28,
  minWidth: 660,
  pointStep: 46,
}

const getChartX = ({ index, count, width }) => {
  const { sidePad } = PLAYER_TREND_CHART_CONFIG

  if (count <= 1) return sidePad

  return sidePad + ((width - sidePad * 2) * index) / (count - 1)
}

const getChartY = ({ value, min, max }) => {
  const { height, topPad, bottomPad } = PLAYER_TREND_CHART_CONFIG

  if (max === min) return height / 2

  const usable = height - topPad - bottomPad

  return topPad + ((max - value) / (max - min)) * usable
}

const getRivalLabel = point => {
  return (
    point?.rival ||
    point?.rivel ||
    'יריבה לא ידועה'
  )
}

const getRound = point => {
  return (
    point?.gameRound ||
    point?.gameLeagueNum ||
    point?.round ||
    ''
  )
}

const getPointTitle = point => {
  const rival = getRivalLabel(point)
  const round = getRound(point)
  const impact = formatPlayerGameSigned(point?.cumulativeImpact)

  return [
    rival,
    point?.gameDate || '',
    round ? `מחזור ${round}` : '',
    `השפעה מצטברת ${impact}`,
  ].filter(Boolean).join(' · ')
}

const shouldShowRoundLabel = ({ index, count }) => {
  return index === 0 || index === count - 1 || index % 5 === 0
}

const buildPath = ({ points }) => {
  return points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')
}

const buildTrendPoints = ({ points, width, min, max }) => {
  return points.map((point, index) => {
    const value = toPlayerGamePerfNumber(point?.cumulativeImpact, 0)
    const round = getRound(point) || index + 1

    return {
      key: `${point?.gameId || 'game'}_${index}`,

      x: getChartX({
        index,
        count: points.length,
        width,
      }),

      y: getChartY({
        value,
        min,
        max,
      }),

      value,
      round,
      title: getPointTitle(point),

      showRound: shouldShowRoundLabel({
        index,
        count: points.length,
      }),

      isPositive: value >= 0,
    }
  })
}

export const buildPlayerGameTrendPanelModel = model => {
  const points = Array.isArray(model?.points)
    ? model.points
    : []

  const rawValues = points.map(point => {
    return toPlayerGamePerfNumber(point?.cumulativeImpact, 0)
  })

  const minValue = Math.min(...rawValues, 0)
  const maxValue = Math.max(...rawValues, 0)

  const width = Math.max(
    PLAYER_TREND_CHART_CONFIG.minWidth,
    points.length * PLAYER_TREND_CHART_CONFIG.pointStep
  )

  const chartPoints = buildTrendPoints({
    points,
    width,
    min: minValue,
    max: maxValue,
  })

  const summary = model?.summary || {}

  return {
    entityName: model?.playerFullName || 'שחקן',

    summary: {
      ...summary,
      currentImpactText: formatPlayerGameSigned(summary.currentImpact),
    },

    width,
    height: PLAYER_TREND_CHART_CONFIG.height,
    sidePad: PLAYER_TREND_CHART_CONFIG.sidePad,

    zeroY: getChartY({
      value: 0,
      min: minValue,
      max: maxValue,
    }),

    path: buildPath({
      points: chartPoints,
    }),

    points: chartPoints,
  }
}
