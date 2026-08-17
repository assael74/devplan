// src/features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import { removePlayerSeasonScoutProfile } from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutProfiles,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import { removeTeamSeasonPlayerScoutProfile } from '../../teams/index.js'

const clean = value => String(value || '').trim()

export async function removePlayerScoutProfileFlow(payload = {}) {
  const profileId = clean(payload.profileId)
  if (!profileId) throw new Error('Missing scout profile id')

  const teamSeasonResult = await removeTeamSeasonPlayerScoutProfile({
    ...payload,
    profileId,
  })

  if (!teamSeasonResult.updated || !teamSeasonResult.player) {
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

  const nextPayload = {
    ...payload,
    profileId,
    player: teamSeasonResult.player,
    scoutProfiles: Array.isArray(teamSeasonResult.player.scoutProfiles)
      ? teamSeasonResult.player.scoutProfiles
      : [],
    scoutCombinations: Array.isArray(teamSeasonResult.player.scoutCombinations)
      ? teamSeasonResult.player.scoutCombinations
      : [],
  }
  const playerSeasonResult = await removePlayerSeasonScoutProfile(nextPayload)
  const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexScoutProfiles(nextPayload)
  const summaryPayload = {
    ...nextPayload,
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
