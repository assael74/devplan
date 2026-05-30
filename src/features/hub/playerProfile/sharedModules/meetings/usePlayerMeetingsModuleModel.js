// playerProfile/sharedModules/meetings/usePlayerMeetingsModuleModel.js

import { useCallback, useState } from 'react'

import useMeetingsWorkspace from '../../sharedLogic/meetings/module/useMeetingsWorkspace.js'
import { useMeetingHubUpdate } from '../../../hooks/meetings/useMeetingHubUpdate.js'

import {
  FALLBACK_VIDEO_LINK,
  createMeetingsResetPatch,
} from './playerMeetingsModule.constants.js'

export default function usePlayerMeetingsModuleModel({ entity }) {
  const player = entity || null
  const ws = useMeetingsWorkspace(player)

  const [screen, setScreen] = useState('list')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { run, pending } = useMeetingHubUpdate(ws.selected)

  const handleResetFilters = useCallback(() => {
    if (typeof ws?.onReset === 'function') {
      ws.onReset()
      return
    }

    ws?.onChange(createMeetingsResetPatch())
  }, [ws])

  const handleSelectMeeting = useCallback(
    id => {
      ws.setSelectedId(id)
      setScreen('details')
    },
    [ws]
  )

  const handleBackToList = useCallback(() => {
    setScreen('list')
  }, [])

  const handleSaveMeeting = useCallback(
    async (_meetingId, patch) => {
      if (!ws.selected?.id) return

      await run('updateMeeting', patch, {
        section: 'playerProfile.meetings',
        meetingId: ws.selected.id,
      })
    },
    [run, ws.selected]
  )

  return {
    player,
    ws,

    screen,
    filtersOpen,
    pending,

    fallbackVideoLink: FALLBACK_VIDEO_LINK,

    setScreen,
    setFiltersOpen,

    handleResetFilters,
    handleSelectMeeting,
    handleBackToList,
    handleSaveMeeting,
  }
}
