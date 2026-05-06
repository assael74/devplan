// shared/games/insights/team/targets/teamTargetProfiles.js

export const TEAM_GAMES_TARGET_GROUPS = {
  FORECAST: 'forecast',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
  SCORERS: 'scorers',
  SQUAD_USAGE: 'squadUsage',
}

export const TEAM_GAMES_TARGET_PROFILES = [
  {
    id: 'bottom',
    label: 'תחתון',
    shortLabel: 'תחתון',
    rankLabel: 'אזור תחתון',
    rankRange: [14, 17],
    pointsRange: { min: 0, max: 30 },
    color: 'danger',

    targets: {
      forecast: {
        points: 18,
        pointsRate: 20,
        goalDifference: -59,
        goalsFor: 33,
        goalsAgainst: 92,
      },

      homeAway: {
        overall: { greenMin: 30, redBelow: 25 },
        home: { greenMin: 35, redBelow: 30 },
        away: { greenMin: 25, redBelow: 15 },
        gap: { greenMax: 15, redMin: 20 },
      },

      difficulty: {
        easy: { targetRate: 34 },
        equal: { targetRate: 34 },
        hard: { targetRate: 22 },
      },

      scorers: {
        uniqueScorers: { greenMin: 5, redBelow: 4 },
        scorers3Plus: { greenMin: 2, redBelow: 1 },
        scorers5Plus: { greenMin: 1, redBelow: 0 },
        scorers10Plus: { greenMin: 0, redBelow: null },

        topScorerDependencyPct: { greenMax: 45, redAbove: 50 },
        top3DependencyPct: { greenMax: 75, redAbove: 82 },
        oneGoalScorersPct: { greenMax: 45, redAbove: 60 },
      },

      squadUsage: {
        players500Pct: { greenRange: [85, 110], redBelow: 75, redAbove: 120 },
        players1000Pct: { greenRange: [45, 65], redBelow: 35, redAbove: 78 },
        players1500Pct: { greenRange: [30, 45], redBelow: 20, redAbove: 60 },
        players2000Pct: { greenRange: [15, 30], redBelow: 10, redAbove: 45 },
        players20StartsPct: { greenRange: [25, 40], redBelow: 15, redAbove: 55 },
        top14MinutesPct: { greenRange: [70, 82], redBelow: 60, redAbove: 90 },
      },
    },
  },
  {
    id: 'midLow',
    label: 'אמצע תחתון',
    shortLabel: 'אמצע תחתון',
    rankLabel: 'אזור 9–13',
    rankRange: [9, 13],
    pointsRange: { min: 30, max: 40 },
    color: 'warning',

    targets: {
      forecast: {
        points: 33,
        pointsRate: 37,
        goalDifference: -18,
        goalsFor: 42,
        goalsAgainst: 60,
      },

      homeAway: {
        overall: { greenMin: 40, redBelow: 35 },
        home: { greenMin: 45, redBelow: 40 },
        away: { greenMin: 35, redBelow: 25 },
        gap: { greenMax: 15, redMin: 20 },
      },

      difficulty: {
        easy: { targetRate: 63 },
        equal: { targetRate: 50 },
        hard: { targetRate: 28 },
      },

      scorers: {
        uniqueScorers: { greenMin: 7, redBelow: 5 },
        scorers3Plus: { greenMin: 4, redBelow: 3 },
        scorers5Plus: { greenMin: 2, redBelow: 1 },
        scorers10Plus: { greenMin: 0, redBelow: null },

        topScorerDependencyPct: { greenMax: 40, redAbove: 48 },
        top3DependencyPct: { greenMax: 70, redAbove: 78 },
        oneGoalScorersPct: { greenMax: 40, redAbove: 56 },
      },

      squadUsage: {
        players500Pct: { greenRange: [85, 105], redBelow: 75, redAbove: 115 },
        players1000Pct: { greenRange: [50, 70], redBelow: 40, redAbove: 82 },
        players1500Pct: { greenRange: [35, 50], redBelow: 25, redAbove: 62 },
        players2000Pct: { greenRange: [20, 35], redBelow: 12, redAbove: 48 },
        players20StartsPct: { greenRange: [30, 45], redBelow: 20, redAbove: 58 },
        top14MinutesPct: { greenRange: [75, 85], redBelow: 65, redAbove: 92 },
      },
    },
  },
  {
    id: 'midHigh',
    label: 'אמצע עליון',
    shortLabel: 'אמצע עליון',
    rankLabel: 'אזור 5–8',
    rankRange: [5, 8],
    pointsRange: { min: 40, max: 55 },
    color: 'primary',

    targets: {
      forecast: {
        points: 48,
        pointsRate: 53,
        goalDifference: 9,
        goalsFor: 60,
        goalsAgainst: 51,
      },

      homeAway: {
        overall: { greenMin: 55, redBelow: 50 },
        home: { greenMin: 60, redBelow: 45 },
        away: { greenMin: 50, redBelow: 40 },
        gap: { greenMax: 15, redMin: 18 },
      },

      difficulty: {
        easy: { targetRate: 71 },
        equal: { targetRate: 45 },
        hard: { targetRate: 17 },
      },

      scorers: {
        uniqueScorers: { greenMin: 10, redBelow: 8 },
        scorers3Plus: { greenMin: 6, redBelow: 4 },
        scorers5Plus: { greenMin: 4, redBelow: 3 },
        scorers10Plus: { greenMin: 1, redBelow: 0 },

        topScorerDependencyPct: { greenMax: 35, redAbove: 42 },
        top3DependencyPct: { greenMax: 65, redAbove: 72 },
        oneGoalScorersPct: { greenMax: 40, redAbove: 56 },
      },

      squadUsage: {
        players500Pct: { greenRange: [80, 100], redBelow: 70, redAbove: 112 },
        players1000Pct: { greenRange: [55, 70], redBelow: 45, redAbove: 82 },
        players1500Pct: { greenRange: [40, 55], redBelow: 30, redAbove: 65 },
        players2000Pct: { greenRange: [25, 40], redBelow: 15, redAbove: 52 },
        players20StartsPct: { greenRange: [35, 50], redBelow: 25, redAbove: 62 },
        top14MinutesPct: { greenRange: [78, 88], redBelow: 68, redAbove: 94 },
      },
    },
  },
  {
    id: 'top',
    label: 'עליון / צמרת',
    shortLabel: 'עליון',
    rankLabel: 'אזור 1–4',
    rankRange: [1, 4],
    pointsRange: { min: 55, max: null },
    color: 'success',

    targets: {
      forecast: {
        points: 67,
        pointsRate: 74,
        goalDifference: 56,
        goalsFor: 89,
        goalsAgainst: 34,
      },

      homeAway: {
        overall: { greenMin: 70, redBelow: 65 },
        home: { greenMin: 75, redBelow: 65 },
        away: { greenMin: 65, redBelow: 60 },
        gap: { greenMax: 12, redMin: 15 },
      },

      difficulty: {
        easy: { targetRate: 80 },
        equal: { targetRate: 50 },
        hard: { targetRate: 40 },
      },

      scorers: {
        uniqueScorers: { greenMin: 14, redBelow: 10 },
        scorers3Plus: { greenMin: 8, redBelow: 5 },
        scorers5Plus: { greenMin: 5, redBelow: 3 },
        scorers10Plus: { greenMin: 2, redBelow: 1 },

        topScorerDependencyPct: { greenMax: 30, redAbove: 40 },
        top3DependencyPct: { greenMax: 60, redAbove: 70 },
        oneGoalScorersPct: { greenMax: 35, redAbove: 55 },
      },

      squadUsage: {
        players500Pct: { greenRange: [80, 95], redBelow: 70, redAbove: 110 },
        players1000Pct: { greenRange: [55, 70], redBelow: 45, redAbove: 82 },
        players1500Pct: { greenRange: [40, 55], redBelow: 30, redAbove: 65 },
        players2000Pct: { greenRange: [30, 45], redBelow: 20, redAbove: 58 },
        players20StartsPct: { greenRange: [35, 50], redBelow: 25, redAbove: 62 },
        top14MinutesPct: { greenRange: [80, 90], redBelow: 70, redAbove: 96 },
      },
    },
  },
]
