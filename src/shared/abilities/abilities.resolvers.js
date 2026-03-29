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
  if (isPlainObject(entity?.abilities)) return entity.abilities
  if (isPlainObject(entity?.playerAbilities)) return entity.playerAbilities
  if (isPlainObject(entity?.playersAbilities)) return entity.playersAbilities
  if (isPlainObject(entity?.playerAbilitiesValues)) return entity.playerAbilitiesValues
  return null
}

function getAbilitiesArray(entity = {}) {
  if (Array.isArray(entity?.playersAbilities)) return entity.playersAbilities
  if (Array.isArray(entity?.abilities)) return entity.abilities
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
  const obj = getAbilitiesObject(entity)
  if (obj) return obj
  return mapAbilitiesArrayToObject(getAbilitiesArray(entity))
}

export function resolvePlayerDomainScores(entity = {}) {
  return isPlainObject(entity?.domainScores) ? entity.domainScores : {}
}

export function resolvePlayerDomainsMeta(entity = {}) {
  return Array.isArray(entity?.domainsMeta) ? entity.domainsMeta : []
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
  return isPlainObject(entity?.reliability) ? entity.reliability : {}
}

export function resolvePlayerCoverage(entity = {}) {
  return isPlainObject(entity?.coverage) ? entity.coverage : {}
}

export function resolvePlayerValidDomainsCount(entity = {}) {
  return isPlainObject(entity?.validDomainsCount) ? entity.validDomainsCount : {}
}

export function resolvePlayerSnapshotsMeta(entity = {}) {
  return isPlainObject(entity?.snapshotsMeta) ? entity.snapshotsMeta : {}
}

export function resolvePlayerWindows(entity = {}) {
  return Array.isArray(entity?.windows) ? entity.windows : []
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
