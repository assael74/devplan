// src/features/playersDatabase/services/write/stats/writeStatsPlayerSearchIndexes.js

import { doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeStatsPlayerSearchIndexes = async ({ approvedState = {} } = {}) => {
  const plans = Array.isArray(approvedState.playerSearchIndexPlans)
    ? approvedState.playerSearchIndexPlans
    : []

  for (const plan of plans) {
    const projection = plan.projection
    const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes, projection.documentId)
    const { documentId, ...document } = projection
    await setDoc(reference, document)
  }

  return { written: plans.length }
}
