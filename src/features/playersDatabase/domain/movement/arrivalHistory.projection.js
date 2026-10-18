// src/features/playersDatabase/domain/movement/arrivalHistory.projection.js

import { buildTeamSeasonDocumentId } from '../identity/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export const previousSeasonId = seasonId => {
  const match = /^(\d{4})_(\d{4})$/.exec(clean(seasonId))
  if (!match) return ''
  return `${Number(match[1]) - 1}_${Number(match[2]) - 1}`
}

export const arrivalSourceDocumentId = ({ teamId, seasonId }) => {
  const priorSeasonId = previousSeasonId(seasonId)
  return clean(teamId) && priorSeasonId
    ? buildTeamSeasonDocumentId({ teamId, seasonId: priorSeasonId })
    : ''
}

export const buildArrivalHistory = ({
  movementId,
  playerId,
  fromTeamId,
  seasonId,
  sourceTeamSeason = null,
  updatedAt = null,
}) => {
  const sourceDocumentId = arrivalSourceDocumentId({ teamId: fromTeamId, seasonId })
  const source = object(sourceTeamSeason)
  const identity = object(source.identity)
  const hasPlayer = Boolean(
    object(object(source.roster).playersById)[playerId] ||
    object(object(source.stats).playersById)[playerId] ||
    object(object(source.scouting).playersById)[playerId]
  )
  const sourceMatches = sourceDocumentId && hasPlayer &&
    clean(identity.teamSeasonDocumentId) === sourceDocumentId &&
    clean(identity.teamId) === clean(fromTeamId) &&
    clean(identity.seasonId) === previousSeasonId(seasonId)
  const stats = object(object(source.stats).playersById)[playerId]
  const scout = object(object(source.scouting).playersById)[playerId]
  const primary = object(scout && scout.primary)
  const line = clean(object(stats && stats.lineClassification).line)
  const profileId = clean(primary.profileId)
  const professionalProfileIds = Array.isArray(scout && scout.professionalProfileIds)
    ? scout.professionalProfileIds.map(clean).filter(Boolean)
    : []
  const preliminaryProfileIds = Array.isArray(scout && scout.preliminaryProfileIds)
    ? scout.preliminaryProfileIds.map(clean).filter(Boolean)
    : []

  return {
    movementId: clean(movementId),
    playerId: clean(playerId),
    sourceTeamSeasonDocumentId: sourceDocumentId,
    sourceSeasonId: previousSeasonId(seasonId),
    sourceUpdatedAt: sourceMatches ? object(source.timestamps).updatedAt || null : null,
    sourceStatus: sourceMatches ? 'available' : 'missing',
    scoutStatus: sourceMatches && (profileId || professionalProfileIds.length || preliminaryProfileIds.length)
      ? 'available' : sourceMatches ? 'none' : 'unknown',
    primaryProfileId: sourceMatches ? profileId : '',
    primaryProfileDepthPct: sourceMatches && primary.strengthDepthPct !== undefined
      ? primary.strengthDepthPct
      : null,
    professionalProfileIds: sourceMatches ? professionalProfileIds : [],
    preliminaryProfileIds: sourceMatches ? preliminaryProfileIds : [],
    profileDepthsById: sourceMatches ? object(scout && scout.profileDepthsById) : {},
    lineStatus: sourceMatches && line ? 'available' : sourceMatches ? 'none' : 'unknown',
    line: sourceMatches ? line : '',
    updatedAt: updatedAt || null,
  }
}
