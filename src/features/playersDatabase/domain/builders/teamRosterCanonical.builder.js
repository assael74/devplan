import {
  buildTeamSeasonDocumentId,
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../../model/team/teamIdentity.model.js'
import { normalizeSeasonStatus } from '../../model/shared/season.model.js'
import {
  cleanValue,
  pickFirstValue,
  toNumberOrZero,
} from '../../model/shared/value.model.js'

const buildSeasonIndexEntry = ({ birthTeamDocumentId = '', season = {} } = {}) => {
  const seasonKey = cleanValue(season.seasonKey || season.seasonId)
  const seasonDocumentId = buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey)

  if (!seasonKey || !seasonDocumentId) return null

  return {
    seasonKey,
    seasonDocumentId,
    seasonStatus: normalizeSeasonStatus(season.seasonStatus),
  }
}

export const buildRosterTeamRoot = ({
  team = {},
  currentData = {},
  persistedSeason = {},
  createdAt = null,
  updatedAt = null,
} = {}) => {
  const identity = normalizeTeamIdentity({
    team,
    fallback: currentData,
  })
  const birthTeamDocumentId = cleanValue(
    identity.birthTeamDocumentId || resolveTeamLookupKey(team)
  )

  if (!birthTeamDocumentId) throw new Error('Missing birth team id')

  const entriesBySeasonKey = new Map()
  ;(Array.isArray(currentData.seasons) ? currentData.seasons : []).forEach(entry => {
    const normalized = buildSeasonIndexEntry({
      birthTeamDocumentId,
      season: entry,
    })
    if (normalized) entriesBySeasonKey.set(normalized.seasonKey, normalized)
  })

  const approvedEntry = buildSeasonIndexEntry({
    birthTeamDocumentId,
    season: persistedSeason,
  })
  if (!approvedEntry) throw new Error('Missing approved roster season identity')
  entriesBySeasonKey.set(approvedEntry.seasonKey, approvedEntry)

  return {
    id: birthTeamDocumentId,
    clubId: identity.clubId,
    birthTeamId: cleanValue(identity.birthTeamId || birthTeamDocumentId),
    birthTeamDocumentId,
    birthYear: toNumberOrZero(pickFirstValue(team.birthYear, currentData.birthYear)),
    birthTeamSlot: identity.birthTeamSlot,
    displayName: cleanValue(pickFirstValue(
      team.displayName,
      team.teamName,
      currentData.displayName
    )),
    seasons: [...entriesBySeasonKey.values()],
    createdAt: currentData.createdAt || createdAt,
    updatedAt,
  }
}

export const buildApprovedRosterCanonicalState = ({
  team = {},
  persistedSeason = {},
} = {}) => {
  const birthTeamDocumentId = cleanValue(
    persistedSeason.birthTeamDocumentId ||
    persistedSeason.birthTeamId ||
    resolveTeamLookupKey(team)
  )
  const seasonKey = cleanValue(persistedSeason.seasonKey || persistedSeason.seasonId)
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(
    birthTeamDocumentId,
    seasonKey
  )

  if (!birthTeamDocumentId || !seasonKey || !teamSeasonDocumentId) {
    throw new Error('Missing approved roster canonical identity')
  }

  return {
    birthTeamDocumentId,
    seasonKey,
    teamSeasonDocumentId,
    persistedSeason: {
      ...persistedSeason,
      id: teamSeasonDocumentId,
      birthTeamDocumentId,
      birthTeamId: cleanValue(
        persistedSeason.birthTeamId || birthTeamDocumentId
      ),
    },
  }
}
