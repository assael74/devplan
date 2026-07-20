// features/playersDatabase/services/write/flows/pasteTeamPlayers.flow.js

import {
  updateLeagueSeasonTableRankTeamUrl,
} from '../leagues/index.js'
import {
  updateTeamSeasonSearchIndexRosterMeta,
  upsertPlayerSeasonSearchIndexMany,
} from '../searchIndex/index.js'
import {
  ensureTeamDoc,
  upsertTeamSeasonPlayers,
} from '../teams/index.js'

export async function pasteTeamPlayersFlow(payload = {}) {
  const players = Array.isArray(payload.players) ? payload.players : []
  const teamDocResult = await ensureTeamDoc(payload.team || {})
  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: teamDocResult.birthTeamDocumentId,
    teamDocumentId: teamDocResult.teamDocumentId,
  }
  const teamSeasonResult = await upsertTeamSeasonPlayers({
    ...payload,
    team,
  })
  const teamWithRosterMeta = {
    ...team,
    playersCount: teamSeasonResult.playersCount,
  }
  const leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
    ...payload,
    team: teamWithRosterMeta,
  })
  const playerSeasonIndexResult = await upsertPlayerSeasonSearchIndexMany({
    ...payload,
    team: teamWithRosterMeta,
    players,
  })
  const teamSeasonIndexResult = await updateTeamSeasonSearchIndexRosterMeta({
    ...payload,
    team: teamWithRosterMeta,
    playersCount: teamSeasonResult.playersCount,
    playerSeasonIndexCount: playerSeasonIndexResult.rowsCount,
  })

  return {
    leagueTableRankResult,
    teamDocResult,
    teamSeasonResult,
    playerSeasonIndexResult,
    teamSeasonIndexResult,
    rowsCount: playerSeasonIndexResult.rowsCount,
  }
}


