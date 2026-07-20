// features/playersDatabase/services/write/flows/createTeamPlayer.flow.js

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
import {
  upsertOfficialPlayerDoc,
} from '../players/index.js'

async function createTeamPlayerFlow({
  payload = {},
  player = {},
} = {}) {
  const teamDocResult = await ensureTeamDoc(payload.team || {})
  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: teamDocResult.birthTeamDocumentId,
    teamDocumentId: teamDocResult.teamDocumentId,
  }
  const teamSeasonResult = await upsertTeamSeasonPlayers({
    ...payload,
    team,
    players: [player],
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
    players: [player],
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


