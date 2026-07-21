// features/playersDatabase/services/write/shared/playerSeasonScope.js

import {
  cleanValue,
  pickFirstValue,
  toNumberOrZero,
} from '../../../model/value.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import {
  normalizeTeamIdentity,
  resolveBirthTeamDocumentId,
  resolveBirthTeamId,
  resolveBirthTeamSlot,
} from '../../../model/teamIdentity.model.js'

export {
  resolveBirthTeamDocumentId,
  resolveBirthTeamId,
  resolveBirthTeamSlot,
}

export const buildPlayerSeasonScope = ({
  season = {},
  team = {},
  row = {},
} = {}) => {
  const seasonIdentity = normalizeSeasonIdentity({
    season,
    fallback: row,
  })
  const teamIdentity = normalizeTeamIdentity({
    team,
    fallback: row,
  })

  return {
    ...seasonIdentity,
    leagueId: cleanValue(pickFirstValue(
      season.leagueId,
      team.leagueId,
      row.leagueId
    )),
    clubId: teamIdentity.clubId,
    ageGroupId: cleanValue(pickFirstValue(
      team.ageGroupId,
      row.ageGroupId
    )),
    ageGroupLabel: cleanValue(pickFirstValue(
      team.ageGroupLabel,
      row.ageGroupLabel
    )),
    birthYear: toNumberOrZero(pickFirstValue(
      season.birthYear,
      team.birthYear,
      row.birthYear
    )),
    birthTeamId: teamIdentity.birthTeamId,
    birthTeamDocumentId: teamIdentity.birthTeamDocumentId,
    birthTeamSlot: teamIdentity.birthTeamSlot,
  }
}

export const isSamePlayerSeasonScope = (row = {}, scope = {}) => {
  const rowScope = buildPlayerSeasonScope({ row })
  const targetScope = buildPlayerSeasonScope({
    season: scope,
    team: scope,
    row: scope,
  })

  if (!isSameSeason(rowScope, targetScope)) return false
  if (targetScope.leagueId && rowScope.leagueId !== targetScope.leagueId) return false
  if (targetScope.clubId && rowScope.clubId !== targetScope.clubId) return false
  if (targetScope.ageGroupId && rowScope.ageGroupId !== targetScope.ageGroupId) return false
  if (
    !targetScope.ageGroupId &&
    targetScope.ageGroupLabel &&
    rowScope.ageGroupLabel !== targetScope.ageGroupLabel
  ) return false
  if (
    targetScope.birthYear &&
    rowScope.birthYear &&
    rowScope.birthYear !== targetScope.birthYear
  ) return false

  const hasClubAndAgeScope = Boolean(
    targetScope.clubId &&
    (
      targetScope.ageGroupId ||
      targetScope.ageGroupLabel ||
      targetScope.birthYear
    )
  )

  if (
    !hasClubAndAgeScope &&
    targetScope.birthTeamId &&
    rowScope.birthTeamId !== targetScope.birthTeamId
  ) return false
  if (
    targetScope.birthTeamSlot &&
    rowScope.birthTeamSlot !== targetScope.birthTeamSlot
  ) return false

  return true
}
