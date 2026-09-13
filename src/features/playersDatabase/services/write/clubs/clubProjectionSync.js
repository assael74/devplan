// features/playersDatabase/services/write/clubs/clubProjectionSync.js

import {
  removeClubDocumentAgeGroupSeasonProjections,
  upsertClubDocument,
} from './clubDoc.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import {
  CLUB_PROJECTION_STAGE,
  buildClubProjectionCompletion,
  buildClubProjectionRecoveryScope,
} from './projectionCompletion.js'

const buildProjectionError = ({ cause, stage, completion, recoveryScope, results }) => {
  const error = cause instanceof Error
    ? cause
    : new Error(String(cause?.message || 'Club projection sync failed'))

  error.name = 'ClubProjectionSyncError'
  error.stage = stage
  error.completion = completion
  error.recoveryScope = recoveryScope
  error.results = results

  return error
}

export async function syncClubProjectionPersistence({
  canonicalCommitted = false,
  clubIdentity = {},
  ageGroupSeasonProjection = null,
  competitionPathUpdate = null,
  competitionPathUpdates = [],
  propagateCompetitionFromBirthYear = 0,
  propagateCompetitionSeasonKey = '',
  propagateCompetitionTeamId = '',
  projectionVersion = 1,
  lastWriteAction = '',
  recoveryScope = {},
  syncMaster = true,
} = {}) {
  const scope = buildClubProjectionRecoveryScope({
    clubId: clubIdentity?.clubId || clubIdentity?.id,
    ageGroupId: ageGroupSeasonProjection?.ageGroupId || recoveryScope?.ageGroupId,
    seasonKey: ageGroupSeasonProjection?.season?.seasonKey || recoveryScope?.seasonKey,
    teamId: ageGroupSeasonProjection?.season?.teamId || recoveryScope?.teamId,
    birthYear: competitionPathUpdate?.birthYear ||
      competitionPathUpdates?.[0]?.birthYear ||
      ageGroupSeasonProjection?.season?.birthYear ||
      recoveryScope?.birthYear,
  })

  let clubResult = null
  let masterResult = null

  try {
    clubResult = await upsertClubDocument({
      clubIdentity,
      ageGroupSeasonProjection,
      competitionPathUpdate,
      competitionPathUpdates,
      propagateCompetitionFromBirthYear,
      propagateCompetitionSeasonKey,
      propagateCompetitionTeamId,
      projectionVersion,
      lastWriteAction,
    })
  } catch (cause) {
    const completion = buildClubProjectionCompletion({
      canonicalCommitted,
      clubDocumentCompleted: false,
      clubsMasterCompleted: false,
      errorStage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
    })

    throw buildProjectionError({
      cause,
      stage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
      completion,
      recoveryScope: scope,
      results: { club: clubResult, master: masterResult },
    })
  }

  if (!syncMaster) {
    return {
      canonicalCommitted: Boolean(canonicalCommitted),
      projectionsCompleted: false,
      clubDocumentCompleted: true,
      clubsMasterCompleted: false,
      recoveryRequired: false,
      completed: false,
      masterDeferred: true,
      recoveryScope: scope,
      results: {
        club: clubResult,
        master: null,
      },
    }
  }

  try {
    masterResult = await syncClubsMasterDocument({
      clubIds: [clubResult.clubId],
      projectionVersion,
      lastWriteAction,
    })
  } catch (cause) {
    const completion = buildClubProjectionCompletion({
      canonicalCommitted,
      clubDocumentCompleted: true,
      clubsMasterCompleted: false,
      errorStage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
    })

    throw buildProjectionError({
      cause,
      stage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
      completion,
      recoveryScope: scope,
      results: { club: clubResult, master: masterResult },
    })
  }

  return {
    ...buildClubProjectionCompletion({
      canonicalCommitted,
      clubDocumentCompleted: true,
      clubsMasterCompleted: true,
    }),
    recoveryScope: scope,
    results: {
      club: clubResult,
      master: masterResult,
    },
  }
}

export async function recoverClubProjectionPersistence({
  failedStage = '',
  canonicalCommitted = true,
  clubId = '',
  clubIdentity = {},
  ageGroupSeasonProjection = null,
  competitionPathUpdate = null,
  competitionPathUpdates = [],
  propagateCompetitionFromBirthYear = 0,
  propagateCompetitionSeasonKey = '',
  propagateCompetitionTeamId = '',
  projectionVersion = 1,
  lastWriteAction = '',
  recoveryScope = {},
} = {}) {
  const resolvedClubId = String(
    clubId || clubIdentity?.clubId || clubIdentity?.id || recoveryScope?.clubId || ''
  ).trim()

  if (failedStage === CLUB_PROJECTION_STAGE.CLUBS_MASTER) {
    if (!resolvedClubId) throw new Error('Missing club id for Clubs Master recovery')

    const masterResult = await syncClubsMasterDocument({
      clubIds: [resolvedClubId],
      projectionVersion,
      lastWriteAction,
    })

    return {
      ...buildClubProjectionCompletion({
        canonicalCommitted,
        clubDocumentCompleted: true,
        clubsMasterCompleted: true,
      }),
      recoveryScope: buildClubProjectionRecoveryScope({
        ...recoveryScope,
        clubId: resolvedClubId,
      }),
      recoveredStage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
      results: {
        club: null,
        master: masterResult,
      },
    }
  }

  return syncClubProjectionPersistence({
    canonicalCommitted,
    clubIdentity: {
      ...clubIdentity,
      ...(resolvedClubId ? { clubId: resolvedClubId } : {}),
    },
    ageGroupSeasonProjection,
    competitionPathUpdate,
    competitionPathUpdates,
    propagateCompetitionFromBirthYear,
    propagateCompetitionSeasonKey,
    propagateCompetitionTeamId,
    projectionVersion,
    lastWriteAction,
    recoveryScope,
  })
}

export async function removeClubProjectionsForLeagueSeason({
  league = {},
  season = {},
  teams = [],
  canonicalCommitted = false,
  projectionVersion = 1,
  lastWriteAction = '',
} = {}) {
  const safeTeams = Array.isArray(teams) ? teams : []
  if (!safeTeams.length) {
    return {
      ...buildClubProjectionCompletion({
        canonicalCommitted,
        clubDocumentCompleted: true,
        clubsMasterCompleted: true,
      }),
      clubIds: [],
      results: { clubs: [], master: null },
    }
  }

  const leagueId = cleanValue(league?.id || league?.leagueId || season?.leagueId)
  const seasonKey = cleanValue(season?.seasonKey || season?.seasonId)
  const ageGroupId = cleanValue(league?.ageGroupId || season?.ageGroupId)
  if (!leagueId || !seasonKey || !ageGroupId) {
    throw new Error('Missing league, season, or age group identity for Club projection cleanup')
  }

  const removalsByClub = new Map()
  ;safeTeams.forEach(team => {
    const clubId = cleanValue(team?.clubId)
    const teamId = cleanValue(team?.teamId)
    if (!clubId || !teamId) {
      throw new Error('Missing club id or team id for Club projection cleanup')
    }

    const removals = removalsByClub.get(clubId) || []
    removals.push({
      ageGroupId,
      seasonKey,
      teamId,
      leagueId,
    })
    removalsByClub.set(clubId, removals)
  })

  const clubIds = [...removalsByClub.keys()]
  const clubResults = []
  try {
    for (const clubId of clubIds) {
      clubResults.push(await removeClubDocumentAgeGroupSeasonProjections({
        clubId,
        removals: removalsByClub.get(clubId),
        projectionVersion,
        lastWriteAction,
      }))
    }
  } catch (cause) {
    const completion = buildClubProjectionCompletion({
      canonicalCommitted,
      clubDocumentCompleted: false,
      clubsMasterCompleted: false,
      errorStage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
    })
    throw buildProjectionError({
      cause,
      stage: CLUB_PROJECTION_STAGE.CLUB_DOCUMENT,
      completion,
      recoveryScope: { leagueId, seasonKey, ageGroupId, clubIds },
      results: { clubs: clubResults, master: null },
    })
  }

  try {
    const masterResult = clubIds.length
      ? await syncClubsMasterDocument({
          clubIds,
          projectionVersion,
          lastWriteAction,
        })
      : null
    return {
      ...buildClubProjectionCompletion({
        canonicalCommitted,
        clubDocumentCompleted: true,
        clubsMasterCompleted: true,
      }),
      clubIds,
      results: { clubs: clubResults, master: masterResult },
    }
  } catch (cause) {
    const completion = buildClubProjectionCompletion({
      canonicalCommitted,
      clubDocumentCompleted: true,
      clubsMasterCompleted: false,
      errorStage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
    })
    throw buildProjectionError({
      cause,
      stage: CLUB_PROJECTION_STAGE.CLUBS_MASTER,
      completion,
      recoveryScope: { leagueId, seasonKey, ageGroupId, clubIds },
      results: { clubs: clubResults, master: null },
    })
  }
}
