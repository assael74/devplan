// src/features/playersDatabase/domain/identity/teamIdentity.js

import { requireSeasonId } from './seasonIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requirePositiveInteger = (value, fieldName) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`Invalid ${fieldName}`)
  }

  return number
}

export const buildTeamId = ({
  clubId = '',
  birthYear = null,
  teamSlot = null,
} = {}) => {
  const safeClubId = clean(clubId)
  if (!safeClubId) throw new Error('Missing clubId')

  const safeBirthYear = requirePositiveInteger(birthYear, 'birthYear')
  const safeTeamSlot = requirePositiveInteger(teamSlot, 'teamSlot')

  return `${safeClubId}_${safeBirthYear}_${safeTeamSlot}`
}

export const buildTeamSeasonDocumentId = ({
  teamId = '',
  seasonId = '',
} = {}) => {
  const safeTeamId = clean(teamId)
  if (!safeTeamId) throw new Error('Missing teamId')

  return `${safeTeamId}__${requireSeasonId(seasonId)}`
}
