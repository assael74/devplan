// src/shared/abilities/abilities.resolvers.js

export function safeStr(v) {
  return String(v ?? '').trim()
}

export function safeNum(v, fallback = null) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function isPlainObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function getAbilitiesObject(entity = {}) {
  if (isPlainObject(entity?.abilitiesState?.abilities)) return entity.abilitiesState.abilities

  return null
}

function getAbilitiesArray(entity = {}) {
  if (Array.isArray(entity?.abilitiesState?.abilities)) return entity.abilitiesState.abilities

  return []
}

function mapAbilitiesArrayToObject(arr = []) {
  const out = {}

  for (const item of arr) {
    const id = safeStr(item?.id || item?.abilityId || item?.key)
    if (!id) continue

    const value = item?.value
    out[id] = value == null ? null : safeNum(value, null)
  }

  return out
}

export function resolvePlayerAbilitiesMap(entity = {}) {
  if (isPlainObject(entity?.abilitiesState?.abilities)) {
    return entity.abilitiesState.abilities
  }

  if (Array.isArray(entity?.abilitiesState?.abilities)) {
    return mapAbilitiesArrayToObject(entity.abilitiesState.abilities)
  }

  return {}
}

export function resolvePlayerDomainScores(entity = {}) {
  return isPlainObject(entity?.abilitiesState?.domains?.scores) ? entity.abilitiesState.domains.scores : {}
}

export function resolvePlayerDomainPotentialScores(entity = {}) {
  return isPlainObject(entity?.abilitiesState?.domainPotentialScores) ? entity.abilitiesState.domainPotentialScores : {}
}

export function resolvePlayerDomainsMeta(entity = {}) {
  return Array.isArray(entity?.abilitiesState?.domains?.meta) ? entity.abilitiesState.domains.meta : []
}

export function resolvePlayerLevel(entity = {}) {
  const n = safeNum(entity?.level, null)
  return n != null && n > 0 ? n : null
}

export function resolvePlayerPotential(entity = {}) {
  const n = safeNum(entity?.levelPotential, null)
  return n != null && n > 0 ? n : null
}

export function resolvePlayerReliability(entity = {}) {
  return isPlainObject(entity?.abilitiesState?.reliability) ? entity.abilitiesState?.reliability : {}
}

export function resolvePlayerCoverage(entity = {}) {
  return isPlainObject(entity?.abilitiesState?.evaluation?.coverage) ? entity.abilitiesState.evaluation.coverage : {}
}

export function resolvePlayerValidDomainsCount(entity = {}) {
  return isPlainObject(entity?.abilitiesState?.evaluation?.validDomainsCount) ? entity.abilitiesState.evaluation.validDomainsCount : {}
}

export function resolvePlayerEvaluation(entity = {}) {
  return isPlainObject(entity?.abilitiesState?.evaluation) ? entity.abilitiesState.evaluation : {}
}

export function resolvePlayerWindows(entity = {}) {
  return Array.isArray(entity?.abilitiesState?.windows) ? entity.abilitiesState.windows : []
}

export function resolvePlayerFullName(player = {}) {
  return (
    safeStr(player?.playerFullName) ||
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    safeStr(player?.fullName) ||
    safeStr(player?.name) ||
    'ללא שם'
  )
}

export function resolveTeamPlayers(entity = {}, context = {}) {
  const direct =
    entity?.teamPlayers ||
    entity?.players ||
    entity?.squad ||
    entity?.playersList ||
    []

  if (Array.isArray(direct) && direct.length) {
    return direct.filter(Boolean)
  }

  const allPlayers = Array.isArray(context?.players) ? context.players : []
  const teamId = safeStr(entity?.id || entity?.teamId)

  if (!teamId) return []

  return allPlayers.filter((player) => safeStr(player?.teamId) === teamId)
}
