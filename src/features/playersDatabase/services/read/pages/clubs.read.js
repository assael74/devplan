// src/features/playersDatabase/services/read/pages/clubs.read.js

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
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  PLAYERS_DATABASE_SEASONS_CATALOG,
} from '../../../catalog/seasons.catalog.js'
import {
  buildClubDocumentCacheKey,
  buildClubsCenterCacheKey,
  buildClubsDirectoryCacheKey,
  readWithDocumentCache,
  refreshWithDocumentCache,
  setDocumentCacheValue,
  getDocumentStoreSnapshot,
} from '../../cache/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' ? value : {})

export const CLUBS_DIRECTORY_STORE_KEY = buildClubsDirectoryCacheKey()

const mapClubsDirectorySnapshot = snapshot => {
  const data = snapshot.exists() ? snapshot.data() || {} : {}

  return {
    id: 'all',
    ...data,
    clubsById: object(data.clubsById),
    documentExists: snapshot.exists(),
  }
}

const readCachedDocument = ({
  collectionName,
  documentId,
  cacheKey,
  action,
  refresh = false,
} = {}) => {
  const read = async () => {
    const snapshot = await trackedGetDoc(doc(db, collectionName, documentId), {
      feature: 'playersDatabase',
      action,
      collection: collectionName,
      meta: { documentId },
    })

    return snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data(), documentExists: true }
      : { id: documentId, documentExists: false }
  }

  return refresh
    ? refreshWithDocumentCache({ key: cacheKey, read })
    : readWithDocumentCache({ key: cacheKey, read })
}

export const readClubsDirectoryDocument = ({ refresh = false } = {}) => (
  readCachedDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsDirectory,
    documentId: 'all',
    cacheKey: buildClubsDirectoryCacheKey(),
    action: 'clubs-directory-read',
    refresh,
  })
)

export const subscribeClubsDirectoryDocument = ({ onError } = {}) => {
  const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsDirectory, 'all')
  const listenerId = `players-database-clubs-directory-${Date.now()}`
  const usage = {
    collection: PLAYERS_DATABASE_COLLECTIONS.clubsDirectory,
    shortKey: 'all',
    feature: 'playersDatabase',
    action: 'clubs-directory-live',
    listenerId,
    meta: { documentPath: reference.path },
  }

  trackFirestoreListenerOpen(usage)
  const unsubscribe = onSnapshot(
    reference,
    snapshot => {
      const document = mapClubsDirectorySnapshot(snapshot)
      trackFirestoreListenerUpdate({
        ...usage,
        docs: [document],
        docsCount: snapshot.exists() ? 1 : 0,
        readsCount: snapshot.exists() ? 1 : 0,
        fromCache: snapshot.metadata.fromCache,
      })
      setDocumentCacheValue({
        key: CLUBS_DIRECTORY_STORE_KEY,
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

export const readClubsCenterSeasonDocument = ({
  seasonId = '',
  refresh = false,
} = {}) => {
  const normalizedSeasonId = clean(seasonId)
  if (!normalizedSeasonId) return Promise.resolve(null)

  return readCachedDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
    documentId: normalizedSeasonId,
    cacheKey: buildClubsCenterCacheKey(normalizedSeasonId),
    action: 'clubs-center-season-read',
    refresh,
  })
}

export const readClubProfileDocument = ({
  clubId = '',
  refresh = false,
} = {}) => {
  const normalizedClubId = clean(clubId)
  if (!normalizedClubId) return Promise.resolve(null)

  return readCachedDocument({
    collectionName: PLAYERS_DATABASE_COLLECTIONS.clubProfiles,
    documentId: normalizedClubId,
    cacheKey: buildClubDocumentCacheKey(normalizedClubId),
    action: 'club-profile-read',
    refresh,
  })
}

const selectedSeasonCatalog = () => {
  const current = PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
    season.target === 'current'
  )) || null
  const previous = PLAYERS_DATABASE_SEASONS_CATALOG.find(season => (
    season.target === 'history'
  )) || null

  return [current, previous].filter(Boolean)
}

// Reuse document snapshots for presentation without creating another page cache.
export const getCachedClubsPageData = () => {
  const directory = getDocumentStoreSnapshot(buildClubsDirectoryCacheKey()).data
  const centers = selectedSeasonCatalog().map(season => ({
    season,
    document: getDocumentStoreSnapshot(buildClubsCenterCacheKey(season.seasonId)).data,
  }))
  if (!directory || centers.some(item => !item.document)) return null
  return { directory, centers }
}

export const getCachedClubPageData = clubId => {
  const pageData = getCachedClubsPageData()
  const profile = getDocumentStoreSnapshot(buildClubDocumentCacheKey(clubId)).data
  if (!pageData || !profile) return null
  return {
    clubId,
    profile: profile.documentExists ? profile : null,
    directoryEntry: pageData.directory.clubsById?.[clubId] || null,
    centers: pageData.centers,
  }
}

const readSelectedCenters = async ({ refresh = false } = {}) => {
  const seasons = selectedSeasonCatalog()
  const documents = await Promise.all(seasons.map(season => (
    readClubsCenterSeasonDocument({
      seasonId: season.seasonId,
      refresh,
    })
  )))

  return documents.map((document, index) => ({
    season: seasons[index],
    document: document || { id: seasons[index].seasonId, documentExists: false },
  }))
}

export const readClubsPageData = async ({ refresh = false } = {}) => {
  const [directory, centers] = await Promise.all([
    readClubsDirectoryDocument({ refresh }),
    readSelectedCenters({ refresh }),
  ])

  return {
    directory: {
      ...directory,
      clubsById: object(directory && directory.clubsById),
    },
    centers,
  }
}

export const readClubPageData = async ({
  clubId = '',
  refresh = false,
} = {}) => {
  const normalizedClubId = clean(clubId)
  if (!normalizedClubId) {
    return {
      clubId: '',
      profile: null,
      directoryEntry: null,
      centers: [],
    }
  }

  const [profile, pageData] = await Promise.all([
    readClubProfileDocument({ clubId: normalizedClubId, refresh }),
    readClubsPageData({ refresh }),
  ])

  return {
    clubId: normalizedClubId,
    profile: profile && profile.documentExists ? profile : null,
    directoryEntry: object(pageData.directory.clubsById)[normalizedClubId] || null,
    centers: pageData.centers,
  }
}
