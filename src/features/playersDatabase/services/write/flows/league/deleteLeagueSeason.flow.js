// features/playersDatabase/services/write/flows/league/deleteLeagueSeason.flow.js

import {
  getLeagueSeasonDeleteDependencies,
  removeLeagueSeason,
} from '../../leagues/index.js'

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
  const validation = await getLeagueSeasonDeleteDependencies(payload)

  if (!validation.seasonExists) {
    return {
      syncStatus: 'complete',
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

  if (!validation.canDelete) {
    throw buildBlockedDeleteError(validation)
  }

  const leagueSeasonResult = await removeLeagueSeason(payload)

  return {
    syncStatus: 'complete',
    validation,
    leagueSeasonResult,
  }
}
