// src/features/playersDatabase/domain/identity/playerIdentity.js

import { requireSeasonId } from './seasonIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requirePositiveInteger = (value, fieldName) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`Invalid ${fieldName}`)
  }

  return number
}

const requireExternalPlayerId = value => {
  const externalPlayerId = clean(value)
  if (!/^\d{5,}$/.test(externalPlayerId)) {
    throw new Error('Invalid externalPlayerId')
  }

  return externalPlayerId
}

export const buildPlayerId = ({
  birthYear = null,
  externalPlayerId = '',
} = {}) => {
  const safeBirthYear = requirePositiveInteger(birthYear, 'birthYear')
  const safeExternalPlayerId = requireExternalPlayerId(externalPlayerId)

  if (safeExternalPlayerId === String(safeBirthYear)) {
    throw new Error('Invalid externalPlayerId')
  }

  return `player__${safeBirthYear}__${safeExternalPlayerId}`
}

export const buildPlayerSeasonDocumentId = ({
  playerId = '',
  seasonId = '',
} = {}) => {
  const safePlayerId = clean(playerId)
  if (!safePlayerId) throw new Error('Missing playerId')

  return `playerSeason__${safePlayerId}__${requireSeasonId(seasonId)}`
}
