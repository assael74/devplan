// shared/games/insights/games.insights.player.js

import { calcPlayerParticipationSummary } from '../games.player.logic.js'
import {
  buildGroupedInsights,
  buildRecentWindow,
  per90,
  pct,
  avg,
} from './games.insights.shared.js'

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export const buildPlayerParticipationInsights = ({ player, playedGames }) => {
  return calcPlayerParticipationSummary({
    player,
    rows: playedGames,
  })
}

export const buildPlayerScoringInsights = (playedGames) => {
  const base = Array.isArray(playedGames) ? playedGames : []

  const minutesPlayed = base.reduce((sum, row) => sum + n(row?.timePlayed), 0)
  const goals = base.reduce((sum, row) => sum + n(row?.goals), 0)
  const assists = base.reduce((sum, row) => sum + n(row?.assists), 0)
  const goalContribGames = base.filter((row) => n(row?.goals) > 0 || n(row?.assists) > 0).length

  return {
    minutesPlayed,
    goals,
    assists,
    goalContributions: goals + assists,
    goalsPer90: per90(goals, minutesPlayed),
    assistsPer90: per90(assists, minutesPlayed),
    contributionsPer90: per90(goals + assists, minutesPlayed),
    goalContribGames,
    goalContribGamesPct: pct(goalContribGames, base.length),
  }
}

export const buildPlayerStartingVsBenchInsights = (playedGames) => {
  const base = Array.isArray(playedGames) ? playedGames : []
  const starters = base.filter((row) => row?.isStarting === true)
  const bench = base.filter((row) => row?.isStarting !== true)

  const buildSplit = (rows) => {
    const minutes = rows.reduce((sum, row) => sum + n(row?.timePlayed), 0)
    const goals = rows.reduce((sum, row) => sum + n(row?.goals), 0)
    const assists = rows.reduce((sum, row) => sum + n(row?.assists), 0)

    return {
      total: rows.length,
      minutes,
      avgMinutes: avg(minutes, rows.length),
      goals,
      assists,
      goalContributions: goals + assists,
      contributionsPer90: per90(goals + assists, minutes),
    }
  }

  return {
    start: buildSplit(starters),
    bench: buildSplit(bench),
  }
}

export const buildPlayerVenueInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)
  return {
    byVenue: grouped.byVenue,
  }
}

export const buildPlayerTypeInsights = (playedGames) => {
  const grouped = buildGroupedInsights(playedGames)
  return {
    byType: grouped.byType,
    byDifficulty: grouped.byDifficulty,
  }
}

export const buildPlayerRecentInsights = (playedGames) => {
  const recent = buildRecentWindow(playedGames, 5)
  const rows = recent.rows || []

  const goals = rows.reduce((sum, row) => sum + n(row?.goals), 0)
  const assists = rows.reduce((sum, row) => sum + n(row?.assists), 0)
  const minutes = rows.reduce((sum, row) => sum + n(row?.timePlayed), 0)

  return {
    ...recent,
    goals,
    assists,
    minutes,
    goalContributions: goals + assists,
    contributionsPer90: per90(goals + assists, minutes),
  }
}

export const buildPlayerUiCards = ({ participation, scoring, recent }) => {
  return [
    {
      id: 'successPct',
      label: 'אחוז הצלחה',
      value: `${participation.contributedPointsPct}%`,
      subValue: `${participation.contributedPoints}/${participation.contributedPointsPossible} נק׳`,
      color:
        participation.contributedPointsPct >= 60
          ? 'success'
          : participation.contributedPointsPct >= 40
            ? 'warning'
            : 'danger',
    },
    {
      id: 'gamesInvolved',
      label: 'מעורבות משחקים',
      value: `${participation.gamesIncluded}/${participation.teamGamesTotal}`,
      subValue: `${participation.gamesPct}%`,
      color: participation.gamesPct >= 70 ? 'success' : participation.gamesPct >= 40 ? 'warning' : 'danger',
    },
    {
      id: 'minutesPct',
      label: 'אחוז דקות',
      value: `${participation.minutesPct}%`,
      subValue: `${participation.minutesPlayed}/${participation.minutesPossible} דק׳ קבוצה`,
      color: participation.minutesPct >= 70 ? 'success' : participation.minutesPct >= 40 ? 'warning' : 'danger',
    },
    {
      id: 'starts',
      label: 'פתיחות',
      value: participation.starts,
      subValue: `${participation.startsPctFromPlayed}% מהופעות`,
      color: 'primary',
    },
    {
      id: 'goalContrib',
      label: 'תרומה ישירה',
      value: scoring.goalContributions,
      subValue: `${scoring.goals} שערים · ${scoring.assists} בישולים`,
      color: 'neutral',
    },
    {
      id: 'per90',
      label: 'תרומה ל־90',
      value: scoring.contributionsPer90,
      subValue: `${scoring.goalsPer90} שערים · ${scoring.assistsPer90} בישולים`,
      color: 'neutral',
    },
    {
      id: 'recent',
      label: 'תרומה אחרונה',
      value: recent.goalContributions,
      subValue: `${recent.sampleSize} משחקים אחרונים`,
      color: recent.goalContributions > 0 ? 'success' : 'neutral',
    },
  ]
}
