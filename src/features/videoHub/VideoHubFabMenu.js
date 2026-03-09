// features/videoHub/VideoHubFabMenu.js
import React, { useMemo } from 'react'
import GenericFabMenu from '../../ui/actions/GenericFabMenu'
import { iconUi } from '../../ui/core/icons/iconUi.js'
import { VIDEO_TAB } from './videoHub.model'

export default function VideoHubFabMenu({ tab, onCreateAnalysis, onCreateGeneral }) {
  const actions = useMemo(() => {

    if (tab === VIDEO_TAB.ANALYSIS) {
      return typeof onCreateAnalysis === 'function'
        ? [
            {
              id: 'create-video-analysis',
              label: 'ניתוח וידאו חדש',
              icon: iconUi({ id: 'videoAnalysis' }),
              onClick: onCreateAnalysis,
              color: 'videoAnalysis',
            },
          ]
        : []
    }

    return typeof onCreateGeneral === 'function'
      ? [
          {
            id: 'create-video-general',
            label: 'וידאו כללי חדש',
            icon: iconUi({ id: 'videoGeneral' }),
            onClick: onCreateGeneral,
            color: 'videoGeneral',
          },
        ]
      : []
  }, [tab, onCreateAnalysis, onCreateGeneral])

  if (!actions.length) return null

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
