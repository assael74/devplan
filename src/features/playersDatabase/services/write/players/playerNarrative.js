// src/features/playersDatabase/services/write/players/playerNarrative.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { NARRATIVE_VERSION } from '../../../domain/narrative/narrative.contract.js'
import {
  buildApprovedNarrative,
  normalizePlayerNarrative,
} from '../../../domain/narrative/narrativeState.js'
import { playerDocRef } from './playerDoc.model.js'

const upsertSeasonNarrative = ({ seasons, seasonId, seasonKey, snapshot }) => {
  const safeSeasons = Array.isArray(seasons) ? seasons : []
  const index = safeSeasons.findIndex(item => (
    (seasonKey && item?.seasonKey === seasonKey) ||
    (seasonId && item?.seasonId === seasonId)
  ))
  const next = {
    seasonId: seasonId || '',
    seasonKey: seasonKey || '',
    approved: buildApprovedNarrative(snapshot),
  }

  if (index < 0) return [...safeSeasons, next]

  return safeSeasons.map((item, itemIndex) => (
    itemIndex === index ? next : item
  ))
}

export const saveApprovedNarrative = async ({
  playerDocumentId,
  seasonId = '',
  seasonKey = '',
  seasonSnapshot = null,
  careerSnapshot = null,
} = {}) => {
  if (!playerDocumentId) throw new Error('Missing player document id')
  if (!seasonSnapshot && !careerSnapshot) throw new Error('Missing approved narrative')

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        updated: false,
        reason: 'playerDocumentMissing',
      }
    }

    const data = snapshot.data() || {}
    const current = normalizePlayerNarrative(data.scoutNarrative)
    const next = {
      ...current,
      version: NARRATIVE_VERSION,
      career: careerSnapshot
        ? buildApprovedNarrative(careerSnapshot)
        : current.career,
      seasons: seasonSnapshot
        ? upsertSeasonNarrative({
            seasons: current.seasons,
            seasonId,
            seasonKey,
            snapshot: seasonSnapshot,
          })
        : current.seasons,
    }

    transaction.set(
      ref,
      {
        scoutNarrative: next,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      updated: true,
      scoutNarrative: next,
    }
  })
}


export const deleteApprovedNarrative = async ({ playerDocumentId } = {}) => {
  if (!playerDocumentId) throw new Error('Missing player document id')

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        updated: false,
        reason: 'playerDocumentMissing',
      }
    }

    const data = snapshot.data() || {}
    const current = normalizePlayerNarrative(data.scoutNarrative)
    const next = {
      ...current,
      version: NARRATIVE_VERSION,
      career: null,
    }

    transaction.set(
      ref,
      {
        scoutNarrative: next,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      updated: true,
      scoutNarrative: next,
    }
  })
}
