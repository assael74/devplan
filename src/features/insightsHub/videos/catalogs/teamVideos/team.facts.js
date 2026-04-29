// features/insightsHub/videos/catalogs/teamVideos/team.facts.js

export const TEAM_VIDEOS_FACT_GROUPS = {
  VOLUME: 'volume',
  ANALYSIS_TYPE: 'analysisType',
  MONTHLY_ACTIVITY: 'monthlyActivity',
  TAGGING: 'tagging',
}

export const TEAM_VIDEOS_FACTS_CATALOG = [
  {
    id: 'team_videos_total_videos',
    group: TEAM_VIDEOS_FACT_GROUPS.VOLUME,
    label: 'כמות סרטונים כוללת',
    field: 'totalVideos',
  },
  {
    id: 'team_videos_direct_analysis_videos',
    group: TEAM_VIDEOS_FACT_GROUPS.ANALYSIS_TYPE,
    label: 'כמות ניתוחי וידאו קבוצתיים',
    field: 'analysisVideos',
  },
  {
    id: 'team_videos_meeting_videos',
    group: TEAM_VIDEOS_FACT_GROUPS.ANALYSIS_TYPE,
    label: 'כמות סרטוני פגישה קבוצתית',
    field: 'meetingVideos',
  },
  {
    id: 'team_videos_active_months',
    group: TEAM_VIDEOS_FACT_GROUPS.MONTHLY_ACTIVITY,
    label: 'כמות חודשים פעילים',
    field: 'activeMonths',
  },
  {
    id: 'team_videos_monthly_activity',
    group: TEAM_VIDEOS_FACT_GROUPS.MONTHLY_ACTIVITY,
    label: 'פעילות וידאו לפי חודש',
    field: 'monthlyActivity',
  },
  {
    id: 'team_videos_total_categories',
    group: TEAM_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'כמות קטגוריות שתועדו',
    field: 'totalCategories',
  },
  {
    id: 'team_videos_total_topics',
    group: TEAM_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'כמות נושאים שתועדו',
    field: 'totalTopics',
  },
  {
    id: 'team_videos_top_categories',
    group: TEAM_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'קטגוריות מובילות',
    field: 'topCategories',
  },
  {
    id: 'team_videos_top_topics',
    group: TEAM_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'נושאים מובילים',
    field: 'topTopics',
  },
  {
    id: 'team_videos_monthly_top_categories',
    group: TEAM_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'קטגוריות מובילות לפי חודש',
    field: 'monthlyTopCategories',
  },
  {
    id: 'team_videos_monthly_top_topics',
    group: TEAM_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'נושאים מובילים לפי חודש',
    field: 'monthlyTopTopics',
  },
]

export const getTeamVideosFactById = (id) => {
  return TEAM_VIDEOS_FACTS_CATALOG.find((fact) => fact.id === id) || null
}

export const getTeamVideosFactsByGroup = (group) => {
  return TEAM_VIDEOS_FACTS_CATALOG.filter((fact) => fact.group === group)
}
