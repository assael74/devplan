// src/features/playersDatabase/services/write/flows/player/updatePlayerScoutReview.flow.js

import { getTeamById } from '../../../read/team.js'
import {
  ensureManualScoutingPlayerDoc,
  updateScoutingPlayerReview,
} from '../../players/index.js'
import { updatePlayerSeasonSearchIndexScoutProfiles } from '../../searchIndex/index.js'
import { clean } from '../../leagues/leagueDoc.js'

const resolveTeamDocumentId = team => clean(
  team?.birthTeamDocumentId ||
  team?.birthTeamId ||
  team?.teamDocumentId ||
  team?.teamId
)

const ensureReviewPlayerDocument = async payload => {
  const firstResult = await updateScoutingPlayerReview(payload)

  if (firstResult.reason !== 'playerDocMissing') return firstResult

  const teamDocumentId = resolveTeamDocumentId(payload.team || {})
  const teamDocument = teamDocumentId ? await getTeamById(teamDocumentId) : null
  const ensureResult = await ensureManualScoutingPlayerDoc({
    ...payload,
    teamDocument,
  })

  if (ensureResult.skipped) {
    return {
      ...ensureResult,
      updated: false,
    }
  }

  return updateScoutingPlayerReview({
    ...payload,
    player: {
      ...(payload.player || {}),
      playerDocumentId: ensureResult.playerDocumentId,
    },
  })
}

export async function updatePlayerScoutReviewFlow(payload = {}) {
  const reviewResult = await ensureReviewPlayerDocument(payload)

  if (!reviewResult.updated) {
    return {
      reviewResult,
      playerSeasonIndexResult: null,
      humanStateCommitted: false,
      projectionsCompleted: false,
      completed: false,
    }
  }

  const seasonPlayer = reviewResult.seasonPlayer

  if (!seasonPlayer) {
    return {
      reviewResult,
      playerSeasonIndexResult: null,
      humanStateCommitted: true,
      projectionsCompleted: false,
      completed: true,
      stoppedAt: 'playerSeasonMissing',
    }
  }

  try {
    const playerSeasonIndexResult = await updatePlayerSeasonSearchIndexScoutProfiles({
      ...payload,
      player: seasonPlayer,
    })

    return {
      reviewResult,
      playerSeasonIndexResult,
      humanStateCommitted: true,
      projectionsCompleted: true,
      completed: true,
    }
  } catch (error) {
    return {
      reviewResult,
      playerSeasonIndexResult: null,
      humanStateCommitted: true,
      projectionsCompleted: false,
      completed: true,
      projectionError: clean(error?.message) || 'Player review projection sync failed',
    }
  }
}
