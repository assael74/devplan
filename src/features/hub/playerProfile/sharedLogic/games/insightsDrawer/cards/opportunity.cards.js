// playerProfile/sharedLogic/games/insightsDrawer/cards/opportunity.cards.js

import {
  formatNumber,
  formatPercent,
  normalizeJoyColor,
  resolvePctColor,
} from './cards.shared.js'

import {
  buildOpportunityTooltip,
} from '../tooltips/index.js'

const calcAvgMinutes = ({ avgMinutes, minutesPlayed, gamesIncluded }) => {
  const existing = Number(avgMinutes)

  if (Number.isFinite(existing) && existing > 0) {
    return existing
  }

  const minutes = Number(minutesPlayed)
  const games = Number(gamesIncluded)

  if (!Number.isFinite(minutes) || !Number.isFinite(games) || games <= 0) {
    return 0
  }

  return minutes / games
}

const getMetrics = (brief = {}) => {
  return brief?.metrics || {}
}

const pick = (source, keys = [], fallback = 0) => {
  for (const key of keys) {
    const value = source[key]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
}

const getUsage = (brief = {}) => {
  const metrics = getMetrics(brief)

  return metrics.usage || metrics
}

const getTone = (brief = {}) => {
  return normalizeJoyColor(brief?.tone)
}

const withTooltip = ({ item, brief, gamesData }) => {
  return {
    ...item,
    tooltip: buildOpportunityTooltip({
      id: item.id,
      brief,
      gamesData
    }),
  }
}

export const buildOpportunityCards = ({ brief, gamesData = null } = {}) => {
  const usage = getUsage(brief)
  const tone = getTone(brief)

  const minutesPct = pick(usage, ['minutesPct'])
  const startsPct = pick(usage, [
    'startsPctFromTeamGames',
    'startsPct',
  ])
  const gamesPct = pick(usage, ['gamesPct'])

  const minutesPlayed = pick(usage, ['minutesPlayed'])
  const minutesPossible = pick(usage, ['minutesPossible'])
  const starts = pick(usage, ['starts'])
  const teamGamesTotal = pick(usage, ['teamGamesTotal'])
  const gamesIncluded = pick(usage, ['gamesIncluded'])
  const rawAvgMinutes = pick(usage, ['avgMinutes'])
  const avgMinutes = calcAvgMinutes({
    avgMinutes: rawAvgMinutes,
    minutesPlayed,
    gamesIncluded,
  })

  const items = [
    {
      id: 'minutesPct',
      label: 'אחוז דקות',
      value: formatPercent(minutesPct),
      sub: `${formatNumber(minutesPlayed)} מתוך ${formatNumber(
        minutesPossible
      )} דקות`,
      icon: 'time',
      color: resolvePctColor(minutesPct),
    },
    {
      id: 'startsPct',
      label: 'פתח בהרכב',
      value: formatPercent(startsPct),
      sub: `${formatNumber(starts)} מתוך ${formatNumber(
        teamGamesTotal
      )} משחקים`,
      icon: 'isStart',
      color: resolvePctColor(startsPct),
    },
    {
      id: 'gamesPct',
      label: 'שותף במשחק',
      value: formatPercent(gamesPct),
      sub: `${formatNumber(gamesIncluded)} מתוך ${formatNumber(
        teamGamesTotal
      )} משחקים`,
      icon: 'games',
      color: resolvePctColor(gamesPct),
    },
    {
      id: 'avgMinutes',
      label: 'דקות למשחק',
      value: formatNumber(avgMinutes, 1),
      sub: 'במשחקים שבהם שותף',
      icon: 'gameStats',
      color: tone,
    },
  ]

  return items.map((item) => {
    return withTooltip({
      item,
      brief,
      gamesData
    })
  })
}
