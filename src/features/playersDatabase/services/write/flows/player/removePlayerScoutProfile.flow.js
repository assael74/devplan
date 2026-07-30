// features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
} from '../../leagues/index.js'
import {
  removePlayerSeasonScoutProfile,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutProfiles,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  updateTeamSeasonPlayerScoutProfiles,
} from '../../teams/index.js'

const clean = value => String(value || '').trim()

const normalizeProfileForWrite = profile => ({
  ...profile,
  profileId: clean(profile?.profileId || profile?.id),
  reliabilityLevel: clean(
    profile?.reliabilityLevel || profile?.reliability?.level
  ),
  reliabilityScore: profile?.reliabilityScore ?? profile?.reliability?.score ?? null,
})

const buildRemainingProfilesPayload = (payload = {}) => {
  const profileId = clean(payload.profileId)
  const sourceProfiles = Array.isArray(payload.player?.scoutProfiles)
    ? payload.player.scoutProfiles
    : Array.isArray(payload.player?.scoutSignals)
      ? payload.player.scoutSignals
      : []
  const remainingProfiles = sourceProfiles
    .map(normalizeProfileForWrite)
    .filter(profile => profile.profileId && profile.profileId !== profileId)

  return {
    ...payload,
    profileId,
    player: {
      ...(payload.player || {}),
      scoutProfiles: remainingProfiles,
      scoutSignals: remainingProfiles,
    },
    scoutProfiles: remainingProfiles,
  }
}

export async function removePlayerScoutProfileFlow(payload = {}) {
  const nextPayload = buildRemainingProfilesPayload(payload)

  if (!nextPayload.profileId) {
    throw new Error('Missing scout profile id')
  }

  const teamSeasonResult = await updateTeamSeasonPlayerScoutProfiles(nextPayload)

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
