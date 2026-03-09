// videoHub/components/analysis/attachDrawer/videoAttachDrawer.logic.js
import { useMemo } from 'react'
import { getVideoModes, getVideoDisabled } from '../../../../../ui/forms/helpers/videoForm.helpers.js'
import { VIDEOANALYSIS_OBJECTTYPES } from '../../../../../shared/videoAnalysis/videoAnalysis.constants.js'

const clean = (v) => String(v ?? '').trim()

export function buildOriginal(video) {
  const v = video || {}
  return {
    contextType: v.contextType || '',
    objectType: v.objectType || '',
    meetingId: v.meetingId || null,
    teamId: v.teamId || null,
    playerId: v.playerId || null,
    year: v.year || '',
    month: v.month || '',
    name: v.name || '',
  }
}

export function useAttachDrawerModel({ draft, context, locks }) {
  const hasContext = !!context

  const modes = useMemo(() => getVideoModes(draft.contextType), [draft.contextType])
  const disabled = useMemo(
    () => getVideoDisabled(draft.contextType, draft.objectType, hasContext, locks),
    [draft.contextType, draft.objectType, hasContext, locks]
  )

  const objectTypeOptions = useMemo(() => {
    if (draft.contextType === 'meeting') return VIDEOANALYSIS_OBJECTTYPES.filter((o) => o.id === 'meeting')
    if (draft.contextType === 'entity') return VIDEOANALYSIS_OBJECTTYPES.filter((o) => o.id === 'player' || o.id === 'team')
    return VIDEOANALYSIS_OBJECTTYPES
  }, [draft.contextType])

  return { ...modes, disabled, objectTypeOptions }
}

export function applyLocks(draft, locks) {
  const expected = locks?.expected || {}
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

  return { next, changed }
}

export function sanitizeByMode(draft, { isMeetingMode, isEntityMode, isFloating }) {
  const { contextType, objectType, meetingId, teamId, playerId } = draft

  if (isMeetingMode) {
    if (objectType !== 'meeting' || teamId || playerId) {
      return { ...draft, objectType: 'meeting', teamId: null, playerId: null }
    }
    return draft
  }

  if (isEntityMode) {
    if (meetingId) return { ...draft, meetingId: null }
    if (!objectType || objectType === 'meeting') return { ...draft, objectType: 'player', teamId: null, playerId: null }
    if (objectType === 'player' && teamId) return { ...draft, teamId: null }
    if (objectType === 'team' && playerId) return { ...draft, playerId: null }
    return draft
  }

  if (isFloating) {
    if (objectType || meetingId || teamId || playerId) {
      return { ...draft, objectType: '', meetingId: null, teamId: null, playerId: null }
    }
  }

  return draft
}

export function isValidDraft(draft, { isMeetingMode, isEntityMode, isFloating }) {
  const okContext = !!clean(draft.contextType)
  if (!okContext) return false

  if (isFloating) return true
  if (isMeetingMode) return !!clean(draft.meetingId)

  if (!isEntityMode) return false

  const okObject = !!clean(draft.objectType) && draft.objectType !== 'meeting'
  if (!okObject) return false
  if (draft.objectType === 'player') return !!clean(draft.playerId)
  if (draft.objectType === 'team') return !!clean(draft.teamId)
  return false
}

export function isDirty(draft, original) {
  return (
    draft.contextType !== original.contextType ||
    draft.objectType !== original.objectType ||
    (draft.meetingId || '') !== (original.meetingId || '') ||
    (draft.teamId || '') !== (original.teamId || '') ||
    (draft.playerId || '') !== (original.playerId || '') ||
    (draft.year || '') !== (original.year || '') ||
    (draft.month || '') !== (original.month || '') ||
    (draft.name || '') !== (original.name || '')
  )
}

export function buildPatch(draft) {
  return {
    contextType: draft.contextType || '',
    objectType: draft.objectType || '',
    meetingId: draft.meetingId || null,
    teamId: draft.teamId || null,
    playerId: draft.playerId || null,
    name: draft.name || '',
    year: draft.year || '',
    month: draft.month || '',
  }
}
