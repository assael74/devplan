// playerProfile/sharedLogic/payments/parentDrawer.logic.js

function safeStr(value) {
  return value == null ? '' : String(value).trim()
}

function buildParentId(player, parent) {
  const existing = safeStr(parent?.id)
  if (existing) return existing

  const playerKey =
    safeStr(player?.playerFirstName) ||
    safeStr(player?.playerLastName) ||
    safeStr(player?.name) ||
    'parent'

  return `${Date.now()}-${playerKey}`
}

export function buildParentInitialDraft(parent) {
  const item = parent || null

  return {
    id: safeStr(item?.id),
    parentRole: safeStr(item?.parentRole),
    parentName: safeStr(item?.parentName),
    parentEmail: safeStr(item?.parentEmail),
    parentPhone: safeStr(item?.parentPhone),
    raw: item,
  }
}

export function buildParentPatch(draft, initial) {
  const next = draft || {}
  const base = initial || {}

  const patch = {}

  if (safeStr(next.parentRole) !== safeStr(base.parentRole)) {
    patch.parentRole = safeStr(next.parentRole)
  }

  if (safeStr(next.parentName) !== safeStr(base.parentName)) {
    patch.parentName = safeStr(next.parentName)
  }

  if (safeStr(next.parentEmail) !== safeStr(base.parentEmail)) {
    patch.parentEmail = safeStr(next.parentEmail)
  }

  if (safeStr(next.parentPhone) !== safeStr(base.parentPhone)) {
    patch.parentPhone = safeStr(next.parentPhone)
  }

  return patch
}

export function getIsParentDirty(draft, initial) {
  return Object.keys(buildParentPatch(draft, initial)).length > 0
}

export function buildParentMeta(parent, player) {
  const item = parent || {}
  const playerName =
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    player?.playerShortName ||
    player?.name ||
    'שחקן'

  const parts = [
    safeStr(item?.parentName),
    safeStr(item?.parentRole),
    playerName,
  ].filter(Boolean)

  return parts.join(' • ') || 'עריכת הורה'
}

export function buildParentsUpdatePatch({
  player,
  parents = [],
  draft,
  editingId = '',
}) {
  const currentParents = Array.isArray(parents) ? parents : []
  const nextDraft = draft || {}
  const targetId = safeStr(editingId || nextDraft?.id || '')
  const normalized = {
    id: buildParentId(player, nextDraft),
    parentRole: safeStr(nextDraft.parentRole),
    parentName: safeStr(nextDraft.parentName),
    parentEmail: safeStr(nextDraft.parentEmail),
    parentPhone: safeStr(nextDraft.parentPhone),
  }

  const nextParents = [...currentParents]
  const existingIndex = targetId
    ? nextParents.findIndex((item) => safeStr(item?.id) === targetId)
    : -1

  if (existingIndex >= 0) {
    nextParents[existingIndex] = {
      ...nextParents[existingIndex],
      ...normalized,
      id: safeStr(nextParents[existingIndex]?.id || normalized.id),
    }
  } else {
    nextParents.push(normalized)
  }

  return {
    parents: nextParents.slice(0, 2),
  }
}

export function getCanCreateParent(parents = []) {
  return (Array.isArray(parents) ? parents.length : 0) < 2
}
