// src/features/playersDatabase/services/write/stats/writeStatsPlayerRoots.js

import { deleteDoc, FieldPath, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeStatsPlayerRoots = async ({ approvedState = {} } = {}) => {
  const plans = Array.isArray(approvedState.playerRootPlans) ? approvedState.playerRootPlans : []

  for (const plan of plans) {
    const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.playerRoots, plan.playerId)
    if (plan.action === 'delete') {
      await deleteDoc(reference)
      continue
    }
    if (plan.action === 'create') {
      await setDoc(reference, plan.document)
      continue
    }
    if (plan.action !== 'update') throw new Error('Invalid Stats Player Root action')

    if (plan.seasonRefsById) {
      await setDoc(reference, {
        seasonRefsById: plan.seasonRefsById,
        timestamps: {
          updatedAt: plan.updatedAt || null,
        },
      }, {
        mergeFields: [
          'seasonRefsById',
          new FieldPath('timestamps', 'updatedAt'),
        ],
      })
      continue
    }

    await setDoc(reference, {
      seasonRefsById: {
        [plan.seasonId]: plan.seasonRef,
      },
      timestamps: {
        updatedAt: plan.updatedAt || null,
      },
    }, {
      mergeFields: [
        new FieldPath('seasonRefsById', plan.seasonId),
        new FieldPath('timestamps', 'updatedAt'),
      ],
    })
  }

  return { written: plans.length }
}
