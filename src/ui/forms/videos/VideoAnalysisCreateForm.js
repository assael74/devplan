// src/ui/forms/videos/VideoAnalysisCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { getVideoModes, getVideoDisabled, getVideoVisible } from './videoForm.helpers.js'

import VideoAnalysisCreateFields from './videoAnalysis/VideoAnalysisCreateFields.js'
import { getVideoAnalysisCreateFormLayout } from './analysisCreate.layout.js'

import {
  VIDEOANALYSIS_OBJECTTYPES,
  VIDEOANALYSIS_CONTEXTTYPES,
} from '../../../shared/videoAnalysis/videoAnalysis.constants.js'

const EMPTY_LOCKS = {}
const LOCKED_FIELDS = [
  ['lockContextType', 'contextType'],
  ['lockObjectType', 'objectType'],
  ['lockPlayerId', 'playerId'],
  ['lockTeamId', 'teamId'],
  ['lockMeetingId', 'meetingId'],
]

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
  const locks = draft?.__locks || EMPTY_LOCKS
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

  useEffect(() => {
    let next = draft

    if (isMeetingMode && (objectType !== 'meeting' || teamId || playerId)) {
      next = { ...next, objectType: 'meeting', teamId: null, playerId: null }
    } else if (isEntityMode) {
      if (meetingId) next = { ...next, meetingId: null }
      if (!objectType || objectType === 'meeting') {
        next = { ...next, objectType: 'player', teamId: null, playerId: null }
      } else if (objectType === 'player' && teamId) {
        next = { ...next, teamId: null }
      } else if (objectType === 'team' && playerId) {
        next = { ...next, playerId: null }
      }
    } else if (isFloating && (objectType || meetingId || teamId || playerId)) {
      next = { ...next, objectType: '', meetingId: null, teamId: null, playerId: null }
    }

    // A draft opened from a profile or meeting keeps its locked associations.
    for (const [lock, field] of LOCKED_FIELDS) {
      const expected = locks.expected?.[field]
      if (locks[lock] && expected && next[field] !== expected) {
        next = { ...next, [field]: expected }
      }
    }

    if (next !== draft && LOCKED_FIELDS.some(([, field]) => next[field] !== draft[field])) {
      onDraft(next)
    }
  }, [draft, isEntityMode, isFloating, isMeetingMode, locks, meetingId, objectType, onDraft, playerId, teamId])

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
