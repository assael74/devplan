// features/playersDatabase/services/write/flows/league/deleteLeagueSeason.flow.js

import {
  getLeagueSeasonDeleteDependencies,
  getLeagueSeasonTeams,
  removeLeagueSeason,
  syncLeaguesMasterDocument,
} from '../../leagues/index.js'
import {
  removeClubProjectionsForLeagueSeason,
  removeLeagueClubSeasonIdentityIndex,
} from '../../clubs/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'

const buildBlockedDeleteError = validation => {
  const error = new Error('League season has linked data and cannot be deleted')

  error.name = 'LeagueSeasonNotEmptyError'
  error.code = 'league-season-not-empty'
  error.stage = 'validateLeagueSeasonDelete'
  error.validation = validation
  error.dependencies = validation.dependencies

  return error
}

export async function deleteLeagueSeasonFlow(payload = {}) {
  const results = {}
  let canonicalCommitted = false
  let stage = 'getLeagueSeasonDeleteDependencies'

  try {
    const validation = await getLeagueSeasonDeleteDependencies(payload)
    results.validation = validation

    if (!validation.seasonExists) {
      return {
        syncStatus: 'complete',
        canonicalCommitted: true,
        projectionsCompleted: true,
        recoveryRequired: false,
        completed: true,
        validation,
        leagueSeasonResult: {
          leagueId: validation.leagueId,
          seasonId: validation.seasonId,
          seasonKey: validation.seasonKey,
          removed: false,
          reason: validation.leagueExists
            ? 'leagueSeasonMissing'
            : 'leagueDocMissing',
        },
      }
    }

    if (!validation.canDelete) throw buildBlockedDeleteError(validation)

    stage = 'getLeagueSeasonTeams'
    const leagueSeasonSnapshot = await getLeagueSeasonTeams(payload)
    results.leagueSeasonSnapshot = leagueSeasonSnapshot

    stage = 'removeLeagueSeason'
    const leagueSeasonResult = await removeLeagueSeason({
      ...payload,
      syncMaster: false,
    })
    results.leagueSeasonResult = leagueSeasonResult
    canonicalCommitted = true

    stage = 'removeClubSeasonIdentityIndex'
    results.clubSeasonIdentityIndex = await removeLeagueClubSeasonIdentityIndex({
      league: payload.league || {},
      season: payload.season || {},
      lastWriteAction: 'DELETE_LEAGUE_SEASON',
    })

    stage = 'removeClubProjectionsForLeagueSeason'
    const clubProjectionsResult = await removeClubProjectionsForLeagueSeason({
      league: payload.league || {},
      season: payload.season || {},
      teams: leagueSeasonSnapshot.teams || [],
      canonicalCommitted,
      lastWriteAction: 'DELETE_LEAGUE_SEASON',
    })
    results.clubProjectionsResult = clubProjectionsResult

    stage = 'syncLeaguesMasterDocument'
    const masterResult = await syncLeaguesMasterDocument({
      leagues: leagueSeasonResult.removedLeagueDocument ? [] : [payload.league || {}],
      removedLeagueIds: leagueSeasonResult.removedLeagueDocument
        ? [leagueSeasonResult.leagueId]
        : [],
    })
    results.masterResult = masterResult

    return {
      syncStatus: 'complete',
      canonicalCommitted,
      projectionsCompleted: Boolean(clubProjectionsResult.projectionsCompleted),
      recoveryRequired: false,
      completed: Boolean(clubProjectionsResult.completed),
      validation,
      leagueSeasonResult,
      clubProjectionsResult,
      masterResult,
    }
  } catch (error) {
    if (canonicalCommitted) {
      error.canonicalCommitted = true
      error.projectionsCompleted = false
      error.recoveryRequired = true
      error.completed = false
    }
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: 'deleteLeagueSeason',
    })
  }
}
