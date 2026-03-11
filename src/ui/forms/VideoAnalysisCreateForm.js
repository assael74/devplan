// ui/forms/VideoAnalysisCreateForm.js
import React, { useEffect, useMemo } from 'react'
import{ Box, Sheet, Divider, Typography } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { vaSx } from './sx/form.sx.js'
import { getVideoModes, getVideoDisabled, getVideoVisible } from './helpers/videoForm.helpers.js'
import { iconUi } from '../core/icons/iconUi.js'

import VideoAnalysisCreateFields from './ui/videoAnalysis/VideoAnalysisCreateFields.js'
import { getVideoAnalysisCreateFormLayout } from './layouts/videoAnalysisCreateForm.layout.js'

import {
  VIDEOANALYSIS_OBJECTTYPES,
  VIDEOANALYSIS_CONTEXTTYPES,
} from '../../shared/videoAnalysis/videoAnalysis.constants.js'

const clean = (v) => String(v ?? '').trim()

export default function VideoAnalysisCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const {
    name = '',
    link = '',
    contextType = '',
    objectType = '',
    year = '',
    month = '',
    meetingId = '',
    teamId = '',
    playerId = '',
  } = draft

  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const hasContext = !!context
  const locks = draft?.__locks || {}
  const expected = locks?.expected || {}

  const { isMeetingMode, isEntityMode, isFloating } = useMemo(
    () => getVideoModes(contextType),
    [contextType]
  )

  const disabled = useMemo(
    () => getVideoDisabled(contextType, objectType, hasContext, locks),
    [contextType, objectType, hasContext, locks]
  )

  const visible = useMemo(
    () => getVideoVisible(contextType, objectType, locks, draft),
    [contextType, objectType, locks, draft]
  )

  const showLockNote = !!(
    locks?.lockContextType ||
    locks?.lockObjectType ||
    locks?.lockMeetingId ||
    locks?.lockPlayerId ||
    locks?.lockTeamId
  )

  useEffect(() => {
    const hasLocks = !!locks && Object.keys(locks).length > 0
    if (!hasLocks) return

    const next = { ...draft }
    let changed = false

    if (locks.lockContextType && expected.contextType && next.contextType !== expected.contextType) {
      next.contextType = expected.contextType
      changed = true
    }

    if (locks.lockObjectType && expected.objectType && next.objectType !== expected.objectType) {
      next.objectType = expected.objectType
      changed = true
    }

    if (locks.lockPlayerId && expected.playerId && next.playerId !== expected.playerId) {
      next.playerId = expected.playerId
      changed = true
    }

    if (locks.lockTeamId && expected.teamId && next.teamId !== expected.teamId) {
      next.teamId = expected.teamId
      changed = true
    }

    if (locks.lockMeetingId && expected.meetingId && next.meetingId !== expected.meetingId) {
      next.meetingId = expected.meetingId
      changed = true
    }

    if (changed) onDraft(next)
  }, [
    draft,
    onDraft,
    locks,
    expected?.contextType,
    expected?.objectType,
    expected?.playerId,
    expected?.teamId,
    expected?.meetingId,
  ])

  // Clean dependent fields by mode
  useEffect(() => {
    if (isMeetingMode) {
      if (objectType !== 'meeting' || teamId || playerId) {
        onDraft({ ...draft, objectType: 'meeting', teamId: null, playerId: null })
      }
      return
    }

    if (isEntityMode) {
      if (meetingId) {
        onDraft({ ...draft, meetingId: null })
        return
      }
      if (!objectType || objectType === 'meeting') {
        onDraft({ ...draft, objectType: 'player', teamId: null, playerId: null })
        return
      }
      if (objectType === 'player' && teamId) {
        onDraft({ ...draft, teamId: null })
        return
      }
      if (objectType === 'team' && playerId) {
        onDraft({ ...draft, playerId: null })
        return
      }
      return
    }

    if (isFloating) {
      if (objectType || meetingId || teamId || playerId) {
        onDraft({ ...draft, objectType: '', meetingId: null, teamId: null, playerId: null })
      }
    }
  }, [contextType, objectType])

  const objectTypeOptions = useMemo(() => {
    if (contextType === 'meeting') return VIDEOANALYSIS_OBJECTTYPES.filter((o) => o.id === 'meeting')
    if (contextType === 'entity')
      return VIDEOANALYSIS_OBJECTTYPES.filter((o) => o.id === 'player' || o.id === 'team')
    return VIDEOANALYSIS_OBJECTTYPES
  }, [contextType])

  const contextTypeOptions = useMemo(() => VIDEOANALYSIS_CONTEXTTYPES, [])

  const validity = useMemo(() => {
    const okLink = !!clean(link)
    const okName = !!clean(name)
    const okContext = !!clean(contextType)
    const okYear = !!year
    const okMonth = !!month

    if (!(okLink && okName && okContext && okYear && okMonth)) return { isValid: false }

    if (contextType === 'floating') return { isValid: true }
    if (contextType === 'meeting') return { isValid: !!clean(meetingId) }

    const okObject = !!clean(objectType) && objectType !== 'meeting'
    if (!okObject) return { isValid: false }

    if (objectType === 'player') return { isValid: !!clean(playerId) }
    if (objectType === 'team') return { isValid: !!clean(teamId) }

    return { isValid: false }
  }, [link, name, contextType, objectType, year, month, meetingId, teamId, playerId])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getVideoAnalysisCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <VideoAnalysisCreateFields
      locks={locks}
      draft={draft}
      layout={layout}
      onDraft={onDraft}
      context={context}
      visible={visible}
      validity={validity}
      disabled={disabled}
      isEntityMode={isEntityMode}
      onValidChange={onValidChange}
      isMeetingMode={isMeetingMode}
      objectTypeOptions={objectTypeOptions}
      contextTypeOptions={contextTypeOptions}
    />
  )
}
