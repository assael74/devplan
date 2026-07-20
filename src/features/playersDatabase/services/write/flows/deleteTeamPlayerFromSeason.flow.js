// features/playersDatabase/services/write/flows/deleteTeamPlayerFromSeason.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankTeamUrl,
} from '../leagues/index.js'
import {
  removePlayerSeasonDocsMany,
} from '../players/index.js'
import {
  deleteSearchIndexForTeamPlayerSeason,
  updateTeamSeasonSearchIndexRosterMeta,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../searchIndex/index.js'
import {
  removeTeamPlayerFromSeason,
} from '../teams/index.js'

export async function deleteTeamPlayerFromSeasonFlow(payload = {}) {
  const player = payload.player || {}
  const searchIndexResult = await deleteSearchIndexForTeamPlayerSeason({
    ...payload,
    player,
  })
  const playerSeasonDocsResult = await removePlayerSeasonDocsMany({
    ...payload,
    playerDocumentIds: searchIndexResult.playerDocumentIds,
  })
  const teamPlayerResult = await removeTeamPlayerFromSeason({
    ...payload,
    player,
  })
  const teamWithRosterMeta = {
    ...(payload.team || {}),
    playersCount: teamPlayerResult.playersCount,
  }
  const leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
    ...payload,
    team: teamWithRosterMeta,
  })
  const leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary({
    ...payload,
    team: payload.team || {},
    scoutProfilesSummary: teamPlayerResult.scoutProfilesSummary,
  })
  const teamSeasonIndexResult = await updateTeamSeasonSearchIndexRosterMeta({
    ...payload,
    team: teamWithRosterMeta,
    playersCount: teamPlayerResult.playersCount,
    playerSeasonIndexCount: searchIndexResult.remainingRowsCount,
    scoutProfiledPlayersCount: teamPlayerResult.scoutProfilesSummary.total,
  })
  const teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
    ...payload,
    team: payload.team || {},
    scoutProfilesSummary: teamPlayerResult.scoutProfilesSummary,
  })

  return {
    searchIndexResult,
    playerSeasonDocsResult,
    teamPlayerResult,
    leagueTableRankResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexResult,
    teamSeasonIndexScoutProfilesResult,
    rowsCount: searchIndexResult.rowsCount,
  }
}
