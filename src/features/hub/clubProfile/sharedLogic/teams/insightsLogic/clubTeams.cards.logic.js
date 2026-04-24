// features/hub/clubProfile/sharedLogic/teams/insightsLogic/clubTeams.cards.logic.js

export const buildClubTeamsCards = (summary = {}) => {
  return [
    {
      id: 'teamsTotal',
      label: 'קבוצות',
      value: summary?.teamsTotal ?? 0,
      subValue: `${summary?.activeTeamsTotal ?? 0} פעילות`,
      color: 'primary',
    },
    {
      id: 'projectTeams',
      label: 'קבוצות פרויקט',
      value: summary?.projectTeamsTotal ?? 0,
      subValue: 'קבוצות עם שחקני מפתח / פרויקט',
      color: 'success',
    },
    {
      id: 'playersTotal',
      label: 'שחקנים',
      value: summary?.playersTotal ?? 0,
      subValue: 'סה״כ שחקנים פעילים',
      color: 'neutral',
    },
    {
      id: 'keyPlayersTotal',
      label: 'שחקני מפתח',
      value: summary?.keyPlayersTotal ?? 0,
      subValue: 'בכל קבוצות המועדון',
      color: 'warning',
    },
  ]
}
