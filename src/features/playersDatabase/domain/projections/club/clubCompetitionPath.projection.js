// Competition projection state -> birth-year path projections. Pure builders.

import { cleanValue, toNumberOrZero } from '../../../model/shared/value.model.js'
import { normalizeSeasonStatus } from '../../../model/shared/season.model.js'
import {
  CLUB_COMPETITION_PROJECTION_SOURCE,
  CLUB_COMPETITION_STATUS,
  normalizeClubCompetitionProjectionSource,
  normalizeClubCompetitionStatus,
} from '../../contracts/club.contract.js'
import { buildCompetitionProjectionState } from './clubCompetition.projection.js'

const positiveNumberOrNull = value => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

export const buildClubCompetitionPathSeason = ({
  season = {},
  ageGroupId = '',
  league = {},
  team = {},
  automaticProjection = {},
  manualProjection = undefined,
  updatedAt = null,
} = {}) => {
  const projectionState = buildCompetitionProjectionState({
    automaticProjection,
    manualProjection: manualProjection === undefined ? null : manualProjection,
    seasonStatus: season?.seasonStatus,
  })
  const competitionProjection = manualProjection === undefined
    ? {
        automatic: projectionState.automatic,
        effective: projectionState.effective,
      }
    : projectionState

  return {
    teamId: cleanValue(team?.teamId),
    teamSlot: positiveNumberOrNull(
      team?.birthTeamSlot || team?.teamSlot || team?.identity?.birthTeamSlot || team?.identity?.teamSlot
    ),
    seasonId: cleanValue(season?.seasonId),
    seasonKey: cleanValue(season?.seasonKey),
    seasonStatus: normalizeSeasonStatus(season?.seasonStatus),
    ageGroupId: cleanValue(ageGroupId || league?.ageGroupId),
    leagueId: cleanValue(league?.leagueId || league?.id),
    leagueName: cleanValue(league?.leagueName || league?.name),
    leagueLevel: toNumberOrZero(league?.level) || null,
    competitionProjection,
    updatedAt,
  }
}

export const buildNextCompetitionPath = ({
  sourceBirthYear = 0,
  sourceTeamId = '',
  sourceTeamSlot = null,
  effectiveProjection = null,
  reason = null,
  updatedAt = null,
} = {}) => {
  if (!effectiveProjection) {
    return {
      sourceBirthYear: toNumberOrZero(sourceBirthYear),
      sourceTeamId: cleanValue(sourceTeamId),
      sourceTeamSlot: positiveNumberOrNull(sourceTeamSlot),
      projectedNextLeagueLevel: null,
      status: CLUB_COMPETITION_STATUS.UNKNOWN,
      source: CLUB_COMPETITION_PROJECTION_SOURCE.AUTOMATIC,
      reason: cleanValue(reason) || 'SOURCE_COHORT_NOT_LOADED',
      updatedAt,
    }
  }

  return {
    sourceBirthYear: toNumberOrZero(sourceBirthYear),
    sourceTeamId: cleanValue(sourceTeamId),
    sourceTeamSlot: positiveNumberOrNull(sourceTeamSlot),
    projectedNextLeagueLevel: Number(effectiveProjection?.projectedNextLeagueLevel) || null,
    status: normalizeClubCompetitionStatus(effectiveProjection?.status),
    source: normalizeClubCompetitionProjectionSource(effectiveProjection?.source),
    reason: cleanValue(reason) || null,
    updatedAt,
  }
}
