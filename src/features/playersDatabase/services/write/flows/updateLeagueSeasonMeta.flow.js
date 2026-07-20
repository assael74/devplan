// features/playersDatabase/services/write/flows/updateLeagueSeasonMeta.flow.js

import {
  updateLeagueSeasonMeta,
} from '../leagues/index.js'
import {
  updatePlayerSeasonSearchIndexesSeasonMeta,
  updateTeamSeasonSearchIndexesSeasonMeta,
} from '../searchIndex/index.js'
import {
  updateTeamSeasonsMetaMany,
} from '../teams/index.js'

export async function updateLeagueSeasonMetaFlow(payload = {}) {
  const season = {
    ...(payload.season || {}),
    birthYear: payload.birthYear ?? payload.season?.birthYear,
    leagueTotalRound: payload.leagueTotalRound ?? payload.season?.leagueTotalRound,
  }
  const metaPayload = {
    ...payload,
    season,
    birthYear: season.birthYear,
    leagueTotalRound: season.leagueTotalRound,
  }
  const leagueSeasonResult = await updateLeagueSeasonMeta(metaPayload)
  const teamSeasonsResult = await updateTeamSeasonsMetaMany(metaPayload)
  const teamSeasonIndexResult = await updateTeamSeasonSearchIndexesSeasonMeta(metaPayload)
  const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexesSeasonMeta(metaPayload)

  return {
    leagueSeasonResult,
    teamSeasonsResult,
    teamSeasonIndexResult,
    playerSeasonIndexResult,
    rowsCount: teamSeasonIndexResult.rowsCount + playerSeasonIndexResult.rowsCount,
  }
}
