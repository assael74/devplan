// features/insightsHub/games/catalogs/teamGames/team.insights.js

export const TEAM_GAMES_INSIGHT_GROUPS = {
  RESULTS: 'results',
  GOALS: 'goals',
  HOME_AWAY: 'homeAway',
  DIFFICULTY: 'difficulty',
  PLAYERS: 'players',
  LINEUP: 'lineup',
  PROJECTION: 'projection',
  PERFORMANCE: 'performance',
}

export const TEAM_GAMES_INSIGHT_CONTEXTS = {
  CURRENT: 'current',
  PROJECTION: 'projection',
}

export const TEAM_GAMES_INSIGHT_LEVELS = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
}

export const TEAM_GAMES_INSIGHT_LEVEL_META = {
  [TEAM_GAMES_INSIGHT_LEVELS.LIGHT]: {
    id: TEAM_GAMES_INSIGHT_LEVELS.LIGHT,
    label: 'קלה',
    color: 'success',
    tone: 'green',
    description: 'מבוססת על נתוני הקבוצה המעודכנים בלבד.',
  },
  [TEAM_GAMES_INSIGHT_LEVELS.MEDIUM]: {
    id: TEAM_GAMES_INSIGHT_LEVELS.MEDIUM,
    label: 'בינונית',
    color: 'warning',
    tone: 'orange',
    description: 'מבוססת על נתוני משחקים, רק כאשר יש התאמה לנתוני הקבוצה.',
  },
  [TEAM_GAMES_INSIGHT_LEVELS.HEAVY]: {
    id: TEAM_GAMES_INSIGHT_LEVELS.HEAVY,
    label: 'כבדה',
    color: 'danger',
    tone: 'red',
    description: 'מבוססת על נתוני ביצועים מתקדמים.',
  },
}

export const TEAM_GAMES_INSIGHT_SOURCES = {
  TEAM: 'team',
  TEAM_GAMES: 'teamGames',
  PERFORMANCE: 'performance',
}

export const TEAM_GAMES_INSIGHT_AVAILABILITY = {
  ALWAYS: 'always',
  ONLY_IF_TEAM_LEAGUE_READY: 'onlyIfTeamLeagueReady',
  ONLY_IF_TEAM_GAMES_SYNCED: 'onlyIfTeamGamesSynced',
  FUTURE: 'future',
}

export const TEAM_GAMES_INSIGHT_USAGE = {
  ACTIVE: 'active',
  CANDIDATE: 'candidate',
  IDEA: 'idea',
  DISABLED: 'disabled',
}

export const TEAM_GAMES_INSIGHT_READINESS = {
  READY: 'ready',
  MISSING_METRIC: 'missingMetric',
  MISSING_BENCHMARK: 'missingBenchmark',
  MISSING_FACT: 'missingFact',
  NEEDS_VALIDATION: 'needsValidation',
}

export const TEAM_GAMES_REQUIRED_TEAM_LEAGUE_FIELDS = [
  'league',
  'leagueLevel',
  'leaguePosition',
  'points',
  'leagueGoalsFor',
  'leagueRound',
  'leagueNumGames',
  'leagueGoalsAgainst',
]

const LIGHT_META = {
  level: TEAM_GAMES_INSIGHT_LEVELS.LIGHT,
  source: TEAM_GAMES_INSIGHT_SOURCES.TEAM,
  availability: TEAM_GAMES_INSIGHT_AVAILABILITY.ONLY_IF_TEAM_LEAGUE_READY,
  requiresSync: false,
  requiredTeamFields: TEAM_GAMES_REQUIRED_TEAM_LEAGUE_FIELDS,
}

const MEDIUM_META = {
  level: TEAM_GAMES_INSIGHT_LEVELS.MEDIUM,
  source: TEAM_GAMES_INSIGHT_SOURCES.TEAM_GAMES,
  availability: TEAM_GAMES_INSIGHT_AVAILABILITY.ONLY_IF_TEAM_GAMES_SYNCED,
  requiresSync: true,
  requiredTeamFields: TEAM_GAMES_REQUIRED_TEAM_LEAGUE_FIELDS,
}

const HEAVY_META = {
  level: TEAM_GAMES_INSIGHT_LEVELS.HEAVY,
  source: TEAM_GAMES_INSIGHT_SOURCES.PERFORMANCE,
  availability: TEAM_GAMES_INSIGHT_AVAILABILITY.FUTURE,
  requiresSync: false,
  requiredTeamFields: [],
}

export const TEAM_GAMES_INSIGHTS_CATALOG = [
  {
    id: 'team_games_points_rate_vs_benchmark',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.RESULTS,
    ...LIGHT_META,
    label: 'אחוז צבירת נקודות ביחס לרמת טבלה',
    description: 'בדיקה האם קצב צבירת הנקודות של הקבוצה תואם את נקודת הייחוס לרמת טבלה מוגדרת.',
    basedOnMetrics: [
      'team_games_points_rate',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_points_rate_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_scoring_rate_vs_benchmark',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.GOALS,
    ...LIGHT_META,
    label: 'קצב כיבוש שערים ביחס לרמת טבלה',
    description: 'בדיקה האם הקבוצה כובשת בקצב שתואם את נקודת הייחוס לשערי זכות לפי רמת טבלה.',
    basedOnMetrics: [
      'team_games_goals_for_per_game',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_goals_for_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_conceding_rate_vs_benchmark',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.GOALS,
    ...LIGHT_META,
    label: 'קצב ספיגת שערים ביחס לרמת טבלה',
    description: 'בדיקה האם הקבוצה סופגת בקצב שתואם את נקודת הייחוס לשערי חובה לפי רמת טבלה.',
    basedOnMetrics: [
      'team_games_goals_against_per_game',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_goals_against_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_goal_difference_vs_benchmark',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.GOALS,
    ...LIGHT_META,
    label: 'הפרש שערים ביחס לרמת טבלה',
    description: 'בדיקה האם הפרש השערים של הקבוצה תואם את נקודת הייחוס לרמת טבלה.',
    basedOnMetrics: [
      'team_games_goal_difference',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_goal_difference_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_balance_profile',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.GOALS,
    ...LIGHT_META,
    label: 'פרופיל איזון הקבוצה',
    description: 'סיווג הקבוצה כהתקפית, הגנתית, מאוזנת או לא מאוזנת לפי קצב כיבוש, קצב ספיגה, הפרש שערים וצבירת נקודות.',
    basedOnMetrics: [
      'team_games_goals_for_per_game',
      'team_games_goals_against_per_game',
      'team_games_goal_difference',
      'team_games_points_rate',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_goals_for_by_table_level',
      'team_games_benchmark_goals_against_by_table_level',
      'team_games_benchmark_goal_difference_by_table_level',
      'team_games_benchmark_points_rate_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },

  {
    id: 'team_games_projected_final_position_by_points_rate',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.PROJECTION,
    group: TEAM_GAMES_INSIGHT_GROUPS.PROJECTION,
    ...LIGHT_META,
    label: 'מיקום סופי צפוי לפי קצב צבירת נקודות',
    description: 'חיזוי מיקום סופי לפי קצב צבירת הנקודות הנוכחי של הקבוצה ביחס לנקודות ייחוס לפי רמת טבלה.',
    basedOnMetrics: [
      'team_games_projected_total_points',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_final_points_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_projected_attacking_output',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.PROJECTION,
    group: TEAM_GAMES_INSIGHT_GROUPS.PROJECTION,
    ...LIGHT_META,
    label: 'צפי כוח התקפי עד סוף העונה',
    description: 'חיזוי כמות שערי הזכות הצפויה עד סוף העונה לפי קצב הכיבוש הנוכחי וביחס לרמת טבלה.',
    basedOnMetrics: [
      'team_games_projected_goals_for',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_goals_for_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_projected_defensive_output',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.PROJECTION,
    group: TEAM_GAMES_INSIGHT_GROUPS.PROJECTION,
    ...LIGHT_META,
    label: 'צפי יציבות הגנתית עד סוף העונה',
    description: 'חיזוי כמות שערי החובה הצפויה עד סוף העונה לפי קצב הספיגה הנוכחי וביחס לרמת טבלה.',
    basedOnMetrics: [
      'team_games_projected_goals_against',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_goals_against_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },

  {
    id: 'team_games_home_away_performance_gap',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.HOME_AWAY,
    ...MEDIUM_META,
    label: 'פער ביצועי בית / חוץ',
    description: 'בדיקה האם הקבוצה מצליחה או מתקשה בצורה חריגה במשחקי בית לעומת משחקי חוץ.',
    basedOnMetrics: [
      'team_games_home_points_rate',
      'team_games_away_points_rate',
      'team_games_home_away_points_gap',
    ],
    basedOnBenchmarks: [],
    missingMetrics: [],
    missingBenchmarks: [
      'team_games_benchmark_home_away_gap',
    ],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.MISSING_BENCHMARK,
  },
  {
    id: 'team_games_competitiveness_by_opponent_level',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.DIFFICULTY,
    ...MEDIUM_META,
    label: 'פרופיל תחרותיות לפי רמת יריבה',
    description: 'בדיקה האם הקבוצה מצליחה מול יריבות חזקות, מתקשה מול יריבות חלשות, או יציבה מול רמות שונות של יריבה.',
    basedOnMetrics: [
      'team_games_points_rate_by_difficulty',
      'team_games_difficulty_adjusted_points_rate',
    ],
    basedOnBenchmarks: [],
    missingMetrics: [],
    missingBenchmarks: [
      'team_games_benchmark_points_rate_by_difficulty',
    ],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.MISSING_BENCHMARK,
  },
  {
    id: 'team_games_attacking_tools_width',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.PLAYERS,
    ...MEDIUM_META,
    label: 'רוחב הכלים ההתקפיים בסגל',
    description: 'בדיקה האם התרומה ההתקפית מפוזרת בין מספר שחקנים או מרוכזת אצל מעט שחקנים.',
    basedOnMetrics: [
      'team_games_goal_scorers_rate',
      'team_games_assist_players_rate',
    ],
    basedOnBenchmarks: [],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_light_attacking_contribution_distribution',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.PLAYERS,
    ...MEDIUM_META,
    label: 'פיזור תרומה התקפית קלה',
    description: 'בדיקה האם שערים ובישולים מגיעים ממספר רחב של שחקנים. בשלב זה תרומה התקפית מוגדרת כסטטיסטיקה קלה: שערים ובישולים בלבד.',
    basedOnMetrics: [
      'team_games_goal_contribution_players_rate',
      'team_games_goal_scorers_rate',
      'team_games_assist_players_rate',
    ],
    basedOnBenchmarks: [],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_lineup_stability_rotation',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.LINEUP,
    ...MEDIUM_META,
    label: 'יציבות / רוטציה בהרכב',
    description: 'בדיקה האם הקבוצה נשענת על גרעין הרכב קבוע או משתמשת ברוטציה רחבה. המשמעות תלויה בחיבור למדדי תוצאות.',
    basedOnMetrics: [
      'team_games_starters_usage_rate',
      'team_games_used_players_rate',
      'team_games_points_rate',
    ],
    basedOnBenchmarks: [],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.NEEDS_VALIDATION,
  },
  {
    id: 'team_games_projected_final_position_by_home_away',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.PROJECTION,
    group: TEAM_GAMES_INSIGHT_GROUPS.PROJECTION,
    ...MEDIUM_META,
    label: 'מיקום סופי צפוי לפי שקלול בית / חוץ',
    description: 'חיזוי מיקום סופי לפי צפי נקודות בית וצפי נקודות חוץ בהתאם למשחקים שנותרו.',
    basedOnMetrics: [
      'team_games_projected_home_points',
      'team_games_projected_away_points',
      'team_games_projected_final_position_by_home_away',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_final_points_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },
  {
    id: 'team_games_projected_final_position_by_difficulty',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.PROJECTION,
    group: TEAM_GAMES_INSIGHT_GROUPS.DIFFICULTY,
    ...MEDIUM_META,
    label: 'מיקום סופי צפוי לפי שקלול רמת יריבה',
    description: 'חיזוי מיקום סופי לפי פרופיל הקושי של המשחקים שנותרו וקצב צבירת הנקודות מול רמות יריבה שונות.',
    basedOnMetrics: [
      'team_games_points_rate_by_difficulty',
      'team_games_remaining_difficulty_profile',
      'team_games_difficulty_adjusted_points_rate',
      'team_games_projected_points_by_remaining_difficulty',
      'team_games_projected_final_position_by_difficulty',
    ],
    basedOnBenchmarks: [
      'team_games_benchmark_final_points_by_table_level',
    ],
    missingMetrics: [],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.CANDIDATE,
    readiness: TEAM_GAMES_INSIGHT_READINESS.READY,
  },

  {
    id: 'team_games_team_style_profile',
    context: TEAM_GAMES_INSIGHT_CONTEXTS.CURRENT,
    group: TEAM_GAMES_INSIGHT_GROUPS.PERFORMANCE,
    ...HEAVY_META,
    label: 'אופי וסגנון משחק הקבוצה',
    description: 'ניתוח עתידי של סגנון הקבוצה לפי נתוני ביצוע מתקדמים: מסירות, איומים, תיקולים, איבודים ופעולות משחק.',
    basedOnMetrics: [],
    basedOnBenchmarks: [],
    missingMetrics: [
      'team_games_passes_profile',
      'team_games_shots_profile',
      'team_games_defensive_actions_profile',
    ],
    missingBenchmarks: [],
    requiredNewFacts: [],
    usage: TEAM_GAMES_INSIGHT_USAGE.IDEA,
    readiness: TEAM_GAMES_INSIGHT_READINESS.MISSING_METRIC,
  },
]

export const getTeamGamesInsightById = (id) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.find((insight) => insight.id === id) || null
}

export const getTeamGamesInsightsByContext = (context) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.filter((insight) => insight.context === context)
}

export const getTeamGamesInsightsByGroup = (group) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.filter((insight) => insight.group === group)
}

export const getTeamGamesInsightsByUsage = (usage) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.filter((insight) => insight.usage === usage)
}

export const getTeamGamesInsightsByReadiness = (readiness) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.filter((insight) => insight.readiness === readiness)
}

export const getTeamGamesInsightsByLevel = (level) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.filter((insight) => insight.level === level)
}

export const getTeamGamesInsightsBySource = (source) => {
  return TEAM_GAMES_INSIGHTS_CATALOG.filter((insight) => insight.source === source)
}

export const getTeamGamesInsightLevelMeta = (level) => {
  return TEAM_GAMES_INSIGHT_LEVEL_META[level] || null
}
