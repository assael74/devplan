// features/playersDatabase/services/write/clubs/clubsMaster.js

import {
  collection,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG,
  CLUBS_MASTER_DOCUMENT_ID,
} from '../../../catalog/firestoreDocuments/clubsMaster.catalog.js'
import { buildClubsMasterClubProjection } from '../../../domain/projections/club/index.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import {
  trackedGetDocs,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'
import { invalidateClubsMasterDocumentCache } from '../../cache/index.js'

const clean = cleanValue

const masterRef = () =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, CLUBS_MASTER_DOCUMENT_ID)

const clubRef = clubId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clean(clubId))

const clubsCollectionRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.clubs)

const sortClubEntries = clubs => [...clubs].sort((left, right) => (
  clean(left?.name).localeCompare(clean(right?.name), 'he') ||
  clean(left?.clubId).localeCompare(clean(right?.clubId))
))

const isSameMasterState = ({ existingMaster = {}, clubs = [], projectionVersion = 1 } = {}) => (
  Number(existingMaster?.projectionVersion || 1) === (Number(projectionVersion) || 1) &&
  JSON.stringify(Array.isArray(existingMaster?.clubs) ? existingMaster.clubs : []) ===
    JSON.stringify(clubs)
)

const buildClubMap = clubs => {
  const map = new Map()
  ;(Array.isArray(clubs) ? clubs : []).forEach(club => {
    const clubId = clean(club?.clubId)
    if (clubId) map.set(clubId, club)
  })
  return map
}

const buildFullMasterEntries = clubSnapshots => {
  const clubMap = new Map()

  ;(Array.isArray(clubSnapshots) ? clubSnapshots : []).forEach(snapshot => {
    if (!snapshot?.exists?.()) return

    const clubId = clean(snapshot.id)
    if (!clubId) return

    clubMap.set(clubId, buildClubsMasterClubProjection({
      club: {
        ...(snapshot.data() || {}),
        // The Club document id is the stable identity used by Clubs Master.
        clubId,
      },
    }))
  })

  return sortClubEntries([...clubMap.values()])
}

// Unlike incremental sync, a full rebuild replaces stale or duplicated Master
// rows with exactly one projection per canonical Club document.
export async function rebuildAllClubsMasterDocument({
  projectionVersion = 1,
  lastWriteAction = 'REBUILD_CLUBS_MASTER',
} = {}) {
  const clubsSnapshot = await trackedGetDocs(clubsCollectionRef(), {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
    action: 'clubs-master-full-rebuild-read',
    operationSubtype: 'projection-getDocs',
  })
  const clubs = buildFullMasterEntries(clubsSnapshot.docs)

  const result = await trackedRunTransaction(db, async transaction => {
    const masterSnapshot = await transaction.get(masterRef())
    const existingMaster = masterSnapshot.exists()
      ? masterSnapshot.data() || {}
      : CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG
    const writeSkipped = masterSnapshot.exists() && isSameMasterState({
      existingMaster,
      clubs,
      projectionVersion,
    })

    if (!writeSkipped) {
      transaction.set(masterRef(), {
        projectionVersion: Number(projectionVersion) || 1,
        clubs,
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }

    return {
      updated: !writeSkipped,
      changed: !writeSkipped,
      writeSkipped,
      clubsCount: clubs.length,
      sourceClubsCount: clubsSnapshot.size,
    }
  })

  if (result?.updated) invalidateClubsMasterDocumentCache()
  return result
}

export async function syncClubsMasterDocument({
  clubIds = [],
  removedClubIds = [],
  projectionVersion = 1,
  lastWriteAction = '',
  transactionGuard = null,
} = {}) {
  const safeClubIds = [...new Set(
    (Array.isArray(clubIds) ? clubIds : []).map(clean).filter(Boolean)
  )]
  const removedIds = new Set(
    (Array.isArray(removedClubIds) ? removedClubIds : []).map(clean).filter(Boolean)
  )

  if (!safeClubIds.length && !removedIds.size) return null

  const result = await trackedRunTransaction(db, async transaction => {
    // Firestore transactions require all reads before writes.
    const guardSnapshot = transactionGuard?.ref
      ? await transaction.get(transactionGuard.ref)
      : null
    const masterSnapshot = await transaction.get(masterRef())
    const clubSnapshots = []

    for (const clubId of safeClubIds) {
      clubSnapshots.push({
        clubId,
        snapshot: await transaction.get(clubRef(clubId)),
      })
    }

    if (guardSnapshot) {
      const guardField = clean(transactionGuard.field)
      const expectedGuardValue = clean(transactionGuard.expected)
      const currentGuardValue = clean(guardSnapshot.exists()
        ? guardSnapshot.data()?.[guardField]
        : '')

      if (!guardSnapshot.exists() || !guardField || currentGuardValue !== expectedGuardValue) {
        return {
          updated: false,
          changed: false,
          writeSkipped: true,
          guardSuperseded: true,
          clubsCount: 0,
          clubIds: safeClubIds,
          removedClubIds: [...removedIds],
        }
      }
    }

    const existingMaster = masterSnapshot.exists()
      ? masterSnapshot.data() || {}
      : CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG
    const clubMap = buildClubMap(existingMaster.clubs)

    clubSnapshots.forEach(({ clubId, snapshot }) => {
      if (!snapshot.exists()) {
        clubMap.delete(clubId)
        return
      }

      clubMap.set(clubId, buildClubsMasterClubProjection({
        club: snapshot.data() || {},
      }))
    })

    removedIds.forEach(clubId => clubMap.delete(clubId))

    const clubs = sortClubEntries([...clubMap.values()])
    const writeSkipped = masterSnapshot.exists() && isSameMasterState({
      existingMaster,
      clubs,
      projectionVersion,
    })

    if (!writeSkipped) {
      transaction.set(masterRef(), {
        projectionVersion: Number(projectionVersion) || 1,
        clubs,
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }

    return {
      updated: !writeSkipped,
      changed: !writeSkipped,
      writeSkipped,
      clubsCount: clubs.length,
      clubIds: safeClubIds,
      removedClubIds: [...removedIds],
    }
  })

  if (result?.updated) invalidateClubsMasterDocumentCache()
  return result
}
