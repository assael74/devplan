// src/features/playersDatabase/services/read/pages/leaguePage.read.js

import { doc, onSnapshot } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildLeagueDocumentCacheKey, setDocumentCacheValue } from '../../cache/index.js'
import { getLeagueById } from '../entities/league.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const readLeaguePageData = async ({
  leagueId = '',
  refresh = false,
} = {}) => ({
  leagueDoc: await getLeagueById(leagueId, { refresh }),
})

export const subscribeLeaguePageData = ({ leagueId = '', onError } = {}) => {
  const documentId = clean(leagueId)
  if (!documentId) return () => {}
  const listenerId = `players-database-league-page-${documentId}-${Date.now()}`
  const usage = {
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    shortKey: documentId,
    feature: 'playersDatabase',
    action: 'league-page-live',
    listenerId,
  }

  trackFirestoreListenerOpen(usage)
  const unsubscribe = onSnapshot(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, documentId),
    snapshot => {
      const value = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
      trackFirestoreListenerUpdate({
        ...usage,
        docs: value ? [value] : [],
        docsCount: value ? 1 : 0,
        readsCount: value ? 1 : 0,
        fromCache: snapshot.metadata.fromCache,
      })
      setDocumentCacheValue({
        key: buildLeagueDocumentCacheKey(documentId),
        value,
      })
    },
    error => {
      trackFirestoreListenerUpdate({
        ...usage,
        docsCount: 0,
        readsCount: 0,
        status: 'error',
        errorCode: error?.code || 'unknown',
      })
      onError?.(error)
    }
  )

  return () => {
    unsubscribe()
    trackFirestoreListenerClose(usage)
  }
}
