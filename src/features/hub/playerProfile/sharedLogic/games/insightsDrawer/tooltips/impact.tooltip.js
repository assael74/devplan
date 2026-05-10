// playerProfile/sharedLogic/games/insightsDrawer/tooltip/impact.tooltip.js

import {
  numRow,
  pctRow,
  row,
  tooltip,
} from './tooltip.shared.js'

const getMetrics = (brief = {}) => {
  return brief?.metrics || {}
}

const getWith = (brief = {}) => {
  return getMetrics(brief).withPlayer || {}
}

const getWithout = (brief = {}) => {
  return getMetrics(brief).withoutPlayer || {}
}

const buildWithTooltip = (brief = {}) => {
  const data = getWith(brief)

  return tooltip({
    title: 'פירוט ביצועי קבוצה איתו',
    rows: [
      pctRow({
        id: 'actual',
        label: 'אחוז הצלחה',
        value: data.pointsRate,
      }),
      numRow({
        id: 'games',
        label: 'משחקים',
        value: data.games,
      }),
      numRow({
        id: 'points',
        label: 'נקודות',
        value: data.points,
      }),
      numRow({
        id: 'maxPoints',
        label: 'מקסימום',
        value: data.maxPoints,
      }),
      numRow({
        id: 'ppg',
        label: 'נקודות למשחק',
        value: data.pointsPerGame,
        digits: 2,
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'משחקי ליגה שבהם השחקן שותף',
      }),
    ],
  })
}

const buildWithoutTooltip = (brief = {}) => {
  const data = getWithout(brief)

  return tooltip({
    title: 'פירוט ביצועי קבוצה בלעדיו',
    rows: [
      pctRow({
        id: 'actual',
        label: 'אחוז הצלחה',
        value: data.pointsRate,
      }),
      numRow({
        id: 'games',
        label: 'משחקים',
        value: data.games,
      }),
      numRow({
        id: 'points',
        label: 'נקודות',
        value: data.points,
      }),
      numRow({
        id: 'maxPoints',
        label: 'מקסימום',
        value: data.maxPoints,
      }),
      numRow({
        id: 'ppg',
        label: 'נקודות למשחק',
        value: data.pointsPerGame,
        digits: 2,
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'משחקי ליגה שבהם השחקן לא שותף',
      }),
    ],
  })
}

const buildGapTooltip = (brief = {}) => {
  const metrics = getMetrics(brief)
  const withPlayer = getWith(brief)
  const withoutPlayer = getWithout(brief)

  return tooltip({
    title: 'פירוט פער השפעה קבוצתית',
    rows: [
      numRow({
        id: 'actual',
        label: 'פער נק׳ למשחק',
        value: metrics.pointsPerGameGap,
        digits: 2,
      }),
      pctRow({
        id: 'rateGap',
        label: 'פער אחוז הצלחה',
        value: metrics.pointsRateGap,
      }),
      numRow({
        id: 'withPpg',
        label: 'נק׳ למשחק איתו',
        value: withPlayer.pointsPerGame,
        digits: 2,
      }),
      numRow({
        id: 'withoutPpg',
        label: 'נק׳ למשחק בלעדיו',
        value: withoutPlayer.pointsPerGame,
        digits: 2,
      }),
      numRow({
        id: 'withGames',
        label: 'משחקים איתו',
        value: withPlayer.games,
      }),
      numRow({
        id: 'withoutGames',
        label: 'משחקים בלעדיו',
        value: withoutPlayer.games,
      }),
      row({
        id: 'basis',
        label: 'בסיס חישוב',
        value: 'נקודות למשחק איתו פחות נקודות למשחק בלעדיו',
      }),
    ],
  })
}

export const buildImpactTooltip = ({ id, brief }) => {
  if (id === 'withPlayerPointsRate') {
    return buildWithTooltip(brief)
  }

  if (id === 'withoutPlayerPointsRate') {
    return buildWithoutTooltip(brief)
  }

  if (id === 'pointsPerGameGap') {
    return buildGapTooltip(brief)
  }

  return null
}
