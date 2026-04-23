// ui/actions/fabActions/fabActions.video.js

import { iconUi } from '../../core/icons/iconUi.js'
import { composeFabActions } from './fabActions.shared.js'

export function buildVideoFabActions({
  mode = '',
  allowCreate = true,
  taskAction = null,
  handlers = {},
}) {
  const { onAddVideoAnalysis, onCreateVideoGeneral } = handlers

  if (mode === 'analysis') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'create-video-analysis',
          label: 'ניתוח וידאו חדש',
          icon: iconUi({ id: 'videoAnalysis' }),
          onClick: onAddVideoAnalysis,
          color: 'videoAnalysis',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'videoAnalysis' },
    })
  }

  if (mode === 'general') {
    return composeFabActions({
      primaryActions: [
        {
          id: 'create-video-general',
          label: 'וידאו כללי חדש',
          icon: iconUi({ id: 'videoGeneral' }),
          onClick: onCreateVideoGeneral,
          color: 'videoGeneral',
          disabled: !allowCreate,
        },
      ],
      taskAction,
      primarySection: { id: 'section-actions', label: 'פעולות', colorKey: 'videoGeneral' },
    })
  }

  return composeFabActions({
    primaryActions: [],
    taskAction,
  })
}
