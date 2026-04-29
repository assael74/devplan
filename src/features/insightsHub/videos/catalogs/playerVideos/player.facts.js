// features/insightsHub/videos/catalogs/playerVideos/player.facts.js

export const PLAYER_VIDEOS_FACT_GROUPS = {
  VOLUME: 'volume',
  ANALYSIS_TYPE: 'analysisType',
  MONTHLY_ACTIVITY: 'monthlyActivity',
  TAGGING: 'tagging',
}

export const PLAYER_VIDEOS_FACTS_CATALOG = [
  {
    id: 'player_videos_total_videos',
    group: PLAYER_VIDEOS_FACT_GROUPS.VOLUME,
    label: 'כמות סרטונים כוללת',
    field: 'totalVideos',
  },
  {
    id: 'player_videos_direct_analysis_videos',
    group: PLAYER_VIDEOS_FACT_GROUPS.ANALYSIS_TYPE,
    label: 'כמות ניתוחי וידאו אישיים',
    field: 'analysisVideos',
  },
  {
    id: 'player_videos_meeting_videos',
    group: PLAYER_VIDEOS_FACT_GROUPS.ANALYSIS_TYPE,
    label: 'כמות סרטוני פגישה אישית',
    field: 'meetingVideos',
  },
  {
    id: 'player_videos_active_months',
    group: PLAYER_VIDEOS_FACT_GROUPS.MONTHLY_ACTIVITY,
    label: 'כמות חודשים פעילים',
    field: 'activeMonths',
  },
  {
    id: 'player_videos_monthly_activity',
    group: PLAYER_VIDEOS_FACT_GROUPS.MONTHLY_ACTIVITY,
    label: 'פעילות וידאו לפי חודש',
    field: 'monthlyActivity',
  },
  {
    id: 'player_videos_total_categories',
    group: PLAYER_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'כמות קטגוריות שתועדו',
    field: 'totalCategories',
  },
  {
    id: 'player_videos_total_topics',
    group: PLAYER_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'כמות נושאים שתועדו',
    field: 'totalTopics',
  },
  {
    id: 'player_videos_top_categories',
    group: PLAYER_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'קטגוריות מובילות',
    field: 'topCategories',
  },
  {
    id: 'player_videos_top_topics',
    group: PLAYER_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'נושאים מובילים',
    field: 'topTopics',
  },
  {
    id: 'player_videos_monthly_top_categories',
    group: PLAYER_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'קטגוריות מובילות לפי חודש',
    field: 'monthlyTopCategories',
  },
  {
    id: 'player_videos_monthly_top_topics',
    group: PLAYER_VIDEOS_FACT_GROUPS.TAGGING,
    label: 'נושאים מובילים לפי חודש',
    field: 'monthlyTopTopics',
  },
]

export const getPlayerVideosFactById = (id) => {
  return PLAYER_VIDEOS_FACTS_CATALOG.find((fact) => fact.id === id) || null
}

export const getPlayerVideosFactsByGroup = (group) => {
  return PLAYER_VIDEOS_FACTS_CATALOG.filter((fact) => fact.group === group)
}
