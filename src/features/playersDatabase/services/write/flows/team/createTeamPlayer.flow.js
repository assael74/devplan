// features/playersDatabase/services/write/flows/team/createTeamPlayer.flow.js

import { updateLeagueSeasonTableRankTeamUrl } from '../../leagues/index.js'
import {
  resolvePlayerIdentity,
  updateTeamSeasonSearchIndexRosterMeta,
  upsertPlayerSeasonSearchIndexMany,
} from '../../searchIndex/index.js'
import {
  appendTeamSeasonPlayer,
  ensureTeamDoc,
} from '../../teams/index.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'

async function createTeamPlayerFlow({
  payload = {},
  player = {},
} = {}) {
  const resolvedPlayer = await resolvePlayerIdentity({
    player,
    season: payload.season || {},
  })
  const teamDocResult = await ensureTeamDoc(payload.team || {})
  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: teamDocResult.birthTeamDocumentId,
    teamDocumentId: teamDocResult.teamDocumentId,
  }
  const teamSeasonResult = await appendTeamSeasonPlayer({
    ...payload,
    team,
    player: resolvedPlayer,
  })
  const teamWithRosterMeta = {
    ...team,
    ...buildTeamLoadStatus(teamSeasonResult.players),
  }
  const leagueTableRankResult = await updateLeagueSeasonTableRankTeamUrl({
    ...payload,
    team: teamWithRosterMeta,
  })
  const playerSeasonIndexResult = await upsertPlayerSeasonSearchIndexMany({
    ...payload,
    team: teamWithRosterMeta,
    players: [teamSeasonResult.player],
  })
  const teamSeasonIndexResult = await updateTeamSeasonSearchIndexRosterMeta({
    ...payload,
    team: teamWithRosterMeta,
    teamSeasonDocumentId: teamSeasonResult.teamSeasonDocumentId,
    playersCount: teamSeasonResult.playersCount,
    playerSeasonIndexCount: playerSeasonIndexResult.rowsCount,
    teamBalance: teamSeasonResult.teamBalance,
  })

  return {
    teamDocResult,
    teamSeasonResult,
    leagueTableRankResult,
    playerSeasonIndexResult,
    teamSeasonIndexResult,
    rowsCount: 1,
  }
}

export async function createTeamDisplayPlayerFlow(payload = {}) {
  return createTeamPlayerFlow({
    payload,
    player: payload.player || {},
  })
}
