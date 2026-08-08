// features/playersDatabase/services/write/flows/player/removePlayerScoutProfile.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import { removePlayerSeasonScoutProfile } from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutProfiles,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import { updateTeamSeasonPlayerScoutProfiles } from '../../teams/index.js'

const clean = value => String(value || '').trim()

const resolveReliabilityScore = profile => {
  if (profile?.reliabilityScore !== undefined &&
      profile?.reliabilityScore !== null) {
    return profile.reliabilityScore
  }

  if (profile?.reliability?.score !== undefined &&
      profile?.reliability?.score !== null) {
    return profile.reliability.score
  }

  return null
}

const normalizeProfileForWrite = profile => ({
  ...profile,
  profileId: clean(profile?.profileId || profile?.id),
  reliabilityLevel: clean(
    profile?.reliabilityLevel || profile?.reliability?.level
  ),
  reliabilityScore: resolveReliabilityScore(profile),
})

const resolveCombinationProfileIds = combination => (
  Array.isArray(combination?.profileIds)
    ? combination.profileIds
    : Array.isArray(combination?.matchedProfileIds)
      ? combination.matchedProfileIds
      : []
)

const filterScoutCombinations = ({
  combinations = [],
  profiles = [],
} = {}) => {
  const profileIds = new Set(
    profiles
      .map(profile => clean(profile?.profileId || profile?.id))
      .filter(Boolean)
  )

  return combinations.filter(combination => (
    resolveCombinationProfileIds(combination)
      .map(clean)
      .filter(Boolean)
      .every(profileId => profileIds.has(profileId))
  ))
}

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
  const sourceCombinations = Array.isArray(payload.player?.scoutCombinations)
    ? payload.player.scoutCombinations
    : []
  const remainingCombinations = filterScoutCombinations({
    combinations: sourceCombinations,
    profiles: remainingProfiles,
  })

  return {
    ...payload,
    profileId,
    player: {
      ...(payload.player || {}),
      scoutProfiles: remainingProfiles,
      scoutSignals: remainingProfiles,
      scoutCombinations: remainingCombinations,
    },
    scoutProfiles: remainingProfiles,
    scoutCombinations: remainingCombinations,
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
