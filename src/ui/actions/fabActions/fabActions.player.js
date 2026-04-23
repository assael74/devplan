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
    onAddVideoAnalysis,
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
    })
  }

  return composeFabActions({
    primaryActions: [],
    taskAction,
  })
}
