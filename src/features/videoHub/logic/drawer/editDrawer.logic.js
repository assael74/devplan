// src/features/videoHub/logic/drawer/editDrawer.logic.js

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from '../../logic/drawer/videoEdit.logic.js'

export const VIDEO_EDIT_DRAWER_MODE = {
  GENERAL_EDIT: 'generalEdit',
  ANALYSIS_EDIT: 'analysisEdit',
  ATTACH: 'attach',
}

export const ALL_VIDEO_EDIT_DRAWER_MODES = Object.values(VIDEO_EDIT_DRAWER_MODE)

export function safe(value) {
  return value == null ? '' : String(value).trim()
}

export function getIsAttachMode(mode) {
  return mode === VIDEO_EDIT_DRAWER_MODE.ATTACH
}

export function getEntityKey(mode, entityType) {
  if (getIsAttachMode(mode) || entityType === 'analysis') return 'videoAnalysis'
  return 'videoGeneral'
}

export function getRunEntityType(mode, entityType) {
  if (getIsAttachMode(mode) || entityType === 'analysis') return 'analysis'
  return 'general'
}

export function getLifecycleEntityType(mode, entityType) {
  if (getIsAttachMode(mode) || entityType === 'analysis') return 'videoAnalysis'
  return 'video'
}

export function getTitleIconId(mode, entityType) {
  if (getIsAttachMode(mode)) return 'link'
  if (entityType === 'analysis') return 'videoAnalysis'
  return 'videoGeneral'
}

export function getTitlePrefix(mode, entityType) {
  if (getIsAttachMode(mode)) return 'שיוך וידאו'
  if (entityType === 'analysis') return 'עריכת ניתוח וידאו'
  return 'עריכת וידאו'
}

export function getSection(mode, entityType) {
  if (getIsAttachMode(mode)) return 'videoAttachDrawer'
  if (entityType === 'analysis') return 'videoEditDrawer'
  return 'videoGeneralEditDrawer'
}

export function getVideoTitle(video, fallback = 'וידאו') {
  return video?.name || video?.title || fallback
}

function normalizeId(value) {
  return value == null ? '' : String(value)
}

function normalizeNumberLike(value) {
  if (value == null || value === '') return ''
  return String(value)
}

export function buildYm(year, month) {
  const y = normalizeNumberLike(year)
  const m = normalizeNumberLike(month)

  if (!y || !m) return ''

  return `${y}-${String(m).padStart(2, '0')}`
}

export function buildAttachInitialDraft(video = {}) {
  return {
    id: video?.id || '',
    name: video?.name || video?.title || '',
    contextType: video?.contextType || '',
    objectType: video?.objectType || '',
    clubId: video?.clubId || '',
    teamId: video?.teamId || '',
    playerId: video?.playerId || '',
    meetingId: video?.meetingId || '',
    year: video?.year || '',
    month: video?.month || '',
    ym: video?.ym || '',
    raw: video || {},
  }
}

export function buildAttachPatch(draft = {}, initial = {}) {
  const patch = {}

  const fields = [
    'contextType',
    'objectType',
    'clubId',
    'teamId',
    'playerId',
    'meetingId',
    'year',
    'month',
  ]

  fields.forEach((field) => {
    const next = normalizeId(draft?.[field])
    const prev = normalizeId(initial?.[field])

    if (next !== prev) {
      patch[field] = draft?.[field] || ''
    }
  })

  const nextYm = buildYm(draft?.year, draft?.month) || safe(draft?.ym)
  const prevYm = safe(initial?.ym)

  if (nextYm && nextYm !== prevYm) {
    patch.ym = nextYm
  }

  return patch
}

export function getAttachIsDirty(draft, initial) {
  return Object.keys(buildAttachPatch(draft, initial)).length > 0
}

export function getAttachModes(draft = {}) {
  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)

  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'

  const disabled = {
    disableObjectType: !contextType,
    disableMeeting: !isMeetingMode,
    disablePlayer: !isEntityMode || objectType !== 'player',
    disableTeam: !isEntityMode || objectType !== 'team',
  }

  return {
    isMeetingMode,
    isEntityMode,
    disabled,
  }
}

export function getEditValidity(draft = {}) {
  return {
    id: !!draft?.id,
    name: safe(draft?.name).length > 0,
  }
}

export function getAttachValidity(draft = {}) {
  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)

  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'

  if (!draft?.id) return false
  if (!contextType) return false
  if (!objectType) return false

  if (isMeetingMode && !safe(draft?.meetingId)) return false
  if (isEntityMode && objectType === 'player' && !safe(draft?.playerId)) return false
  if (isEntityMode && objectType === 'team' && !safe(draft?.teamId)) return false

  return true
}

export function getDrawerStatus({ isValid, saving, isDirty, mode }) {
  if (!isValid) {
    return {
      text: getIsAttachMode(mode) ? 'יש להשלים שיוך וידאו' : 'יש להשלים שם וידאו',
      color: 'warning',
    }
  }

  if (saving) {
    return { text: 'שומר עדכון...', color: 'primary' }
  }

  if (isDirty) {
    return { text: 'יש שינויים שלא נשמרו', color: 'danger' }
  }

  return { text: 'אין שינויים', color: 'neutral' }
}

export function getDrawerSubline({ mode, entityType, draft }) {
  if (getIsAttachMode(mode)) {
    return [
      'שיוך מקצועי',
      draft?.contextType || '',
      draft?.objectType || '',
    ]
      .filter(Boolean)
      .join(' · ')
  }

  const typeLabel = entityType === 'analysis' ? 'ניתוח וידאו' : 'וידאו כללי'
  const tagsCount = Array.isArray(draft?.tagIds) ? draft.tagIds.length : 0

  return [
    typeLabel,
    tagsCount ? `${tagsCount} תגים` : 'ללא תגים',
  ]
    .filter(Boolean)
    .join(' · ')
}

export function buildVideoEditInitialDraft({ mode, video }) {
  if (getIsAttachMode(mode)) return buildAttachInitialDraft(video)
  return buildInitialDraft(video)
}

export function buildVideoEditPatch({ mode, draft, initial }) {
  if (getIsAttachMode(mode)) return buildAttachPatch(draft, initial)
  return buildPatch(draft, initial)
}

export function getVideoEditIsDirty({ mode, draft, initial }) {
  if (getIsAttachMode(mode)) return getAttachIsDirty(draft, initial)
  return getIsDirty(draft, initial)
}

export function getVideoEditIsValid({ mode, draft }) {
  if (getIsAttachMode(mode)) return getAttachValidity(draft)

  const validity = getEditValidity(draft)
  return validity.id && validity.name
}
