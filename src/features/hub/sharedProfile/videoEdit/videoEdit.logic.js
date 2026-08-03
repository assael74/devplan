// src/features/hub/sharedProfile/videoEdit/videoEdit.logic.js

const safe = value => (value == null ? '' : String(value).trim())

const normalizeIds = value =>
  (Array.isArray(value) ? value : [])
    .map(item => safe(item))
    .filter(Boolean)

const normalizeIdsKey = value => normalizeIds(value).sort().join('|')

const normalizeValue = value => (value == null ? '' : String(value))

export const VIDEO_EDIT_DRAWER_MODE = {
  ANALYSIS_EDIT: 'analysisEdit',
  ATTACH: 'attach',
}

export function getIsAttachMode(mode) {
  return mode === VIDEO_EDIT_DRAWER_MODE.ATTACH
}

function buildYm(year, month) {
  const safeYear = normalizeValue(year)
  const safeMonth = normalizeValue(month)

  if (!safeYear || !safeMonth) return ''

  return `${safeYear}-${String(safeMonth).padStart(2, '0')}`
}

function buildAttachInitial(video = {}) {
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

function buildEditInitial(video = {}) {
  return {
    id: video?.id || '',
    name: video?.name || video?.title || '',
    notes: video?.notes || video?.description || '',
    tagIds: normalizeIds(video?.tagIds || video?.tags),
    raw: video || {},
  }
}

export function buildInitial({ mode, video }) {
  return getIsAttachMode(mode)
    ? buildAttachInitial(video)
    : buildEditInitial(video)
}

function buildAttachPatch(draft = {}, initial = {}) {
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

  fields.forEach(field => {
    const next = normalizeValue(draft?.[field])
    const previous = normalizeValue(initial?.[field])

    if (next !== previous) {
      patch[field] = draft?.[field] || ''
    }
  })

  const nextYm = buildYm(draft?.year, draft?.month) || safe(draft?.ym)
  const previousYm = safe(initial?.ym)

  if (nextYm && nextYm !== previousYm) {
    patch.ym = nextYm
  }

  return patch
}

function buildEditPatch(draft = {}, initial = {}) {
  const patch = {}
  const nextName = safe(draft?.name)
  const previousName = safe(initial?.name)
  const nextNotes = safe(draft?.notes)
  const previousNotes = safe(initial?.notes)

  if (nextName !== previousName) patch.name = nextName
  if (nextNotes !== previousNotes) patch.notes = nextNotes

  if (normalizeIdsKey(draft?.tagIds) !== normalizeIdsKey(initial?.tagIds)) {
    patch.tagIds = normalizeIds(draft?.tagIds)
  }

  return patch
}

export function buildPatch({ mode, draft, initial }) {
  return getIsAttachMode(mode)
    ? buildAttachPatch(draft, initial)
    : buildEditPatch(draft, initial)
}

export function getIsDirty({ mode, draft, initial }) {
  return Object.keys(buildPatch({ mode, draft, initial })).length > 0
}

export function getIsValid({ mode, draft }) {
  if (!draft?.id) return false

  if (!getIsAttachMode(mode)) {
    return safe(draft?.name).length > 0
  }

  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)

  if (!contextType || !objectType) return false
  if (contextType === 'meeting' && !safe(draft?.meetingId)) return false
  if (contextType !== 'entity') return true
  if (objectType === 'player') return Boolean(safe(draft?.playerId))
  if (objectType === 'team') return Boolean(safe(draft?.teamId))

  return false
}

export function getAttachModes(draft = {}) {
  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)
  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'

  return {
    isMeetingMode,
    isEntityMode,
    disabled: {
      disableObjectType: !contextType,
      disableMeeting: !isMeetingMode,
      disablePlayer: !isEntityMode || objectType !== 'player',
      disableTeam: !isEntityMode || objectType !== 'team',
    },
  }
}

export function getStatus({ isValid, saving, isDirty, mode }) {
  if (!isValid) {
    return {
      text: getIsAttachMode(mode)
        ? 'יש להשלים שיוך וידאו'
        : 'יש להשלים שם וידאו',
      color: 'warning',
    }
  }

  if (saving) return { text: 'שומר עדכון...', color: 'primary' }
  if (isDirty) return { text: 'יש שינויים שלא נשמרו', color: 'danger' }

  return { text: 'אין שינויים', color: 'neutral' }
}

export function getSubline({ mode, draft }) {
  if (getIsAttachMode(mode)) {
    return [
      'שיוך מקצועי',
      draft?.contextType || '',
      draft?.objectType || '',
    ]
      .filter(Boolean)
      .join(' · ')
  }

  const tagsCount = Array.isArray(draft?.tagIds)
    ? draft.tagIds.length
    : 0

  return [
    'ניתוח וידאו',
    tagsCount ? `${tagsCount} תגים` : 'ללא תגים',
  ]
    .filter(Boolean)
    .join(' · ')
}
