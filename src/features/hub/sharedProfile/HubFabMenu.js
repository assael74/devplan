// src/features/hub/sharedProfile/HubFabMenu.js

import React, { useMemo } from 'react'
import GenericFabMenu from '../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../ui/actions/fabActions.factory'

export default function HubFabMenu({ mode, context, handlers, permissions, taskContext }) {
  const actions = useMemo(
    () => buildFabActions({ area: 'hub', mode, context, handlers, permissions, taskContext }),
    [mode, context, handlers, permissions, taskContext]
  )

  const tooltip =
    mode === 'players'
      ? 'הוספת שחקן'
      : mode === 'privates'
      ? 'הוספת שחקן פרטי'
      : mode === 'teams'
      ? 'הוספת קבוצה'
      : mode === 'clubs'
      ? 'הוספת מועדון'
      : mode === 'staff'
      ? 'הוספת איש צוות'
      : mode === 'scouting'
      ? 'הוספת שחקן למעקב'
      : 'פתיחת אובייקט'

  return (
    <GenericFabMenu
      id="hub-fab"
      placement="br"
      tooltip={tooltip}
      ariaLabel="פתיחת אובייקט"
      actions={actions}
      variant="solid"
      context={context}
      taskContext={taskContext}
      entityType={mode}
      fabSx={{ color: '#fff' }}
    />
  )
}
