// features/playersDatabase/services/write/flows/deleteLeagueSeason.flow.js

import {
  removeLeagueSeason,
} from '../leagues/index.js'
import {
  removePlayerSeasonDocsMany,
} from '../players/index.js'
import {
  deleteSearchIndexesForLeagueSeason,
} from '../searchIndex/index.js'
import {
  removeTeamSeason,
} from '../teams/index.js'

export async function deleteLeagueSeasonFlow(payload = {}) {
  const searchIndexResult = await deleteSearchIndexesForLeagueSeason(payload)
  const playerSeasonDocsResult = await removePlayerSeasonDocsMany({
    ...payload,
    playerDocumentIds: searchIndexResult.playerDocumentIds,
  })
  const teamSeasonResults = []

  for (const teamDocumentId of searchIndexResult.teamDocumentIds || []) {
    teamSeasonResults.push(await removeTeamSeason({
      ...payload,
      team: {
        ...(payload.team || {}),
        teamId: teamDocumentId,
        teamDocumentId,
      },
    }))
  }

  const leagueSeasonResult = await removeLeagueSeason(payload)

  return {
    leagueSeasonResult,
    searchIndexResult,
    playerSeasonDocsResult,
    teamSeasonResults,
    rowsCount: searchIndexResult.rowsCount,
  }
}
