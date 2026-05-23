// teamProfile/sharedLogic/games/moduleLogic/teamGames.trendPanel.logic.js

import {
  formatGamePerfSigned,
  toGamePerfNumber,
} from './teamGames.performance.logic.js'

export const TREND_CHART_CONFIG = {
  height: 190,
  topPad: 18,
  bottomPad: 38,
  sidePad: 28,
  minWidth: 660,
  pointStep: 46,
}

const getGameObject = point => {
  return point?.game || {}
}

const getChartX = ({ index, count, width }) => {
  const { sidePad } = TREND_CHART_CONFIG

  if (count <= 1) return sidePad

  return sidePad + ((width - sidePad * 2) * index) / (count - 1)
}

const getChartY = ({ value, min, max }) => {
  const { height, topPad, bottomPad } = TREND_CHART_CONFIG

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

const getGameDate = point => {
  return point?.gameDate || ''
}

const getRound = point => {
  const game = getGameObject(point)

  return (
    point?.gameRound ||
    point?.gameLeagueNum ||
    point?.round ||
    game?.gameRound ||
    game?.gameLeagueNum ||
    ''
  )
}

const getHomeValue = point => {
  const game = getGameObject(point)

  return point?.home ?? game?.home
}

const getHomeAwayLabel = point => {
  const value = getHomeValue(point)

  if (value === true) return 'בית'
  if (value === false) return 'חוץ'

  return ''
}

const getCumulativeImpactLabel = point => {
  return formatGamePerfSigned(point?.cumulativeImpact)
}

const getPointTitle = point => {
  const rival = getRivalLabel(point)
  const date = getGameDate(point)
  const round = getRound(point)
  const homeAway = getHomeAwayLabel(point)
  const impact = getCumulativeImpactLabel(point)

  return [
    rival,
    date,
    round ? `מחזור ${round}` : '',
    homeAway,
    `השפעה מצטברת ${impact}`,
  ].filter(Boolean).join(' · ')
}

const shouldShowRoundLabel = ({ index, count }) => {
  return index === 0 || index === count - 1 || index % 5 === 0
}

const buildPath = ({ points, width, min, max }) => {
  return points.map((point, index) => {
    const x = getChartX({
      index,
      count: points.length,
      width,
    })

    const y = getChartY({
      value: point.value,
      min,
      max,
    })

    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

const buildTrendPoints = ({ points, width, min, max }) => {
  return points.map((point, index) => {
    const value = toGamePerfNumber(point?.cumulativeImpact, 0)
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

const buildTrendPanelModel = ({ model, entityName }) => {
  const points = Array.isArray(model?.points)
    ? model.points
    : []

  const rawValues = points.map(point => {
    return toGamePerfNumber(point?.cumulativeImpact, 0)
  })

  const minValue = Math.min(...rawValues, 0)
  const maxValue = Math.max(...rawValues, 0)

  const width = Math.max(
    TREND_CHART_CONFIG.minWidth,
    points.length * TREND_CHART_CONFIG.pointStep
  )

  const chartPoints = buildTrendPoints({
    points,
    width,
    min: minValue,
    max: maxValue,
  })

  const summary = model?.summary || {}

  return {
    entityName,
    playerName: entityName,
    summary: {
      ...summary,
      currentImpactText: formatGamePerfSigned(summary.currentImpact),
    },

    width,
    height: TREND_CHART_CONFIG.height,
    sidePad: TREND_CHART_CONFIG.sidePad,

    zeroY: getChartY({
      value: 0,
      min: minValue,
      max: maxValue,
    }),

    path: buildPath({
      points: chartPoints,
      width,
      min: minValue,
      max: maxValue,
    }),

    points: chartPoints,
  }
}

export const buildPlayerTrendPanelModel = model => {
  return buildTrendPanelModel({
    model,
    entityName: model?.playerFullName || 'שחקן',
  })
}

export const buildTeamTrendPanelModel = model => {
  return buildTrendPanelModel({
    model,
    entityName: model?.teamName || model?.name || 'קבוצה',
  })
}
