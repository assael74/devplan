// shared/games/insights/games.insights.team.js

import {
  buildResultBreakdown,
  buildGoalsSummary,
  buildGroupedInsights,
  buildRecentWindow,
  buildStreaks,
} from './games.insights.shared.js'

export const buildTeamCoreInsights = (playedGames) => {
  return {
    result: buildResultBreakdown(playedGames),
    goals: buildGoalsSummary(playedGames),
  }
}

export const buildTeamVenueInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)
  return {
    byVenue: grouped.byVenue,
  }
}

export const buildTeamTypeInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)
  return {
    byType: grouped.byType,
  }
}

export const buildTeamDifficultyInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)
  return {
    byDifficulty: grouped.byDifficulty,
  }
}

export const buildTeamTrendInsights = (playedGames) => {
  return {
    recent: buildRecentWindow(playedGames, 5),
    streaks: buildStreaks(playedGames),
  }
}

export const buildTeamScheduleInsights = ({ upcomingGames = [], nextGame = null }) => {
  return {
    upcomingCount: Array.isArray(upcomingGames) ? upcomingGames.length : 0,
    nextGame,
  }
}

export const buildTeamUiCards = ({ recent, streaks, nextGame, byVenue, byType }) => {
  const home = byVenue.find((x) => x.id === 'home') || null
  const away = byVenue.find((x) => x.id === 'away') || null
  const bestType = [...byType].sort((a, b) => b.ppg - a.ppg)[0] || null

  return [
    {
      id: 'recentForm',
      label: 'כושר אחרון',
      value: `${recent.points}/${recent.maxPoints}`,
      subValue: `${recent.sampleSize} משחקים · ${recent.formText || '—'}`,
      color: recent.ppg >= 2 ? 'success' : recent.ppg >= 1 ? 'warning' : 'danger',
    },
    {
      id: 'currentStreak',
      label: 'רצף נוכחי',
      value: streaks.currentStreakCount || 0,
      subValue: streaks.currentStreakTypeH,
      color: streaks.currentStreakColor,
    },
    {
      id: 'homeAway',
      label: 'בית / חוץ',
      value: `${home?.ppg ?? 0} / ${away?.ppg ?? 0}`,
      subValue: 'נק׳ למשחק',
      color: 'primary',
    },
    {
      id: 'bestType',
      label: 'סוג משחק חזק',
      value: bestType?.label || '—',
      subValue: bestType ? `${bestType.points} נק׳ · ${bestType.ppg} למשחק` : 'אין נתונים',
      color: 'neutral',
    },
    {
      id: 'nextGame',
      label: 'המשחק הבא',
      value: nextGame?.rival || 'אין משחק עתידי',
      subValue: nextGame ? `${nextGame.dateH || nextGame.dateRaw || ''}` : '—',
      color: 'neutral',
    },
  ]
}
