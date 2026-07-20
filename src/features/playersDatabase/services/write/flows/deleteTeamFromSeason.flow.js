// features/playersDatabase/services/write/flows/deleteTeamFromSeason.flow.js

import {
  removeLeagueSeasonTeam,
} from '../leagues/index.js'
import {
  removePlayerSeasonDocsMany,
} from '../players/index.js'
import {
  deleteSearchIndexesForTeamSeason,
} from '../searchIndex/index.js'
import {
  removeTeamSeason,
} from '../teams/index.js'

export async function deleteTeamFromSeasonFlow(payload = {}) {
  const searchIndexResult = await deleteSearchIndexesForTeamSeason(payload)
  const playerSeasonDocsResult = await removePlayerSeasonDocsMany({
    ...payload,
    playerDocumentIds: searchIndexResult.playerDocumentIds,
  })
  const teamSeasonResult = await removeTeamSeason(payload)
  const leagueTableRankResult = await removeLeagueSeasonTeam(payload)

  return {
    leagueTableRankResult,
    teamSeasonResult,
    searchIndexResult,
    playerSeasonDocsResult,
    rowsCount: searchIndexResult.rowsCount,
  }
}
