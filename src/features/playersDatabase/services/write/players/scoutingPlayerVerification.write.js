// src/features/playersDatabase/services/write/players/scoutingPlayerVerification.write.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  playerDocRef,
} from './playerDoc.model.js'
import { resolveWritablePlayerDocumentId } from '../../../model/playerIdentity.model.js'
import {
  buildScoutingPlayerReasonEvents,
  buildScoutingPlayerTracking,
  mergeScoutingPlayerEvents,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import {
  buildScoutingPlayerVerification,
  normalizeScoutingPlayerVerification,
} from './scoutingPlayerVerification.model.js'

export const updateScoutingPlayerVerificationAnswer = async ({
  season = {},
  team = {},
  player = {},
  questionId = '',
  answer = 'unknown',
  sourceType = '',
  sourceLabel = '',
  answeredAt = '',
  reviewAfter = null,
} = {}) => {
  const playerDocumentId = clean(resolveWritablePlayerDocumentId(player))
  const normalizedQuestionId = clean(questionId)

  if (!playerDocumentId) {
    return {
      skipped: true,
      reason: 'missingPlayerDocumentId',
    }
  }
  if (!normalizedQuestionId) {
    throw new Error('Missing verification question id')
  }

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const currentVerification = normalizeScoutingPlayerVerification(
      currentData.verification
    )
    const verification = buildScoutingPlayerVerification({
      currentVerification,
      questionId: normalizedQuestionId,
      answer,
      sourceType,
      sourceLabel,
      answeredAt,
      reviewAfter,
    })
    const trackedAt = verification.updatedAt || new Date().toISOString()
    const tracking = buildScoutingPlayerTracking({
      currentTracking: {
        ...(currentData.tracking || {}),
        favorite:
          currentData.tracking?.favorite === true ||
          currentData.favorite === true,
        watchlist:
          currentData.tracking?.watchlist === true ||
          currentData.watchlist === true,
      },
      reason: SCOUTING_PLAYER_TRACKING_REASONS.MANUAL,
      trackedAt,
    })
    const events = mergeScoutingPlayerEvents({
      currentEvents: currentData.events,
      nextEvents: buildScoutingPlayerReasonEvents({
        reason: SCOUTING_PLAYER_TRACKING_REASONS.MANUAL,
        season,
        team,
        player,
        trackedAt,
      }),
    })

    transaction.set(
      ref,
      {
        verification,
        tracking,
        events,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      updated: true,
      verification,
      verificationAnswers: verification.answers,
      tracking,
    }
  })
}
