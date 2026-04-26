// features/videoHub/VideoHubFabMenu.js

import React, { useMemo } from 'react'

import GenericFabMenu from '../../../ui/actions/GenericFabMenu'
import { buildFabActions } from '../../../ui/actions/fabActions.factory.js'
import { VIDEO_TAB } from '../logic/videoHub.model'

export default function VideoHubFabMenu({
  tab,
  onCreateAnalysis,
  onCreateGeneral,
  onAddTask,
  taskContext,
}) {
  const actions = useMemo(() => {
    return buildFabActions({
      area: 'video',
      mode: tab,
      taskContext,
      permissions: { allowCreate: true },
      handlers: {
        onAddVideoAnalysis: onCreateAnalysis,
        onCreateVideoGeneral: onCreateGeneral,
        onAddTask,
      },
    })
  }, [tab, onCreateAnalysis, onCreateGeneral, onAddTask, taskContext])

  if (!actions?.length) return null

  const entityType = tab === VIDEO_TAB.ANALYSIS ? 'videoAnalysis' : 'videoGeneral'

  return (
    <GenericFabMenu
      id="video-hub-fab"
      placement="br"
      tooltip={tab === VIDEO_TAB.ANALYSIS ? 'יצירת ניתוח וידאו' : 'יצירת וידאו כללי'}
      ariaLabel="יצירת וידאו"
      actions={actions}
      variant="solid"
      entityType={entityType}
      fabSx={{ color: '#fff' }}
    />
  )
}
