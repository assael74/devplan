// features/playersDatabase/model/playerIdentity.model.js

import {
  cleanValue,
  pickFirstValue,
} from './value.model.js'

export const normalizePlayerNameValue = value => cleanValue(value)
  .replace(/[.״"׳']/g, '')
  .replace(/\s+/g, ' ')
  .toLowerCase()

export const normalizePlayerIdPart = value => normalizePlayerNameValue(value)
  .replace(/[^0-9a-zA-Z\u0590-\u05FF]+/g, '_')
  .replace(/^_+|_+$/g, '')




export const resolvePlayerIdentityBirthYear = ({
  player = {},
  season = {},
} = {}) => {
  const seasonBirthYear = Number(season.birthYear)
  const isYounger = Boolean(
    player.isYoungerAgeGroup ||
    cleanValue(player.rosterStatus) === 'youngerAgeGroup'
  )

  if (isYounger && Number.isFinite(seasonBirthYear) && seasonBirthYear > 0) {
    return seasonBirthYear + 1
  }

  const directYear = Number(
    pickFirstValue(
      player.identityBirthYear,
      player.birthYear
    )
  )
  if (Number.isFinite(directYear) && directYear > 0) return directYear

  if (!Number.isFinite(seasonBirthYear) || seasonBirthYear <= 0) return 0

  return isYounger ? seasonBirthYear + 1 : seasonBirthYear
}

const createUuid = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const createInternalPlayerId = birthYear => [
  'player',
  cleanValue(birthYear),
  createUuid(),
]
  .map(normalizePlayerIdPart)
  .filter(Boolean)
  .join('__')

export const buildPlayerIdentityKey = ({
  player = {},
  season = {},
  birthYear = '',
  normalizedName = '',
  fullName = '',
} = {}) => {
  const year = cleanValue(
    birthYear || resolvePlayerIdentityBirthYear({
      player,
      season,
    })
  )
  const name = normalizePlayerIdPart(
    normalizedName ||
    fullName ||
    player.normalizedName ||
    resolvePlayerDisplayName(player)
  )

  return year && name ? `${year}__${name}` : ''
}

export const isValidExternalPlayerId = ({
  externalPlayerId = '',
  birthYear = '',
} = {}) => {
  const externalId = cleanValue(externalPlayerId)
  const year = cleanValue(birthYear)

  if (!externalId) return false
  if (!/^\d{5,}$/.test(externalId)) return false
  if (externalId === year) return false
  if (/^(19|20)\d{2}$/.test(externalId)) return false

  return true
}

export const resolvePlayerDisplayName = player => cleanValue(
  pickFirstValue(
    player?.matchedPlayerName,
    player?.fullName,
    player?.displayName
  )
)

export const resolvePlayerDocumentId = player => cleanValue(
  player?.playerDocumentId
)

export const resolveExternalPlayerId = player => cleanValue(
  player?.externalPlayerId
)

export const resolveInternalPlayerId = player => cleanValue(
  pickFirstValue(
    player?.matchedPlayerId,
    player?.playerId
  )
)

export const isInternalPlayerId = value => /^player__/.test(cleanValue(value))

export const isCanonicalPlayerDocumentId = value => (
  /^(?:external|name)__(?:.+)$/.test(cleanValue(value))
)

export const buildPlayerDocumentId = (player = {}) => {
  const externalPlayerId = resolveExternalPlayerId(player)
  if (isValidExternalPlayerId({
    externalPlayerId,
    birthYear: player?.birthYear,
  })) {
    return `external__${normalizePlayerIdPart(externalPlayerId)}`
  }

  const existingDocumentId = resolvePlayerDocumentId(player)
  if (isCanonicalPlayerDocumentId(existingDocumentId)) {
    return existingDocumentId
  }

  const normalizedName = normalizePlayerNameValue(
    pickFirstValue(player.normalizedName, player.fullName)
  )

  return normalizedName
    ? `name__${normalizePlayerIdPart(normalizedName)}`
    : ''
}

export const resolveWritablePlayerDocumentId = player => (
  buildPlayerDocumentId(player)
)

export const resolvePlayerOptionValue = player => cleanValue(
  pickFirstValue(
    player?.playerDocumentId,
    player?.playerId,
    player?.externalPlayerId,
    player?.fullName
  )
)

export const buildPlayerNameVariants = value => {
  const normalizedName = normalizePlayerNameValue(value)
  const parts = normalizedName.split(' ').filter(Boolean)
  const variants = new Set()

  if (normalizedName) variants.add(normalizedName)

  if (parts.length === 2) {
    variants.add(`${parts[1]} ${parts[0]}`)
  }

  if (parts.length >= 3 && parts.length <= 4) {
    variants.add([...parts].reverse().join(' '))
    variants.add([...parts.slice(1), parts[0]].join(' '))
    variants.add([parts[parts.length - 1], ...parts.slice(0, -1)].join(' '))
  }

  if (parts.length === 4) {
    variants.add([...parts.slice(2), ...parts.slice(0, 2)].join(' '))
  }

  return variants
}

const cleanAliasList = aliases => (
  Array.isArray(aliases) ? aliases : []
)
  .map(cleanValue)
  .filter(Boolean)

export const buildPlayerMatchValues = player => [
  player?.matchedPlayerId,
  player?.playerId,
  player?.externalPlayerId,
  player?.playerDocumentId,
  player?.id,
  player?.matchedPlayerName,
  player?.originalFullName,
  player?.normalizedName,
  player?.fullName,
  ...cleanAliasList(player?.aliases),
]
  .map(cleanValue)
  .filter(Boolean)

export const normalizePlayerIdentity = (player = {}) => ({
  playerDocumentId: buildPlayerDocumentId(player),
  playerId: resolveInternalPlayerId(player),
  externalPlayerId: resolveExternalPlayerId(player),
  fullName: resolvePlayerDisplayName(player),
  normalizedName: normalizePlayerNameValue(
    pickFirstValue(
      player.normalizedName,
      resolvePlayerDisplayName(player)
    )
  ),
})
