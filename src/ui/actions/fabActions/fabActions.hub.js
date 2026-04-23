// ui/actions/fabActions/fabActions.hub.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildHubFabActions({
  mode = '',
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const {
    onCreateClub,
    onCreateTeam,
    onCreatePlayer,
    onCreatePrivatePlayer,
    onCreateStaff,
    onCreateScout,
  } = handlers

  if (mode === 'clubs') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'club',
          label: 'הוסף מועדון',
          icon: iconUi({ id: 'addClub' }),
          onClick: onCreateClub,
          color: 'club',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'club' },
    })
  }

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

  if (mode === 'privates') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'private-player',
          label: 'הוסף שחקן פרטי',
          icon: iconUi({ id: 'addPlayer' }),
          onClick: onCreatePrivatePlayer,
          color: 'private',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'private' },
    })
  }

  if (mode === 'staff') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'staff',
          label: 'הוסף איש צוות',
          icon: iconUi({ id: 'addRole' }),
          onClick: onCreateStaff,
          color: 'role',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'role' },
    })
  }

  if (mode === 'scouting') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'scout',
          label: 'הוסף שחקן למעקב',
          icon: iconUi({ id: 'addScouting' }),
          onClick: onCreateScout,
          color: 'project',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'project' },
    })
  }

  return composeFabActions({
    primaryActions: [],
    taskAction,
  })
}
