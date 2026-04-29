// features/insightsHub/videos/catalogs/playerVideos/player.metrics.js

export const PLAYER_VIDEOS_METRIC_GROUPS = {
  PACE: 'pace',
  CONSISTENCY: 'consistency',
  ANALYSIS_MIX: 'analysisMix',
  TAGGING: 'tagging',
}

export const PLAYER_VIDEOS_METRICS_CATALOG = [
  {
    id: 'player_videos_avg_videos_per_month',
    group: PLAYER_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע סרטונים לחודש',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'player_videos_total_videos',
    ],
    dependsOnFields: [
      'totalVideos',
      'seasonMonths',
      'avgVideosPerMonth',
    ],
  },
  {
    id: 'player_videos_avg_analysis_per_month',
    group: PLAYER_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע ניתוחים אישיים לחודש',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'player_videos_direct_analysis_videos',
    ],
    dependsOnFields: [
      'analysisVideos',
      'seasonMonths',
      'avgAnalysisPerMonth',
    ],
  },
  {
    id: 'player_videos_avg_meetings_per_month',
    group: PLAYER_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע סרטוני פגישה אישית לחודש',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'player_videos_meeting_videos',
    ],
    dependsOnFields: [
      'meetingVideos',
      'seasonMonths',
      'avgMeetingsPerMonth',
    ],
  },
  {
    id: 'player_videos_avg_videos_per_active_month',
    group: PLAYER_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע סרטונים לחודש פעיל',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'player_videos_total_videos',
      'player_videos_active_months',
    ],
    dependsOnFields: [
      'totalVideos',
      'activeMonths',
      'avgVideosPerActiveMonth',
    ],
  },

  {
    id: 'player_videos_active_months_rate',
    group: PLAYER_VIDEOS_METRIC_GROUPS.CONSISTENCY,
    label: 'אחוז חודשים פעילים',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_videos_active_months',
      'player_videos_monthly_activity',
    ],
    dependsOnFields: [
      'activeMonths',
      'seasonMonths',
    ],
  },

  {
    id: 'player_videos_direct_analysis_rate',
    group: PLAYER_VIDEOS_METRIC_GROUPS.ANALYSIS_MIX,
    label: 'יחס ניתוחי וידאו אישיים',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_videos_direct_analysis_videos',
      'player_videos_total_videos',
    ],
    dependsOnFields: [
      'analysisVideos',
      'totalVideos',
    ],
  },
  {
    id: 'player_videos_meeting_videos_rate',
    group: PLAYER_VIDEOS_METRIC_GROUPS.ANALYSIS_MIX,
    label: 'יחס סרטוני פגישה אישית',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'player_videos_meeting_videos',
      'player_videos_total_videos',
    ],
    dependsOnFields: [
      'meetingVideos',
      'totalVideos',
    ],
  },

  {
    id: 'player_videos_category_diversity_rate',
    group: PLAYER_VIDEOS_METRIC_GROUPS.TAGGING,
    label: 'יחס גיוון קטגוריות',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'player_videos_total_categories',
      'player_videos_total_videos',
    ],
    dependsOnFields: [
      'totalCategories',
      'totalVideos',
    ],
  },
  {
    id: 'player_videos_topic_diversity_rate',
    group: PLAYER_VIDEOS_METRIC_GROUPS.TAGGING,
    label: 'יחס גיוון נושאים',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'player_videos_total_topics',
      'player_videos_total_videos',
    ],
    dependsOnFields: [
      'totalTopics',
      'totalVideos',
    ],
  },
]

export const getPlayerVideosMetricById = (id) => {
  return PLAYER_VIDEOS_METRICS_CATALOG.find((metric) => metric.id === id) || null
}

export const getPlayerVideosMetricsByGroup = (group) => {
  return PLAYER_VIDEOS_METRICS_CATALOG.filter((metric) => metric.group === group)
}
