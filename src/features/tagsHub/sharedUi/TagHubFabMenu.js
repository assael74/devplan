// features/tagsHub/TagHubFabMenu.js

import React, { useMemo } from 'react'
import GenericFabMenu from '../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../ui/actions/fabActions.factory.js'

export default function TagHubFabMenu({
  onCreateTag,
  onAddTask,
  taskContext,
  entityType,
}) {
  const actions = useMemo(() => {
    return buildFabActions({
      area: 'tags',
      mode: 'management',
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onCreateTag,
        onAddTask,
      },
    })
  }, [onCreateTag, onAddTask, taskContext])

  if (!actions?.length) return null

  return (
    <GenericFabMenu
      id="tags-hub-fab"
      placement="br"
      tooltip="יצירת תג או משימה"
      ariaLabel="יצירת תג או משימה"
      actions={actions}
      entityType={entityType}
      fabSx={{ color: '#fff' }}
    />
  )
}
