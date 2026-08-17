// src/features/playersDatabase/services/write/flows/player/updatePlayerRole.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import { syncPlayerRoleAndScoutProfileDoc } from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexRole,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import { updateTeamSeasonPlayerRoleAndScoutProfiles } from '../../teams/index.js'

const buildPlayerSyncResult = result => ({
  rowsCount: result && !result.skipped ? 1 : 0,
  createdCount: result && result.created ? 1 : 0,
  clearedCount: result && result.updated && result.scoutProfilesCount === 0 ? 1 : 0,
  skippedCount: result && result.skipped ? 1 : 0,
  playerDocumentIds: result && result.playerDocumentId
    ? [result.playerDocumentId]
    : [],
  result,
})

export async function updatePlayerRoleFlow(payload = {}) {
  // Team season is the operational source of truth for the player in the squad.
  // Resolve the canonical player there before recalculating role-dependent scout state.
  const teamSeasonResult = await updateTeamSeasonPlayerRoleAndScoutProfiles(payload)

  if (!teamSeasonResult.updated) {
    return {
      playerSeasonResult: null,
      playerScoutProfileDocsResult: null,
      teamSeasonResult,
      teamSeasonScoutProfilesResult: teamSeasonResult,
      playerSeasonIndexResult: null,
      leagueTableRankScoutProfilesResult: null,
      teamSeasonIndexScoutProfilesResult: null,
      rowsCount: 0,
      completed: false,
      stoppedAt: 'teamSeason',
    }
  }

  const player = teamSeasonResult.player || payload.player || {}
  const rolePayload = {
    ...payload,
    player,
    primaryPosition: player.primaryPosition || '',
    positionLayer: player.positionLayer || '',
    numShirt: player.numShirt || '',
  }

  // Reuse the team document already read and updated in the team transaction.
  // The player sync falls back to its own read only when no team document exists.
  const playerSeasonResult = await syncPlayerRoleAndScoutProfileDoc({
    ...rolePayload,
    teamDocument: teamSeasonResult.teamDocument || null,
  })
  const playerScoutProfileDocsResult = buildPlayerSyncResult(playerSeasonResult)
  const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexRole(rolePayload)
  const leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary({
    ...rolePayload,
    scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
  })
  const teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
    ...rolePayload,
    scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
  })

  return {
    playerSeasonResult,
    playerScoutProfileDocsResult,
    teamSeasonResult,
    teamSeasonScoutProfilesResult: teamSeasonResult,
    playerSeasonIndexResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexScoutProfilesResult,
    rowsCount: 1,
    completed: true,
  }
}
