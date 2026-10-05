// src/features/playersDatabase/domain/league/leagueIdentity.js

import { buildTeamId } from '../identity/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const FIRESTORE_DOCUMENT_ID_FORBIDDEN = new Set(['.', '..'])

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

export const requireLeagueId = value => {
  const leagueId = clean(value)
  if (!leagueId) throw new Error('Missing leagueId')
  if (leagueId.includes('/') || FIRESTORE_DOCUMENT_ID_FORBIDDEN.has(leagueId)) {
    throw new Error('Invalid leagueId')
  }

  return leagueId
}

export const normalizeLeagueIdentity = ({
  leagueId = '',
  names = {},
  region = '',
  ageGroupId = '',
  ageGroupLabel = '',
  level = null,
} = {}) => ({
  leagueId: requireLeagueId(leagueId),
  names: {
    official: clean(names.official),
    display: clean(names.display),
    short: clean(names.short),
    source: clean(names.source),
  },
  region: clean(region),
  ageGroupId: clean(ageGroupId),
  ageGroupLabel: clean(ageGroupLabel),
  level: toNullableNumber(level),
})

export const resolveLeagueTeamId = ({ row = {}, birthYear = null } = {}) => {
  const clubId = clean(row.clubId)
  const teamId = buildTeamId({
    clubId,
    birthYear,
    teamSlot: row.teamSlot,
  })
  const suppliedTeamId = clean(row.teamId)

  if (suppliedTeamId && suppliedTeamId !== teamId) {
    throw new Error('Team id does not match canonical identity')
  }

  return teamId
}
