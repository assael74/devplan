// ui/actions/fabActions/fabActions.club.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildClubFabActions({
  mode = '',
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const { onCreateTeam, onCreatePlayer } = handlers

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
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'player' },
    })
  }

  return composeFabActions({
    primaryActions: [],
    taskAction,
  })
}
