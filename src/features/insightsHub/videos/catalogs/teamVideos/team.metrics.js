// features/insightsHub/videos/catalogs/teamVideos/team.metrics.js

export const TEAM_VIDEOS_METRIC_GROUPS = {
  PACE: 'pace',
  CONSISTENCY: 'consistency',
  ANALYSIS_MIX: 'analysisMix',
  TAGGING: 'tagging',
}

export const TEAM_VIDEOS_METRICS_CATALOG = [
  {
    id: 'team_videos_avg_videos_per_month',
    group: TEAM_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע סרטונים לחודש',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'team_videos_total_videos',
    ],
    dependsOnFields: [
      'totalVideos',
      'seasonMonths',
      'avgVideosPerMonth',
    ],
  },
  {
    id: 'team_videos_avg_analysis_per_month',
    group: TEAM_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע ניתוחים קבוצתיים לחודש',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'team_videos_direct_analysis_videos',
    ],
    dependsOnFields: [
      'analysisVideos',
      'seasonMonths',
      'avgAnalysisPerMonth',
    ],
  },
  {
    id: 'team_videos_avg_meetings_per_month',
    group: TEAM_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע סרטוני פגישה קבוצתית לחודש',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'team_videos_meeting_videos',
    ],
    dependsOnFields: [
      'meetingVideos',
      'seasonMonths',
      'avgMeetingsPerMonth',
    ],
  },
  {
    id: 'team_videos_avg_videos_per_active_month',
    group: TEAM_VIDEOS_METRIC_GROUPS.PACE,
    label: 'ממוצע סרטונים לחודש פעיל',
    valueType: 'number',
    unit: 'videos',
    requiredFacts: [
      'team_videos_total_videos',
      'team_videos_active_months',
    ],
    dependsOnFields: [
      'totalVideos',
      'activeMonths',
      'avgVideosPerActiveMonth',
    ],
  },

  {
    id: 'team_videos_active_months_rate',
    group: TEAM_VIDEOS_METRIC_GROUPS.CONSISTENCY,
    label: 'אחוז חודשים פעילים',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_videos_active_months',
      'team_videos_monthly_activity',
    ],
    dependsOnFields: [
      'activeMonths',
      'seasonMonths',
    ],
  },

  {
    id: 'team_videos_direct_analysis_rate',
    group: TEAM_VIDEOS_METRIC_GROUPS.ANALYSIS_MIX,
    label: 'יחס ניתוחי וידאו קבוצתיים',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_videos_direct_analysis_videos',
      'team_videos_total_videos',
    ],
    dependsOnFields: [
      'analysisVideos',
      'totalVideos',
    ],
  },
  {
    id: 'team_videos_meeting_videos_rate',
    group: TEAM_VIDEOS_METRIC_GROUPS.ANALYSIS_MIX,
    label: 'יחס סרטוני פגישה קבוצתית',
    valueType: 'percent',
    unit: 'percent',
    requiredFacts: [
      'team_videos_meeting_videos',
      'team_videos_total_videos',
    ],
    dependsOnFields: [
      'meetingVideos',
      'totalVideos',
    ],
  },

  {
    id: 'team_videos_category_diversity_rate',
    group: TEAM_VIDEOS_METRIC_GROUPS.TAGGING,
    label: 'יחס גיוון קטגוריות',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_videos_total_categories',
      'team_videos_total_videos',
    ],
    dependsOnFields: [
      'totalCategories',
      'totalVideos',
    ],
  },
  {
    id: 'team_videos_topic_diversity_rate',
    group: TEAM_VIDEOS_METRIC_GROUPS.TAGGING,
    label: 'יחס גיוון נושאים',
    valueType: 'ratio',
    unit: 'ratio',
    requiredFacts: [
      'team_videos_total_topics',
      'team_videos_total_videos',
    ],
    dependsOnFields: [
      'totalTopics',
      'totalVideos',
    ],
  },
]

export const getTeamVideosMetricById = (id) => {
  return TEAM_VIDEOS_METRICS_CATALOG.find((metric) => metric.id === id) || null
}

export const getTeamVideosMetricsByGroup = (group) => {
  return TEAM_VIDEOS_METRICS_CATALOG.filter((metric) => metric.group === group)
}
