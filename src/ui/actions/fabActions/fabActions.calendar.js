// ui/actions/fabActions/fabActions.calendar.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildCalendarFabActions({
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const { onAddMeeting } = handlers

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
