// src/features/playersDatabase/services/write/flows/player/updatePlayerVerification.flow.js

import { getTeamById } from '../../../read/team.js'
import {
  ensureManualScoutingPlayerDoc,
  syncPlayerRoleAndScoutProfileDoc,
  updateScoutingPlayerVerificationAnswer,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutProfiles,
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

  try {
    const teamSeasonResult = await updateTeamSeasonPlayerVerificationAndScout({
      ...payload,
      player,
      verificationAnswers,
    })

    if (!teamSeasonResult.updated) {
      return {
        verificationResult,
        teamSeasonResult,
        playerSeasonResult: null,
        playerSeasonIndexResult: null,
        humanStateCommitted: true,
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
    const playerSeasonResult = await syncPlayerRoleAndScoutProfileDoc(syncPayload)
    const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexScoutProfiles({
      ...payload,
      player: calculatedPlayer,
    })

    return {
      verificationResult,
      teamSeasonResult,
      playerSeasonResult,
      playerSeasonIndexResult,
      humanStateCommitted: true,
      projectionsCompleted: true,
      completed: true,
    }
  } catch (error) {
    return {
      verificationResult,
      teamSeasonResult: null,
      playerSeasonResult: null,
      playerSeasonIndexResult: null,
      humanStateCommitted: true,
      projectionsCompleted: false,
      completed: true,
      projectionError: clean(error?.message) || 'Verification projection sync failed',
    }
  }
}
