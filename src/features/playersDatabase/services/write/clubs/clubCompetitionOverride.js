import { normalizeManualCompetitionProjection } from '../../../domain/projections/club/index.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import {
  readClubDocument,
  upsertClubDocument,
} from './clubDoc.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import {
  CLUB_PROJECTION_STAGE,
  buildClubProjectionCompletion,
  buildClubProjectionRecoveryScope,
} from './projectionCompletion.js'

const clean = cleanValue

const isActive = status => clean(status).toLowerCase() === 'active'

const buildNotAllowedResult = ({ reason, recoveryScope }) => ({
  status: 'not_allowed',
  allowed: false,
  reason,
  canonicalCommitted: false,
  projectionsCompleted: false,
  recoveryRequired: false,
  completed: false,
  recoveryScope,
})

export const validateClubCompetitionManualTarget = ({
  club = {},
  birthYear = 0,
  seasonKey = '',
  teamId = '',
  leagueId = '',
} = {}) => {
  const resolvedBirthYear = Number(birthYear) || 0
  const resolvedSeasonKey = clean(seasonKey)
  const resolvedTeamId = clean(teamId)
  const resolvedLeagueId = clean(leagueId)
  const ageGroups = Array.isArray(club?.ageGroups) ? club.ageGroups : []

  const ageGroup = ageGroups.find(group => (
    (Array.isArray(group?.seasons) ? group.seasons : []).some(season => (
      clean(season?.seasonKey || season?.seasonId) === resolvedSeasonKey &&
      clean(season?.teamId) === resolvedTeamId &&
      clean(season?.league?.leagueId) === resolvedLeagueId
    ))
  ))
  const clubSeason = (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).find(season => (
    clean(season?.seasonKey || season?.seasonId) === resolvedSeasonKey &&
    clean(season?.teamId) === resolvedTeamId &&
    clean(season?.league?.leagueId) === resolvedLeagueId
  ))

  if (!clubSeason) return { allowed: false, reason: 'clubSeasonOrLeagueMissing' }
  if (Number(clubSeason?.birthYear) !== resolvedBirthYear) {
    return { allowed: false, reason: 'birthYearMismatch' }
  }
  if (!isActive(clubSeason?.seasonStatus)) {
    return { allowed: false, reason: 'seasonNotActive' }
  }

  const path = (Array.isArray(club?.competitionPaths) ? club.competitionPaths : []).find(item => (
    Number(item?.birthYear) === resolvedBirthYear
  ))
  const competitionSeason = (Array.isArray(path?.seasons) ? path.seasons : []).find(item => (
    clean(item?.seasonKey || item?.seasonId) === resolvedSeasonKey &&
    clean(item?.teamId) === resolvedTeamId &&
    clean(item?.ageGroupId) === clean(ageGroup?.ageGroupId) &&
    clean(item?.leagueId) === resolvedLeagueId
  ))

  if (!competitionSeason) return { allowed: false, reason: 'competitionProjectionMissing' }
  if (!isActive(competitionSeason?.seasonStatus)) {
    return { allowed: false, reason: 'competitionSeasonNotActive' }
  }

  return {
    allowed: true,
    ageGroupId: clean(ageGroup?.ageGroupId),
    clubSeason,
    competitionSeason,
  }
}

const buildOverrideError = ({ cause, stage, completion, recoveryScope, results }) => {
  const error = cause instanceof Error
    ? cause
    : new Error(String(cause?.message || 'Club competition override failed'))

  error.name = 'ClubCompetitionOverrideError'
  error.stage = stage
  error.completion = completion
  error.recoveryScope = recoveryScope
  error.results = results
  return error
}

export async function setClubCompetitionManualProjection({
  clubId = '',
  birthYear = 0,
  seasonKey = '',
  teamId = '',
  leagueId = '',
  manualProjection = null,
  projectionVersion = 1,
  lastWriteAction = 'SET_CLUB_COMPETITION_MANUAL_PROJECTION',
} = {}) {
  const resolvedClubId = clean(clubId)
  const resolvedBirthYear = Number(birthYear) || 0
  const resolvedSeasonKey = clean(seasonKey)
  const resolvedTeamId = clean(teamId)
  const resolvedLeagueId = clean(leagueId)

  if (!resolvedClubId) throw new Error('Missing club id')
  if (!resolvedBirthYear) throw new Error('Missing birth year')
  if (!resolvedSeasonKey) throw new Error('Missing season key')
  if (!resolvedTeamId) throw new Error('Missing team id')
  if (!resolvedLeagueId) throw new Error('Missing league id')

  const normalizedManual = manualProjection === null
    ? null
    : normalizeManualCompetitionProjection(manualProjection)

  if (manualProjection !== null && !normalizedManual) {
    throw new Error('Invalid manual competition projection')
  }

  const recoveryScope = buildClubProjectionRecoveryScope({
    clubId: resolvedClubId,
    seasonKey: resolvedSeasonKey,
    teamId: resolvedTeamId,
    birthYear: resolvedBirthYear,
  })

  let clubResult = null
  let masterResult = null

  const clubRead = await readClubDocument({ clubId: resolvedClubId })
  if (!clubRead.exists) {
    return buildNotAllowedResult({ reason: 'clubMissing', recoveryScope })
  }

  const target = validateClubCompetitionManualTarget({
    club: clubRead.club,
    birthYear: resolvedBirthYear,
    seasonKey: resolvedSeasonKey,
    teamId: resolvedTeamId,
    leagueId: resolvedLeagueId,
  })
  if (!target.allowed) return buildNotAllowedResult({
    reason: target.reason,
    recoveryScope,
  })

  try {
    clubResult = await upsertClubDocument({
      clubIdentity: { clubId: resolvedClubId },
      competitionPathUpdate: {
        birthYear: resolvedBirthYear,
        season: {
          teamId: resolvedTeamId,
          seasonKey: resolvedSeasonKey,
          seasonStatus: target.competitionSeason.seasonStatus,
          ageGroupId: target.ageGroupId,
          leagueId: resolvedLeagueId,
          competitionProjection: {
            manual: normalizedManual,
          },
        },
      },
      propagateCompetitionFromBirthYear: resolvedBirthYear,
      propagateCompetitionSeasonKey: resolvedSeasonKey,
      propagateCompetitionTeamId: resolvedTeamId,
      requiredCompetitionTarget: {
        birthYear: resolvedBirthYear,
        seasonKey: resolvedSeasonKey,
        teamId: resolvedTeamId,
        leagueId: resolvedLeagueId,
        ageGroupId: target.ageGroupId,
      },
      projectionVersion,
      lastWriteAction,
    })
  } catch (cause) {
    throw buildOverrideError({
      cause,
      stage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
      completion: buildClubProjectionCompletion({
        canonicalCommitted: false,
        clubDocumentCompleted: false,
        clubsMasterCompleted: false,
        errorStage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
      }),
      recoveryScope,
      results: { club: clubResult, master: masterResult },
    })
  }

  try {
    masterResult = await syncClubsMasterDocument({
      clubIds: [resolvedClubId],
      projectionVersion,
      lastWriteAction,
    })
  } catch (cause) {
    throw buildOverrideError({
      cause,
      stage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
      completion: buildClubProjectionCompletion({
        canonicalCommitted: true,
        clubDocumentCompleted: true,
        clubsMasterCompleted: false,
        errorStage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
      }),
      recoveryScope,
      results: { club: clubResult, master: masterResult },
    })
  }

  return {
    ...buildClubProjectionCompletion({
      canonicalCommitted: true,
      clubDocumentCompleted: true,
      clubsMasterCompleted: true,
    }),
    recoveryScope,
    results: {
      club: clubResult,
      master: masterResult,
    },
  }
}
