// src/features/playersDatabase/services/write/flows/player/updatePlayerVerification.flow.js

import { updateLeagueSeasonTableRankScoutProfilesSummary } from '../../leagues/index.js'
import {
  ensureManualScoutingPlayerDoc,
  syncPlayerRoleAndScoutProfileDoc,
  updateScoutingPlayerVerificationAnswer,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutProfiles,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  updateTeamSeasonPlayerVerificationAndScout,
  updateTeamSeasonPlayerScoutProjection,
} from '../../teams/index.js'
import { clean } from '../../leagues/leagueDoc.js'
const ensureVerificationPlayerDocument = async payload => {
  let verificationResult = await updateScoutingPlayerVerificationAnswer(payload)

  if (verificationResult.reason !== 'playerDocMissing') {
    return verificationResult
  }

  const player = payload.player || {}
  const ensureResult = await ensureManualScoutingPlayerDoc({
    ...payload,
    player,
    teamSeasonDocument: payload.teamSeasonDocument || null,
  })

  if (ensureResult.skipped) {
    return {
      ...ensureResult,
      updated: false,
    }
  }

  verificationResult = await updateScoutingPlayerVerificationAnswer({
    ...payload,
    player: {
      ...player,
      playerDocumentId: ensureResult.playerDocumentId,
    },
  })

  return verificationResult
}

export async function updatePlayerVerificationFlow(payload = {}) {
  let teamSeasonResult = null
  let playerSeasonResult = null
  let playerSeasonIndexResult = null
  let leagueTableRankScoutProfilesResult = null
  let teamSeasonIndexScoutProfilesResult = null
  let teamSeasonProjectionResult = null

  try {
    teamSeasonResult = await updateTeamSeasonPlayerVerificationAndScout({
      ...payload,
      player: payload.player || {},
    })
  } catch (error) {
    return {
      verificationResult: null,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: false,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'teamSeason',
      projectionError: clean(error?.message) || 'Verification team projection failed',
    }
  }

  if (!teamSeasonResult.updated) {
    return {
      verificationResult: null,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: false,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'teamSeason',
    }
  }

  const canonicalPlayer = teamSeasonResult.player || payload.player || {}
  const verificationResult = await ensureVerificationPlayerDocument({
    ...payload,
    player: canonicalPlayer,
    teamSeasonDocument: teamSeasonResult.seasonDocument || null,
  })

  if (!verificationResult.updated) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: false,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: false,
      stoppedAt: 'verification',
    }
  }

  const verificationAnswers = Array.isArray(verificationResult.verificationAnswers)
    ? verificationResult.verificationAnswers
    : []
  const syncPayload = {
    ...payload,
    player: {
      ...canonicalPlayer,
      playerDocumentId: verificationResult.playerDocumentId,
    },
    teamSeasonDocument: teamSeasonResult.seasonDocument || null,
    verificationAnswers,
  }

  try {
    playerSeasonResult = await syncPlayerRoleAndScoutProfileDoc(syncPayload)
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'playerDocument',
      projectionError: clean(error?.message) || 'Verification player document sync failed',
    }
  }

  const scoutedPlayer = playerSeasonResult?.scoutedPlayer
  if (!scoutedPlayer) {
    return {
      verificationResult,
      teamSeasonResult,
      teamSeasonProjectionResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'playerDocument',
      projectionError: 'Player scout calculation did not return a rich result',
    }
  }

  try {
    teamSeasonProjectionResult = await updateTeamSeasonPlayerScoutProjection({
      ...payload,
      player: scoutedPlayer,
    })
    if (!teamSeasonProjectionResult?.updated) {
      throw new Error(
        teamSeasonProjectionResult?.reason || 'Team season player is missing'
      )
    }
    teamSeasonResult = teamSeasonProjectionResult
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult,
      teamSeasonProjectionResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'teamSeasonProjection',
      projectionError: clean(error?.message) || 'Verification team projection failed',
    }
  }

  try {
    playerSeasonIndexResult = await updatePlayerSeasonSearchIndexScoutProfiles({
      ...payload,
      player: scoutedPlayer,
    })
    if (!playerSeasonIndexResult?.updated) {
      return {
        verificationResult,
        teamSeasonResult,
        playerSeasonResult,
        playerSeasonIndexResult,
        leagueTableRankScoutProfilesResult,
        teamSeasonIndexScoutProfilesResult,
        humanStateCommitted: true,
        teamCanonicalCommitted: true,
        projectionsCompleted: false,
        completed: true,
        stoppedAt: 'playerSearchIndex',
        projectionError: clean(
          playerSeasonIndexResult?.reason ||
          'Player season SearchIndex is missing'
        ),
      }
    }
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'playerSearchIndex',
      projectionError: clean(error?.message) || 'Verification search index sync failed',
    }
  }

  const summaryPayload = {
    ...payload,
    player: scoutedPlayer,
    teamSeasonDocumentId: teamSeasonResult.teamSeasonDocumentId,
    scoutProfilesSummary: teamSeasonResult.scoutProfilesSummary,
  }

  try {
    leagueTableRankScoutProfilesResult =
      await updateLeagueSeasonTableRankScoutProfilesSummary(summaryPayload)
    if (!leagueTableRankScoutProfilesResult?.updated) {
      return {
        verificationResult,
        teamSeasonResult,
        playerSeasonResult,
        playerSeasonIndexResult,
        leagueTableRankScoutProfilesResult,
        teamSeasonIndexScoutProfilesResult,
        humanStateCommitted: true,
        teamCanonicalCommitted: true,
        projectionsCompleted: false,
        completed: true,
        stoppedAt: 'leagueScoutSummary',
        projectionError: clean(
          leagueTableRankScoutProfilesResult?.reason ||
          'League scout summary target is missing'
        ),
      }
    }
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'leagueScoutSummary',
      projectionError: clean(error?.message) || 'Verification league summary sync failed',
    }
  }

  try {
    teamSeasonIndexScoutProfilesResult =
      await updateTeamSeasonSearchIndexScoutProfilesSummary(summaryPayload)
    if (!teamSeasonIndexScoutProfilesResult?.updated) {
      return {
        verificationResult,
        teamSeasonResult,
        playerSeasonResult,
        playerSeasonIndexResult,
        leagueTableRankScoutProfilesResult,
        teamSeasonIndexScoutProfilesResult,
        humanStateCommitted: true,
        teamCanonicalCommitted: true,
        projectionsCompleted: false,
        completed: true,
        stoppedAt: 'teamSearchIndexSummary',
        projectionError: clean(
          teamSeasonIndexScoutProfilesResult?.reason ||
          'Team season SearchIndex is missing'
        ),
      }
    }
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'teamSearchIndexSummary',
      projectionError: clean(error?.message) || 'Verification team summary sync failed',
    }
  }

  return {
    verificationResult,
    teamSeasonResult,
    playerSeasonResult,
    playerSeasonIndexResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexScoutProfilesResult,
    humanStateCommitted: true,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    completed: true,
  }
}
