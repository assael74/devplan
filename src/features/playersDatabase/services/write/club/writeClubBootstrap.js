// src/features/playersDatabase/services/write/club/writeClubBootstrap.js

import { doc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeClubBootstrap = async ({ approvedState }) => {
  if (!approvedState || approvedState.kind !== 'clubBootstrapApprovedState') {
    throw new Error('Approved Club bootstrap state is required')
  }
  if (approvedState.mode === 'alreadyApplied') {
    return { written: false, clubsCount: approvedState.summary.clubsCount }
  }

  const updatedAt = serverTimestamp()
  await trackedRunTransaction(db, async transaction => {
    approvedState.profiles.forEach(profile => {
      transaction.set(
        doc(db, PLAYERS_DATABASE_COLLECTIONS.clubProfiles, profile.clubId),
        {
          ...profile,
          timestamps: {
            createdAt: updatedAt,
            updatedAt,
          },
        },
      )
    })

    transaction.set(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsDirectory, 'all'),
      {
        clubsById: Object.fromEntries(Object.entries(
          approvedState.directory.clubsById,
        ).map(([clubId, entry]) => [clubId, { ...entry, updatedAt }])),
        updatedAt,
      },
    )
  }, { feature: 'playersDatabase', action: 'club-bootstrap-write' })

  return { written: true, clubsCount: approvedState.summary.clubsCount }
}
