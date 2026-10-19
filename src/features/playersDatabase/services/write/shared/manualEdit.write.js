// src/features/playersDatabase/services/write/shared/manualEdit.write.js

import { collection, doc, query, where } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../constants/pdb.constants.js'
import { collectSignalClubIds, refreshTeamSignalSummaries } from '../signals/refreshTeamSignalSummaries.js'

const usage = { feature: 'playersDatabase', action: 'manual-edit' }

export const manualEditRef = (collectionKey, documentId) => {
  const collectionName = collections[collectionKey]
  if (!collectionName || !String(documentId || '').trim()) {
    throw new Error('יעד העריכה חסר')
  }
  return doc(db, collectionName, String(documentId).trim())
}

export const requireManualEditDocument = snapshot => {
  if (!snapshot?.exists()) throw new Error('מסמך מחויב חסר; לא בוצעה שמירה')
  return snapshot.data()
}

export const readManualEditRefs = async (collectionKey, filters) => {
  const collectionName = collections[collectionKey]
  if (!collectionName) throw new Error('אוסף העריכה חסר')
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, collectionName),
      ...Object.entries(filters).map(([field, value]) => where(field, '==', value)),
    ),
    usage,
  )
  return snapshot.docs.map(item => item.ref)
}

export const readManualEditDocument = ref => trackedGetDocFromServer(ref, usage)

export const executeManualEdit = async ({
  refs,
  build,
  refreshSignals = false,
  getSignalRefresh = null,
}) => {
  const updatedAt = new Date().toISOString()
  const uniqueRefs = [...new Map(refs.map(ref => [ref.path, ref])).values()]

  const result = await trackedRunTransaction(db, async transaction => {
    const snapshots = new Map()
    for (const ref of uniqueRefs) {
      snapshots.set(ref.path, await transaction.get(ref))
    }

    const context = {
      get: ref => snapshots.get(ref.path),
      updatedAt,
    }
    const changes = build(context)
    const affectedSignals = refreshSignals || changes.some(({ ref, patch = {}, document }) => {
      if (ref.path.startsWith(`${collections.clubProfiles}/`)) {
        return Boolean(document) || ['clubLevel', 'clubStrengthLevel'].some(field => Object.prototype.hasOwnProperty.call(patch, field))
      }
      if (ref.path.startsWith(`${collections.teamSeasons}/`)) {
        return Boolean(document) || Object.keys(patch).some(field => /^(stats|scouting|movement)(\.|$)/.test(field))
      }
      return false
    })

    let signalRefresh = null
    if (affectedSignals) {
      signalRefresh = getSignalRefresh ? getSignalRefresh(context) : {
        clubIds: collectSignalClubIds({
          documents: [...snapshots.values()].filter(snapshot => snapshot.exists()).map(snapshot => snapshot.data()),
          changes,
        }),
      }
    }

    changes.forEach(({ ref, patch, document }) => {
      if (document) transaction.set(ref, document)
      else transaction.update(ref, { ...patch, updatedAt })
    })
    return {
      changedCount: changes.length,
      signalRefresh,
    }
  }, usage)
  if (result.signalRefresh) await refreshTeamSignalSummaries(result.signalRefresh)
  return { completed: true, changedCount: result.changedCount }
}
