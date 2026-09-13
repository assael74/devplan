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
import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import { syncClubProjectionFromTeamSeason } from '../../clubs/index.js'

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
  const clubProjectionResult = await syncClubProjectionFromTeamSeason({
    league: payload.league || {},
    season: payload.season || {},
    team: teamWithRosterMeta,
    teamSeason: teamSeasonResult.seasonDocument || {},
    canonicalCommitted: true,
    lastWriteAction: 'CREATE_TEAM_PLAYER',
  })

  if (clubProjectionResult?.completed !== true) {
    return {
      teamDocResult,
      teamSeasonResult,
      leagueTableRankResult,
      playerSeasonIndexResult,
      teamSeasonIndexResult,
      clubProjectionResult,
      teamCanonicalCommitted: true,
      canonicalCommitted: true,
      projectionsCompleted: false,
      completed: false,
      recoveryRequired: true,
      reason: clubProjectionResult?.reason || 'CLUB_PROJECTION_INCOMPLETE',
      recoveryScope: clubProjectionResult?.recoveryScope || null,
      rowsCount: 1,
    }
  }

  return {
    teamDocResult,
    teamSeasonResult,
    leagueTableRankResult,
    playerSeasonIndexResult,
    teamSeasonIndexResult,
    clubProjectionResult,
    teamCanonicalCommitted: true,
    canonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
    rowsCount: 1,
  }
}

export async function createTeamDisplayPlayerFlow(payload = {}) {
  return createTeamPlayerFlow({
    payload,
    player: payload.player || {},
  })
}
