// features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
} from '../../leagues/index.js'
import {
  removePlayerSeasonScoutProfile,
} from '../../players/index.js'
import {
  clearPlayerSeasonSearchIndexScoutProfile,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  updateTeamSeasonPlayerScoutProfiles,
} from '../../teams/index.js'

const buildClearedScoutProfilePayload = (payload = {}) => ({
  ...payload,
  player: {
    ...(payload.player || {}),
    scoutProfiles: [],
    scoutSignals: [],
  },
  scoutProfiles: [],
})

export async function removePlayerScoutProfileFlow(payload = {}) {
  const clearedPayload = buildClearedScoutProfilePayload(payload)

  // Team season is the operational source of truth for the squad.
  // Stop before updating derived documents when the team season is missing.
  const teamSeasonResult = await updateTeamSeasonPlayerScoutProfiles(clearedPayload)

  if (!teamSeasonResult.updated) {
    return {
      playerSeasonResult: null,
      teamSeasonResult,
      playerSeasonIndexResult: null,
      leagueTableRankScoutProfilesResult: null,
      teamSeasonIndexScoutProfilesResult: null,
      rowsCount: 0,
      completed: false,
      stoppedAt: 'teamSeason',
    }
  }

  const playerSeasonResult = await removePlayerSeasonScoutProfile(clearedPayload)
  const playerSeasonIndexResult = await clearPlayerSeasonSearchIndexScoutProfile(clearedPayload)
  const summaryPayload = {
    ...clearedPayload,
    scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
  }
  const leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary(summaryPayload)
  const teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary(summaryPayload)

  return {
    playerSeasonResult,
    teamSeasonResult,
    playerSeasonIndexResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexScoutProfilesResult,
    rowsCount: 1,
    completed: true,
  }
}
