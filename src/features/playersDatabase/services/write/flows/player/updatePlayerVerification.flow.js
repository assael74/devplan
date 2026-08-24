// src/features/playersDatabase/services/write/flows/player/updatePlayerVerification.flow.js

import { getTeamById } from '../../../read/team.js'
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
} from '../../teams/index.js'
import { clean } from '../../leagues/leagueDoc.js'
import { isSameSeason } from '../../../../model/season.model.js'
import {
  buildPlayerLookup,
  findExistingPlayerIndex,
} from '../../teams/teamSeason.model.js'

const resolveTeamDocumentId = team => clean(
  team?.birthTeamDocumentId ||
  team?.birthTeamId ||
  team?.teamDocumentId ||
  team?.teamId
)

const resolveCanonicalTeamPlayer = ({ teamDocument = {}, season = {}, target = 'current', player = {} } = {}) => {
  const fieldKey = clean(target) === 'history' ? 'history' : 'current'
  const rows = Array.isArray(teamDocument[fieldKey])
    ? teamDocument[fieldKey]
    : []
  const seasonRow = rows.find(row => isSameSeason(row, season)) || null
  const teamPlayers = Array.isArray(seasonRow?.teamPlayers)
    ? seasonRow.teamPlayers
    : []
  const playerIndex = findExistingPlayerIndex({
    lookup: buildPlayerLookup(teamPlayers),
    player,
  })

  return playerIndex >= 0 ? teamPlayers[playerIndex] : null
}

const ensureVerificationPlayerDocument = async payload => {
  let verificationResult = await updateScoutingPlayerVerificationAnswer(payload)

  if (verificationResult.reason !== 'playerDocMissing') {
    return verificationResult
  }

  const teamDocumentId = resolveTeamDocumentId(payload.team || {})
  const teamDocument = teamDocumentId
    ? await getTeamById(teamDocumentId)
    : null
  const canonicalPlayer = resolveCanonicalTeamPlayer({
    teamDocument: teamDocument || {},
    season: payload.season || {},
    target: payload.target || 'current',
    player: payload.player || {},
  })
  const player = canonicalPlayer || payload.player || {}
  const ensureResult = await ensureManualScoutingPlayerDoc({
    ...payload,
    player,
    teamDocument,
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
  const verificationResult = await ensureVerificationPlayerDocument(payload)

  if (!verificationResult.updated) {
    return {
      verificationResult,
      teamSeasonResult: null,
      playerSeasonResult: null,
      playerSeasonIndexResult: null,
      humanStateCommitted: false,
      projectionsCompleted: false,
      completed: false,
    }
  }

  const verificationAnswers = Array.isArray(verificationResult.verificationAnswers)
    ? verificationResult.verificationAnswers
    : []
  const player = {
    ...(payload.player || {}),
    playerDocumentId: verificationResult.playerDocumentId,
  }

  let teamSeasonResult = null
  let playerSeasonResult = null
  let playerSeasonIndexResult = null
  let leagueTableRankScoutProfilesResult = null
  let teamSeasonIndexScoutProfilesResult = null

  try {
    teamSeasonResult = await updateTeamSeasonPlayerVerificationAndScout({
      ...payload,
      player,
      verificationAnswers,
    })
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'teamSeason',
      projectionError: clean(error?.message) || 'Verification team projection failed',
    }
  }

  if (!teamSeasonResult.updated) {
    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      leagueTableRankScoutProfilesResult,
      teamSeasonIndexScoutProfilesResult,
      humanStateCommitted: true,
      teamCanonicalCommitted: false,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'teamSeason',
    }
  }

  const calculatedPlayer = teamSeasonResult.player || player
  const syncPayload = {
    ...payload,
    player: calculatedPlayer,
    teamDocument: teamSeasonResult.teamDocument || null,
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

  try {
    playerSeasonIndexResult = await updatePlayerSeasonSearchIndexScoutProfiles({
      ...payload,
      player: calculatedPlayer,
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
    player: calculatedPlayer,
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
