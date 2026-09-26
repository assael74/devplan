import {
  collection,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import {
  trackedGetDocs,
  trackedRunTransaction,
} from '../../../../../../services/firestore/usage/index.js'
import {
  CLUBS_MASTER_DOCUMENT_ID,
} from '../../../../catalog/firestoreDocuments/clubsMaster.catalog.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { buildClubsMasterClubProjection } from '../../../../domain/projections/club/index.js'
import { cleanValue } from '../../../../model/shared/value.model.js'
import { invalidateClubsMasterDocumentCache } from '../../../cache/index.js'

const clean = cleanValue

const sortClubEntries = clubs => [...clubs].sort((left, right) => (
  clean(left?.name).localeCompare(clean(right?.name), 'he') ||
  clean(left?.clubId).localeCompare(clean(right?.clubId))
))

export async function syncClubsMasterV2() {
  const snapshot = await trackedGetDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.clubs),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
      action: 'league-v2-clubs-master-read',
      operationSubtype: 'projection-getDocs',
    }
  )
  const clubs = sortClubEntries(snapshot.docs
    .filter(item => item.exists())
    .map(item => buildClubsMasterClubProjection({
      club: {
        ...(item.data() || {}),
        clubId: item.id,
      },
    })))

  const result = await trackedRunTransaction(db, async transaction => {
    const reference = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      CLUBS_MASTER_DOCUMENT_ID
    )
    const current = await transaction.get(reference)
    const existingClubs = current.exists() && Array.isArray(current.data()?.clubs)
      ? current.data().clubs
      : []
    const changed = !current.exists() || JSON.stringify(existingClubs) !== JSON.stringify(clubs)

    if (changed) {
      transaction.set(reference, {
        projectionVersion: 1,
        clubs,
        updatedAt: serverTimestamp(),
      })
    }

    return {
      changed,
      clubsCount: clubs.length,
    }
  }, {
    feature: 'playersDatabase',
    action: 'league-v2-rebuild-clubs-master',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
  })

  if (result.changed) invalidateClubsMasterDocumentCache()
  return result
}

