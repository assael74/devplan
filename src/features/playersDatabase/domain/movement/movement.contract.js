// features/playersDatabase/domain/movement/movement.contract.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const ROSTER_IMPORT_MODE = Object.freeze({
  AUTHORITATIVE_SNAPSHOT: 'AUTHORITATIVE_SNAPSHOT',
  PATCH: 'PATCH',
})

export const MOVEMENT_TIMING = Object.freeze({
  BETWEEN_SEASONS: 'BETWEEN_SEASONS',
  IN_SEASON: 'IN_SEASON',
  UNKNOWN: 'UNKNOWN',
})

export const COUNTERPART_RECONCILIATION = Object.freeze({
  COMPLETE: 'complete',
  NO_OP: 'no_op',
  CONFLICT: 'conflict',
  FAILED: 'failed',
  NOT_FOUND: 'not_found',
  NOT_REQUIRED: 'not_required',
})

// Club level 1 is the strongest level. A movement direction is derived from
// the two canonical club levels; it is never a manual UI decision.
export const resolveMovementDirection = ({
  fromClubId = '',
  toClubId = '',
  fromClubLevel = 0,
  toClubLevel = 0,
  fromBirthTeamSlot = 1,
  toBirthTeamSlot = 1,
} = {}) => {
  const fromSlot = Number(fromBirthTeamSlot)
  const toSlot = Number(toBirthTeamSlot)

  // An internal move remains a real movement. Team slots are the canonical
  // hierarchy inside one Club and therefore determine its direction.
  if (clean(fromClubId) && clean(fromClubId) === clean(toClubId)) {
    if (Number.isFinite(fromSlot) && Number.isFinite(toSlot) && fromSlot > 0 && toSlot > 0) {
      if (toSlot < fromSlot) return 'up'
      if (toSlot > fromSlot) return 'down'
    }
  }

  const from = Number(fromClubLevel)
  const to = Number(toClubLevel)

  // Club rank can compare primary teams only. A second/third Team Root of a
  // different club may compete at another level, so it remains unresolved
  // until a Team-level comparison contract is agreed.
  if (
    clean(fromClubId) &&
    clean(toClubId) &&
    clean(fromClubId) !== clean(toClubId) &&
    Number(toBirthTeamSlot) > 1
  ) {
    return 'unknown'
  }

  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0 || to <= 0) {
    return 'unknown'
  }

  if (to < from) return 'up'
  if (to > from) return 'down'
  return 'lateral'
}

export const normalizeRosterImport = value => {
  const source = value && typeof value === 'object' ? value : {}
  const mode = clean(source.mode) === ROSTER_IMPORT_MODE.PATCH
    ? ROSTER_IMPORT_MODE.PATCH
    : ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT

  return {
    mode,
    sourceSnapshotKey: clean(source.sourceSnapshotKey),
    contentHash: clean(source.contentHash),
    effectiveAt: clean(source.effectiveAt) || null,
  }
}

export const createEmptyMovementState = () => ({
  transfersIn: [],
  transfersOut: [],
  pendingPlayers: [],
  resolvedRosterAbsences: [],
})

const hashText = value => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36)
}

export const buildRosterSnapshotContentHash = ({
  seasonKey = '',
  birthTeamDocumentId = '',
  players = [],
} = {}) => {
  const playerKeys = (Array.isArray(players) ? players : [])
    .map(player => [
      clean(player.externalPlayerId),
      clean(player.fullName).toLowerCase(),
    ].filter(Boolean).join(':'))
    .sort()

  const payload = [
    clean(birthTeamDocumentId),
    clean(seasonKey),
    ...playerKeys,
  ].join('|')

  return payload
    ? `roster_${hashText(payload)}`
    : ''
}

export const buildRosterSnapshotEventKey = ({
  contentHash = '',
  eventNonce = '',
} = {}) => {
  const nonce = clean(eventNonce) || (
    typeof window !== 'undefined' && typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`
  )

  return ['snapshot', clean(contentHash) || 'empty', nonce]
    .filter(Boolean)
    .join('__')
}
