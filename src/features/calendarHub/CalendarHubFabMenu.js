// features/calendarHub/CalendarHubFabMenu.js

import React, { useMemo } from 'react'

import GenericFabMenu from '../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../ui/actions/fabActions.factory.js'

export default function CalendarHubFabMenu({
  taskContext,
  onAddTask,
  onAddMeeting,
}) {
  const actions = useMemo(() => {
    return buildFabActions({
      area: 'calendar',
      mode: 'week',
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onAddTask,
        onAddMeeting,
      },
    })
  }, [taskContext, onAddTask, onAddMeeting])

  if (!actions?.length) return null

  return (
    <GenericFabMenu
      id="calendar-hub-fab"
      placement="br"
      tooltip="פעולות יומן"
      ariaLabel="פעולות יומן"
      actions={actions}
      entityType="meeting"
      fabSx={{ color: '#fff' }}
    />
  )
}
