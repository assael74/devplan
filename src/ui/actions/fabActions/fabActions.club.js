// ui/actions/fabActions/fabActions.club.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildClubFabActions({
  mode = '',
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const {
    onCreateTeam,
    onOpenPlayersInsights,
    onOpenTeamsInsights
  } = handlers

  if (mode === 'teams') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'team',
          label: 'הוסף קבוצה',
          icon: iconUi({ id: 'addTeam' }),
          onClick: onCreateTeam,
          color: 'team',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'team' },
      insightActions: [
        {
          id: 'teams-insights',
          label: 'תובנות קבוצות',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenTeamsInsights,
          color: 'teams',
          disabled: false,
        },
      ],
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'teams',
      },
    })
  }

  if (mode === 'players') {
    return composeFabActions({
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'player' },
      insightActions: [
        {
          id: 'players-insights',
          label: 'תובנות משחקנים',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenPlayersInsights,
          color: 'players',
          disabled: false,
        },
      ],
      insightsSection: {
        id: 'section-insights',
        label: 'תובנות',
        colorKey: 'players',
      },
    })
  }

  return composeFabActions({
    primaryActions: [],
    taskAction,
  })
}
