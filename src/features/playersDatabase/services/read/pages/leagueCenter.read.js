// src/features/playersDatabase/services/read/pages/leagueCenter.read.js

import {
  doc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackFirestoreListenerClose,
  trackFirestoreListenerOpen,
  trackFirestoreListenerUpdate,
  trackedGetDoc,
  trackedGetDocFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as C } from '../../../constants/pdb.constants.js'
import {
  readWithDocumentCache,
  refreshWithDocumentCache,
  setDocumentCacheValue,
} from '../../cache/index.js'

export const LEAGUES_CENTER_STORE_KEY = 'leaguesCenter:all'

const buildEmptyLeaguesCenterDocument = () => ({
  id: 'all',
  leaguesById: {},
  updatedAt: null,
  documentExists: false,
})

const mapLeaguesCenterSnapshot = snapshot => {
  if (!snapshot.exists()) return buildEmptyLeaguesCenterDocument()

  const data = snapshot.data() || {}
  return {
    id: snapshot.id,
    ...data,
    leaguesById: data.leaguesById || {},
    documentExists: true,
  }
}

const readLeaguesCenterFromFirestore = async ({ fromServer = false } = {}) => {
  const ref = doc(db, C.leaguesCenter, 'all')
  const usage = {
    feature: 'playersDatabase',
    action: fromServer ? 'league-center-server-reload' : 'league-center-read',
    collection: C.leaguesCenter,
  }
  const snapshot = fromServer
    ? await trackedGetDocFromServer(ref, usage)
    : await trackedGetDoc(ref, usage)

  return mapLeaguesCenterSnapshot(snapshot)
}

export const readLeagueCenterData = async ({ fromServer = false } = {}) => {
  const reader = fromServer ? refreshWithDocumentCache : readWithDocumentCache

  return reader({
    key: LEAGUES_CENTER_STORE_KEY,
    read: () => readLeaguesCenterFromFirestore({ fromServer }),
  })
}

export const subscribeLeagueCenterData = ({ onError } = {}) => {
  const reference = doc(db, C.leaguesCenter, 'all')
  const listenerId = `players-database-leagues-center-${Date.now()}`
  const usage = {
    collection: C.leaguesCenter,
    shortKey: 'all',
    feature: 'playersDatabase',
    action: 'league-center-live',
    listenerId,
    meta: { documentPath: reference.path },
  }

  trackFirestoreListenerOpen(usage)
  const unsubscribe = onSnapshot(
    reference,
    snapshot => {
      const document = mapLeaguesCenterSnapshot(snapshot)
      trackFirestoreListenerUpdate({
        ...usage,
        docs: [document],
        docsCount: snapshot.exists() ? 1 : 0,
        readsCount: snapshot.exists() ? 1 : 0,
        fromCache: snapshot.metadata.fromCache,
      })
      setDocumentCacheValue({
        key: LEAGUES_CENTER_STORE_KEY,
        value: document,
      })
    },
    error => {
      trackFirestoreListenerUpdate({
        ...usage,
        docsCount: 0,
        readsCount: 0,
        status: 'error',
        errorCode: error && error.code ? error.code : 'unknown',
      })
      if (typeof onError === 'function') onError(error)
    }
  )

  return () => {
    unsubscribe()
    trackFirestoreListenerClose(usage)
  }
}
