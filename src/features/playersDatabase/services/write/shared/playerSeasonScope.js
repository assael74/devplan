// src/features/playersDatabase/services/write/shared/playerSeasonScope.js

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

const resolveExplicitTeamSlot = ({
  team = {},
  row = {},
} = {}) => toNumberOrZero(pickFirstValue(
  team.birthTeamSlot,
  team.teamSlot,
  row.birthTeamSlot,
  row.teamSlot
))

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
    birthTeamSlot: resolveExplicitTeamSlot({
      team,
      row,
    }),
  }
}

const matchesExactTeamIdentity = ({
  rowScope,
  targetScope,
}) => {
  if (targetScope.birthTeamDocumentId) {
    return (
      rowScope.birthTeamDocumentId ===
      targetScope.birthTeamDocumentId
    )
  }

  if (targetScope.birthTeamId) {
    if (rowScope.birthTeamId !== targetScope.birthTeamId) {
      return false
    }

    if (
      targetScope.birthTeamSlot &&
      rowScope.birthTeamSlot !== targetScope.birthTeamSlot
    ) return false

    return true
  }

  return null
}

const matchesLegacyTeamIdentity = ({
  rowScope,
  targetScope,
}) => {
  if (
    targetScope.clubId &&
    rowScope.clubId !== targetScope.clubId
  ) return false

  if (
    targetScope.ageGroupId &&
    rowScope.ageGroupId !== targetScope.ageGroupId
  ) return false

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

  if (
    targetScope.birthTeamSlot &&
    rowScope.birthTeamSlot !== targetScope.birthTeamSlot
  ) return false

  return true
}

export const isSamePlayerSeasonScope = (row = {}, scope = {}) => {
  const rowScope = buildPlayerSeasonScope({ row })
  const targetScope = buildPlayerSeasonScope({
    season: scope,
    team: scope,
    row: scope,
  })

  if (!isSameSeason(rowScope, targetScope)) return false
  if (
    targetScope.leagueId &&
    rowScope.leagueId !== targetScope.leagueId
  ) return false

  const exactMatch = matchesExactTeamIdentity({
    rowScope,
    targetScope,
  })

  if (exactMatch !== null) return exactMatch

  return matchesLegacyTeamIdentity({
    rowScope,
    targetScope,
  })
}
