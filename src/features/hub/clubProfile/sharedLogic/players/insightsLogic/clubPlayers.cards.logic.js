// features/hub/clubProfile/sharedLogic/players/insightsLogic/clubPlayers.cards.logic.js

export const buildClubPlayersCards = (summary) => {
  const squad = summary?.squad || {}
  const quickStats = summary?.quickStats || {}
  const project = summary?.project || {}
  const positions = summary?.positions || {}

  return [
    {
      id: 'playersTotal',
      label: 'שחקנים',
      value: squad?.total ?? 0,
      subValue: `${squad?.active ?? 0} פעילים · ${squad?.nonActive ?? 0} לא פעילים`,
      color: 'primary',
    },
    {
      id: 'keyPlayers',
      label: 'שחקני מפתח',
      value: squad?.keyCount ?? 0,
      subValue: squad?.keyRate || '0%',
      color: 'success',
    },
    {
      id: 'projectPlayers',
      label: 'פרויקט',
      value: project?.totalProject ?? 0,
      subValue: `${project?.totalCandidate ?? 0} מועמדים`,
      color: 'warning',
    },
    {
      id: 'positions',
      label: 'שכבות עמדה',
      value: Array.isArray(positions?.layers) ? positions.layers.length : 0,
      subValue: 'חלוקת סגל',
      color: 'neutral',
    },
    {
      id: 'playTimeOver70',
      label: 'מעל 70%',
      value: quickStats?.over70 ?? 0,
      subValue: 'דקות משחק',
      color: 'success',
    },
    {
      id: 'playTimeUnder30',
      label: 'מתחת 30%',
      value: quickStats?.under30 ?? 0,
      subValue: 'דקות משחק',
      color: 'danger',
    },
  ]
}

// Backward compatibility
export const buildPlayerGamesCards = buildClubPlayersCards
