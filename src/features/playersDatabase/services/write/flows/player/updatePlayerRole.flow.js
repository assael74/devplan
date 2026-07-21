// features/playersDatabase/services/write/flows/player/updatePlayerRole.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
} from '../../leagues/index.js'
import {
  syncPlayerRoleAndScoutProfileDoc,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexRole,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  updateTeamSeasonPlayerRoleAndScoutProfiles,
} from '../../teams/index.js'
import {
  buildRoleUpdatedPlayerWithScoutSignals,
} from '../shared.js'

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
  const player = buildRoleUpdatedPlayerWithScoutSignals(payload)
  const rolePayload = {
    ...payload,
    player,
    primaryPosition: player.primaryPosition,
    positionLayer: player.positionLayer,
    numShirt: player.numShirt,
  }
  const scoutProfiles = Array.isArray(player.scoutSignals)
    ? player.scoutSignals
    : []

  // Team season is the operational source of truth for the player in the squad.
  // Role, scout profiles and the team summary are committed in one transaction.
  const teamSeasonResult = await updateTeamSeasonPlayerRoleAndScoutProfiles({
    ...rolePayload,
    scoutProfiles,
  })

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

  // The player document is synchronized once. The previous flow wrote the same
  // player season twice through two separate transactions.
  const playerSeasonResult = await syncPlayerRoleAndScoutProfileDoc(rolePayload)
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
