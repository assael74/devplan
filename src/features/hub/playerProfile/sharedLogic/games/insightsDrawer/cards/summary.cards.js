// playerProfile/sharedLogic/games/insightsDrawer/cards/summary.cards.js

import {
  formatNumber,
  formatPercent,
  resolvePctColor,
  toNum,
} from './cards.shared.js'

import {
  formatLtr,
} from '../../../../../../../shared/format/index.js'

import {
  buildSummaryTooltip,
} from '../tooltips/index.js'

const hasValue = value => {
  return value !== undefined && value !== null && value !== ''
}

const formatSigned = (value, digits = 2) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'
  if (number > 0) return formatLtr(`+${formatNumber(number, digits)}`)
  if (number < 0) return formatLtr(formatNumber(number, digits))

  return formatLtr('0')
}

const resolveRatingColor = value => {
  const rating = Number(value)

  if (!Number.isFinite(rating)) return 'neutral'
  if (rating >= 6.25) return 'success'
  if (rating >= 6) return 'primary'
  if (rating >= 5.85) return 'warning'

  return 'danger'
}

const resolveImpactColor = value => {
  const impact = Number(value)

  if (!Number.isFinite(impact)) return 'neutral'
  if (impact > 0) return 'success'
  if (impact < 0) return 'danger'

  return 'neutral'
}

const withTooltip = ({ item, games, targets }) => {
  return {
    ...item,
    tooltip: buildSummaryTooltip({
      id: item.id,
      games,
      targets,
    }),
  }
}

const resolveScoringSummary = games => {
  return (
    games?.scoring?.summary ||
    games?.scoringSummary ||
    {}
  )
}

const resolveScoringValue = ({ summary, games, keys, fallback = null }) => {
  const list = Array.isArray(keys) ? keys : [keys]

  for (const key of list) {
    if (hasValue(summary?.[key])) return summary[key]
    if (hasValue(games?.[key])) return games[key]
  }

  return fallback
}

const buildScoringStats = ({ games, scoringSummary }) => {
  const rating = resolveScoringValue({
    summary: scoringSummary,
    games,
    keys: ['avgRating', 'rating', 'ratingRaw'],
  })

  const impact = resolveScoringValue({
    summary: scoringSummary,
    games,
    keys: ['tva', 'cumulativeImpact', 'totalImpact'],
  })

  const minutes = resolveScoringValue({
    summary: scoringSummary,
    games,
    keys: ['totalMinutes'],
    fallback: games?.usage?.minutesPlayed,
  })

  const goals = resolveScoringValue({
    summary: scoringSummary,
    games,
    keys: ['goals'],
    fallback: games?.scoring?.goals,
  })

  const assists = resolveScoringValue({
    summary: scoringSummary,
    games,
    keys: ['assists'],
    fallback: games?.scoring?.assists,
  })

  const involvement = resolveScoringValue({
    summary: scoringSummary,
    games,
    keys: ['involvement', 'goalContributions'],
    fallback: toNum(goals, 0) + toNum(assists, 0),
  })

  return {
    rating,
    impact,
    minutes,
    goals,
    assists,
    involvement,
  }
}

export const buildPlayerGamesTopStats = ({ games = {}, targets = {} } = {}) => {
  const usage = games?.usage || {}
  const scoring = games?.scoring || {}
  const defense = games?.defense || {}
  const reliability = games?.reliability || {}

  const role = targets?.role || {}
  const position = targets?.position || {}

  const scoringSummary = resolveScoringSummary(games)

  const {
    rating,
    impact,
    minutes,
    goals,
    assists,
    involvement,
  } = buildScoringStats({
    games,
    scoringSummary,
  })

  const items = [
    {
      id: 'efficiencyRating',
      title: 'מדד יעילות',
      value: formatNumber(rating, 2),
      sub: 'ממוצע משחקים מדורגים',
      icon: 'scoringRating',
      color: resolveRatingColor(rating),
      level: 'high',
    },
    {
      id: 'tva',
      title: 'מדד השפעה',
      value: formatSigned(impact, 2),
      sub: 'השפעה מצטברת',
      icon: 'scoringImpact',
      color: resolveImpactColor(impact),
      level: 'high',
    },
    {
      id: 'minutes',
      title: 'דקות',
      value: formatNumber(minutes),
      sub: `${formatPercent(usage?.minutesPct)} מסך דקות הקבוצה`,
      icon: 'time',
      color: resolvePctColor(usage?.minutesPct),
      level: 'medium',
    },
    {
      id: 'goalContributions',
      title: 'מעורבות שערים',
      value: formatNumber(involvement),
      sub: `${formatNumber(goals)} שערים · ${formatNumber(assists)} בישולים`,
      icon: 'goals',
      color: toNum(involvement) > 0 ? 'success' : 'neutral',
      level: 'medium',
    },
    {
      id: 'starts',
      title: 'הרכב',
      value: formatPercent(usage?.startsPctFromTeamGames),
      sub: `${formatNumber(usage?.starts)} הרכב מתוך ${formatNumber(
        usage?.teamGamesTotal
      )} משחקים`,
      icon: 'isStart',
      color: resolvePctColor(usage?.startsPctFromTeamGames),
      level: 'medium',
    },
    {
      id: 'contributionsPerGame',
      title: 'מעורבות למשחק',
      value: formatNumber(scoring?.contributionsPerGame, 2),
      sub: `לפי ${formatNumber(games?.leagueGameTime || 90)} דקות משחק`,
      icon: 'gameStats',
      color: toNum(scoring?.contributionsPerGame) >= 0.45
        ? 'success'
        : toNum(scoring?.contributionsPerGame) > 0
          ? 'warning'
          : 'neutral',
      level: 'medium',
    },
    {
      id: 'role',
      title: 'מעמד בסגל',
      value: role?.label || 'לא הוגדר',
      sub: position?.layerLabel || 'עמדה לא הוגדרה',
      icon: role?.idIcon || 'teams',
      color: role?.id ? 'primary' : 'neutral',
      level: 'light',
    },
    {
      id: 'reliability',
      title: 'אמינות',
      value: reliability?.label || 'לא ידוע',
      sub: reliability?.caution ? 'יש לפרש בזהירות' : 'מדגם תקין',
      icon: reliability?.caution ? 'info' : 'verified',
      color: reliability?.tone || 'neutral',
      level: 'medium',
    },
    {
      id: 'goalsAgainst',
      title: 'ספיגה איתו',
      value: formatNumber(defense?.goalsAgainstPerGame, 2),
      sub: `${formatNumber(defense?.goalsAgainst)} שערי חובה בזמן ששיחק`,
      icon: 'defense',
      color: 'neutral',
      level: 'medium',
    },
  ]

  return items.map((item) => {
    return withTooltip({
      item,
      games,
      targets,
    })
  })
}
