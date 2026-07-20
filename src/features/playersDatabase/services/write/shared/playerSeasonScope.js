// features/playersDatabase/services/write/shared/playerSeasonScope.js

import { buildSeasonKey, clean, toNumberOrZero } from '../leagues/leagueDoc.js'

export const resolveBirthTeamId = (team = {}) =>
  clean(team.birthTeamId || team.teamId)

export const resolveBirthTeamDocumentId = (team = {}) => {
  const birthTeamId = resolveBirthTeamId(team)

  return clean(team.birthTeamDocumentId || team.teamDocumentId || birthTeamId)
}

export const resolveBirthTeamSlot = (team = {}) =>
  toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1

export const buildPlayerSeasonScope = ({
  season = {},
  team = {},
  row = {},
} = {}) => {
  const rawSeasonId = clean(season.seasonId || row.seasonId)
  const seasonKey = clean(season.seasonKey || row.seasonKey) || buildSeasonKey(rawSeasonId)
  const birthTeamId = clean(
    team.birthTeamId ||
    team.teamId ||
    row.birthTeamId ||
    row.teamId
  )
  const birthTeamDocumentId = clean(
    team.birthTeamDocumentId ||
    team.teamDocumentId ||
    row.birthTeamDocumentId ||
    row.teamDocumentId ||
    birthTeamId
  )
  const birthTeamSlot = toNumberOrZero(
    team.birthTeamSlot ||
    team.teamSlot ||
    row.birthTeamSlot ||
    row.teamSlot
  ) || 1

  return {
    seasonId: rawSeasonId || seasonKey,
    seasonKey,
    leagueId: clean(season.leagueId || team.leagueId || row.leagueId),
    birthTeamId,
    birthTeamDocumentId,
    birthTeamSlot,
  }
}

export const isSamePlayerSeasonScope = (row = {}, scope = {}) => {
  const rowScope = buildPlayerSeasonScope({ row })
  const targetScope = buildPlayerSeasonScope({
    season: scope,
    team: scope,
    row: scope,
  })
  const sameSeason = Boolean(
    (targetScope.seasonKey && rowScope.seasonKey === targetScope.seasonKey) ||
    (targetScope.seasonId && rowScope.seasonId === targetScope.seasonId)
  )

  if (!sameSeason) return false
  if (targetScope.leagueId && rowScope.leagueId !== targetScope.leagueId) return false
  if (targetScope.birthTeamId && rowScope.birthTeamId !== targetScope.birthTeamId) return false
  if (targetScope.birthTeamSlot && rowScope.birthTeamSlot !== targetScope.birthTeamSlot) return false

  return true
}
