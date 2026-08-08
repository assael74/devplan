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
import { upsertOfficialPlayerDoc } from '../../players/index.js'

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
    playersCount: teamSeasonResult.playersCount,
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
    playersCount: teamSeasonResult.playersCount,
    playerSeasonIndexCount: playerSeasonIndexResult.rowsCount,
    scoutProfiledPlayersCount: 0,
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

export async function createTeamOfficialPlayerFlow(payload = {}) {
  const player = payload.player || {}
  const officialPlayerResult = await upsertOfficialPlayerDoc(payload)
  const result = await createTeamPlayerFlow({
    payload,
    player: {
      ...player,
      playerDocumentId: officialPlayerResult.playerDocumentId,
    },
  })

  return {
    officialPlayerResult,
    ...result,
  }
}


