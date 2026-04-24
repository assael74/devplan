// ui/actions/fabActions/fabActions.team.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildTeamFabActions({
  mode = '',
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const {
    onCreatePlayer,
    onCreatePlayers,
    onAddGame,
    onAddGames,
    onOpenPlayersInsights,
    onOpenGamesInsights,
    onOpenPerformanceInsights,
    onOpenAbilitiesInsights,
    onOpenVideoInsights,
  } = handlers

  if (mode === 'games') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'add-game',
          label: 'הוסף משחק',
          icon: iconUi({ id: 'addGame' }),
          onClick: onAddGame,
          color: 'team',
          disabled: !allowCreate,
        },
        {
          id: 'add-multi-game',
          label: 'הוסף מספר משחקים',
          icon: iconUi({ id: 'addGames' }),
          onClick: onAddGames,
          color: 'team',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      insightActions: [
        {
          id: 'games-insights',
          label: 'תובנות משחקים',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenGamesInsights,
          color: 'team',
          disabled: false,
        },
      ],
      primarySection: {
        id: 'section-actions',
        label: 'פעולות',
        colorKey: 'team',
      },
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'team',
      },
    })
  }

  if (mode === 'players') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'player',
          label: 'הוסף שחקן',
          icon: iconUi({ id: 'addPlayer' }),
          onClick: onCreatePlayer,
          color: 'player',
          disabled: !allowCreate,
        },
        {
          id: 'players',
          label: 'הוסף מספר שחקנים',
          icon: iconUi({ id: 'addPlayers' }),
          onClick: onCreatePlayers,
          color: 'player',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      insightActions: [
        {
          id: 'players-insights',
          label: 'תובנות שחקנים',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenPlayersInsights,
          color: 'player',
          disabled: false,
        },
      ],
      primarySection: {
        id: 'section-actions',
        label: 'פעולות',
        colorKey: 'player',
      },
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'player',
      },
    })
  }

  if (mode === 'performance') {
    return composeFabActions({
      primaryActions: [],
      taskAction,
      insightActions: [
        {
          id: 'performance-insights',
          label: 'תובנות ביצועים',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenPerformanceInsights,
          color: 'player',
          disabled: false,
        },
      ],
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'player',
      },
    })
  }

  if (mode === 'abilities') {
    return composeFabActions({
      primaryActions: [],
      taskAction,
      insightActions: [
        {
          id: 'abilities-insights',
          label: 'תובנות יכולות',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenAbilitiesInsights,
          color: 'team',
          disabled: false,
        },
      ],
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'team',
      },
    })
  }

  if (mode === 'videos') {
    return composeFabActions({
      primaryActions: [],
      taskAction,
      insightActions: [
        {
          id: 'video-insights',
          label: 'תובנות וידאו',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenVideoInsights,
          color: 'videoAnalysis',
          disabled: false,
        },
      ],
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'videoAnalysis',
      },
    })
  }

  return composeFabActions({
    primaryActions: [],
    taskAction,
    insightActions: [],
  })
}
