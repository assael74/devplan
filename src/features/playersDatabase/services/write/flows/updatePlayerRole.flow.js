// features/playersDatabase/services/write/flows/updatePlayerRole.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
} from '../leagues/index.js'
import {
  syncPlayerScoutProfileDocsMany,
  updatePlayerSeasonRole,
} from '../players/index.js'
import {
  updatePlayerSeasonSearchIndexRole,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../searchIndex/index.js'
import {
  updateTeamSeasonPlayerRole,
  updateTeamSeasonPlayerScoutProfiles,
} from '../teams/index.js'
import {
  buildRoleUpdatedPlayerWithScoutSignals,
} from './shared.js'

export async function updatePlayerRoleFlow(payload = {}) {
  const player = buildRoleUpdatedPlayerWithScoutSignals(payload)
  const rolePayload = {
    ...payload,
    player,
    primaryPosition: player.primaryPosition,
    positionLayer: player.positionLayer,
    numShirt: player.numShirt,
  }
  const playerSeasonResult = await updatePlayerSeasonRole(rolePayload)
  const playerScoutProfileDocsResult = await syncPlayerScoutProfileDocsMany({
    ...rolePayload,
    players: [player],
  })
  const teamSeasonResult = await updateTeamSeasonPlayerRole(rolePayload)
  const teamSeasonScoutProfilesResult = await updateTeamSeasonPlayerScoutProfiles({
    ...rolePayload,
    scoutProfiles: Array.isArray(player.scoutSignals) ? player.scoutSignals : [],
  })
  const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexRole(rolePayload)
  const leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary({
    ...rolePayload,
    scoutProfilesSummary: teamSeasonScoutProfilesResult.scoutProfilesSummary,
  })
  const teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
    ...rolePayload,
    scoutProfilesSummary: teamSeasonScoutProfilesResult.scoutProfilesSummary,
  })

  return {
    playerSeasonResult,
    playerScoutProfileDocsResult,
    teamSeasonResult,
    teamSeasonScoutProfilesResult,
    playerSeasonIndexResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexScoutProfilesResult,
    rowsCount: 1,
  }
}
