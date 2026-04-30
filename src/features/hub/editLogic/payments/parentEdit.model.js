// features/hub/editLogic/payments/parentEdit.model.js

export const safe = (value) => (value == null ? '' : String(value))
export const clean = (value) => safe(value).trim()

const buildParentId = (player, parent) => {
  const existing = clean(parent?.id)
  if (existing) return existing

  const playerKey =
    clean(player?.playerFirstName) ||
    clean(player?.playerLastName) ||
    clean(player?.playerShortName) ||
    clean(player?.name) ||
    'parent'

  return `${Date.now()}-${playerKey}`
}

export const buildParentEditInitial = (parent = {}) => {
  const source = parent?.raw || parent || {}

  return {
    id: clean(source?.id),
    parentRole: clean(source?.parentRole),
    parentName: clean(source?.parentName),
    parentEmail: clean(source?.parentEmail),
    parentPhone: clean(source?.parentPhone),
    raw: source,
  }
}

export const buildParentEditPatch = (draft = {}, initial = {}) => {
  const next = {}

  if (clean(draft?.parentRole) !== clean(initial?.parentRole)) {
    next.parentRole = clean(draft?.parentRole)
  }

  if (clean(draft?.parentName) !== clean(initial?.parentName)) {
    next.parentName = clean(draft?.parentName)
  }

  if (clean(draft?.parentEmail) !== clean(initial?.parentEmail)) {
    next.parentEmail = clean(draft?.parentEmail)
  }

  if (clean(draft?.parentPhone) !== clean(initial?.parentPhone)) {
    next.parentPhone = clean(draft?.parentPhone)
  }

  return next
}

export const isParentEditDirty = (draft = {}, initial = {}) => {
  return Object.keys(buildParentEditPatch(draft, initial)).length > 0
}

export const buildParentMeta = (parent = {}, player = {}) => {
  const playerName =
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    player?.playerShortName ||
    player?.name ||
    'שחקן'

  return [
    clean(parent?.parentName),
    clean(parent?.parentRole),
    playerName,
  ]
    .filter(Boolean)
    .join(' • ') || 'עריכת הורה'
}

export const buildParentsPlayerPatch = ({
  player,
  parents = [],
  draft,
  editingId = '',
}) => {
  const currentParents = Array.isArray(parents) ? parents : []
  const nextDraft = draft || {}
  const targetId = clean(editingId || nextDraft?.id || '')

  const normalized = {
    id: buildParentId(player, nextDraft),
    parentRole: clean(nextDraft?.parentRole),
    parentName: clean(nextDraft?.parentName),
    parentEmail: clean(nextDraft?.parentEmail),
    parentPhone: clean(nextDraft?.parentPhone),
  }

  const nextParents = [...currentParents]

  const existingIndex = targetId
    ? nextParents.findIndex((item) => clean(item?.id) === targetId)
    : -1

  if (existingIndex >= 0) {
    nextParents[existingIndex] = {
      ...nextParents[existingIndex],
      ...normalized,
      id: clean(nextParents[existingIndex]?.id || normalized.id),
    }
  } else {
    nextParents.push(normalized)
  }

  return {
    parents: nextParents.slice(0, 2),
  }
}

export const buildRemoveParentPlayerPatch = ({
  parents = [],
  parentId = '',
}) => {
  const id = clean(parentId)

  return {
    parents: (Array.isArray(parents) ? parents : []).filter((item) => {
      return clean(item?.id) !== id
    }),
  }
}

export const getCanCreateParent = (parents = []) => {
  return (Array.isArray(parents) ? parents.length : 0) < 2
}

export const getParentEditFieldErrors = (draft = {}) => {
  return {
    parentRole: !clean(draft?.parentRole),
    parentName: !clean(draft?.parentName),
    parentPhone: !clean(draft?.parentPhone),
  }
}

export const getIsParentEditValid = (draft = {}) => {
  return !Object.values(getParentEditFieldErrors(draft)).some(Boolean)
}
