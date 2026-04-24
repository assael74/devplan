// ui/actions/fabActions/fabActions.player.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildPlayerFabActions({
  mode = '',
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const {
    onAddMeeting,
    onAddAbilities,
    onAddPayment,
    onAddGame,
    onAddGames,
    onAddVideoAnalysis,
    onOpenGamesInsights,
    onOpenVideoInsights,
    onOpenAbilitiesInsights,
  } = handlers

  if (mode === 'meetings') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'add-meeting',
          label: 'הוסף מפגש',
          icon: iconUi({ id: 'addMeeting' }),
          onClick: onAddMeeting,
          color: 'project',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'project' },
    })
  }

  if (mode === 'games') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'add-game',
          label: 'הוסף משחק',
          icon: iconUi({ id: 'addGame' }),
          onClick: onAddGame,
          color: 'player',
          disabled: !allowCreate,
        },
        {
          id: 'add-multi-game',
          label: 'הוסף מספר משחקים',
          icon: iconUi({ id: 'addGames' }),
          onClick: onAddGames,
          color: 'player',
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

  if (mode === 'abilities') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'add-abilities',
          label: 'הוסף טופס יכולות',
          icon: iconUi({ id: 'addAbilities' }),
          onClick: onAddAbilities,
          color: 'player',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'player' },
      insightActions: [
        {
          id: 'abilities-insights',
          label: 'תובנות יכולות',
          icon: iconUi({ id: 'insights' }),
          onClick: onOpenAbilitiesInsights,
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

  if (mode === 'payments') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'add-payment',
          label: 'הוסף תשלום',
          icon: iconUi({ id: 'addPayment' }),
          onClick: onAddPayment,
          color: 'club',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'club' },
    })
  }

  if (mode === 'videos') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'add-video',
          label: 'הוסף ניתוח וידאו',
          icon: iconUi({ id: 'addVideo' }),
          onClick: onAddVideoAnalysis,
          color: 'videoAnalysis',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'videoAnalysis' },
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
  })
}
