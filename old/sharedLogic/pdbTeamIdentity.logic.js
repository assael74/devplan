// features/playersDatabase/sharedLogic/pdbTeamIdentity.logic.js

import { buildTeamIdentity } from '../catalog/teamIdentity.js'
import {
  clean,
  normalizeLooseText,
  normalizeText,
  sameClean,
  sameIfBoth,
} from './pdbText.logic.js'

export const buildTeamSlotId = row => [
  clean(row?.clubId),
  clean(row?.ageGroupId),
  Number(row?.teamSlot) || 1,
].filter(Boolean).join('_')

export const buildTeamSeasonKey = row => [
  clean(row?.clubId),
  clean(row?.seasonId),
  clean(row?.ageGroupId),
  Number(row?.teamSlot) || 1,
  clean(row?.leagueId),
].filter(Boolean).join('__')

export const withTeamIdentity = team => {
  const identity = buildTeamIdentity({
    clubId: team?.clubId,
    clubName: team?.clubName || team?.teamName,
    seasonId: team?.seasonId,
    ageGroupId: team?.ageGroupId,
    ageGroupLabel: team?.ageGroupLabel,
    teamSlot: team?.teamSlot,
    leagueId: team?.leagueId,
    leagueName: team?.leagueName,
    externalTeamId: team?.externalTeamId,
  })

  return {
    ...team,
    ...identity,
    teamSeasonKey: clean(team?.teamSeasonKey) || identity.teamSeasonKey,
    teamSlotId: clean(team?.teamSlotId || team?.teamId || team?.teamCatalogId) || identity.teamSlotId,
    teamId: clean(team?.teamId || team?.teamSlotId || team?.teamCatalogId) || identity.teamSlotId,
    teamCatalogId: clean(team?.teamCatalogId || team?.teamSlotId || team?.teamId) || identity.teamSlotId,
  }
}

export const getTeamCacheKey = team => {
  const teamCtx = withTeamIdentity(team || {})
  const primary = clean(teamCtx.teamSeasonKey)
  if (primary) return `season:${primary}`

  return [
    'team',
    clean(teamCtx.teamSlotId || teamCtx.teamId || teamCtx.teamCatalogId),
    clean(teamCtx.externalTeamId),
    clean(teamCtx.seasonId),
    clean(teamCtx.leagueId),
    clean(teamCtx.ageGroupId),
    clean(teamCtx.teamSlot),
    clean(teamCtx.clubId),
  ].join('|')
}

const namesOf = value => [
  value?.clubName,
  value?.teamName,
  value?.sourceTeamName,
].map(normalizeText).filter(Boolean)

export const hasSameTeamName = (a, b) => {
  const aNames = new Set(namesOf(a))
  if (namesOf(b).some(name => aNames.has(name))) return true

  const looseA = namesOf(a).map(normalizeLooseText)
  const looseB = namesOf(b).map(normalizeLooseText)

  return looseA.some(aName =>
    looseB.some(bName =>
      aName &&
      bName &&
      (aName === bName || aName.includes(bName) || bName.includes(aName))
    )
  )
}

export const findTeamIndexMatch = (teamsIndex = {}, row = {}) => {
  const teamSlotId = clean(row.teamSlotId) || buildTeamSlotId(row)
  const teamSeasonKey = clean(row.teamSeasonKey) || buildTeamSeasonKey(row)
  const indexRows = Object.entries(teamsIndex || {}).map(([key, value]) => ({
    key,
    ...(value || {}),
  }))
  const direct = teamsIndex[teamSeasonKey] || teamsIndex[teamSlotId]

  if (direct) {
    return {
      key: direct.key || teamSeasonKey,
      ...direct,
    }
  }

  return (
    indexRows.find(item => {
      if (!item) return false

      if (sameClean(item.key, teamSeasonKey)) return true
      if (sameClean(item.key, teamSlotId)) return true
      if (sameClean(item.teamSeasonKey, teamSeasonKey)) return true
      if (sameClean(item.teamSlotId, teamSlotId)) return true
      if (sameClean(item.externalTeamId, row.externalTeamId)) return true

      if (
        sameClean(item.teamSlotId, teamSlotId) ||
        sameClean(item.teamSeasonKey, teamSeasonKey)
      ) {
        return (
          sameIfBoth(item.seasonId, row.seasonId) &&
          sameIfBoth(item.ageGroupId, row.ageGroupId)
        )
      }

      if (
        sameClean(item.clubId, row.clubId) &&
        Number(item.teamSlot || 1) === Number(row.teamSlot || 1) &&
        sameIfBoth(item.seasonId, row.seasonId) &&
        sameIfBoth(item.ageGroupId, row.ageGroupId)
      ) {
        return true
      }

      return (
        sameClean(item.clubId, row.clubId) &&
        sameIfBoth(item.seasonId, row.seasonId) &&
        sameIfBoth(item.ageGroupId, row.ageGroupId)
      )
    }) ||
    indexRows.find(item => {
      if (!item) return false

      return (
        hasSameTeamName(item, row) &&
        Number(item.teamSlot || 1) === Number(row.teamSlot || 1) &&
        sameIfBoth(item.seasonId, row.seasonId) &&
        sameIfBoth(item.ageGroupId, row.ageGroupId)
      )
    }) ||
    {}
  )
}
