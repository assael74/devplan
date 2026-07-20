// features/playersDatabase/components/profilesPage/preview/logic/previewMetrics.logic.js

export const getProfileMetrics = profile => ({
  playersCount: profile?.loadedPlayersCount || 0,
  teamsCount: profile?.loadedTeamsCount || 0,
  leaguesCount: profile?.leaguesCount || 0,
  statsCount: profile?.statsCount || 0,
  profilesCount: profile?.scoutProfilesCount || 0,
})

export const buildMetricItems = metrics => [
  {
    id: 'leagues',
    entity: 'club',
    iconId: 'league',
    label: 'ליגות שנבחרו',
    value: metrics.leaguesCount || 0,
  },
  {
    id: 'teams',
    entity: 'teams',
    iconId: 'teams',
    label: 'קבוצות שנבחרו',
    value: metrics.teamsCount || 0,
  },
  {
    id: 'players',
    entity: 'player',
    iconId: 'player',
    label: 'שחקנים שנבחרו',
    value: metrics.playersCount || 0,
  },
  {
    id: 'stats',
    entity: 'taskAnalyst',
    iconId: 'stats',
    label: 'שחקנים עם סטטיסטיקה',
    value: metrics.statsCount || 0,
  },
  {
    id: 'profiles',
    entity: 'scouting',
    iconId: 'playersDatabase',
    label: 'שחקנים עם פרופילים',
    value: metrics.profilesCount || 0,
  },
]
