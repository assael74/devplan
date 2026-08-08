// features/playersDatabase/services/write/favorites/favoriteDocument.js

import {
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  PLAYERS_DATABASE_COLLECTIONS,
  PLAYERS_DATABASE_FAVORITES_DOCUMENTS,
  PLAYERS_DATABASE_FAVORITE_TYPES,
  PLAYERS_DATABASE_FAVORITES_LIMIT,
} from '../../../constants/pdb.constants.js'
import {
  buildFavoriteItem,
  normalizeFavoriteItems,
} from '../../../model/favorite.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
const resolveFavoriteDocumentId = favoriteType => {
  if (favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER) {
    return PLAYERS_DATABASE_FAVORITES_DOCUMENTS.PLAYERS
  }

  if (favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM) {
    return PLAYERS_DATABASE_FAVORITES_DOCUMENTS.BIRTH_TEAMS
  }

  throw new Error(`Unknown favorite type: ${favoriteType}`)
}

const favoriteDocRef = favoriteType => doc(
  db,
  PLAYERS_DATABASE_COLLECTIONS.favorites,
  resolveFavoriteDocumentId(favoriteType)
)

export async function addFavorite({
  favoriteType = '',
  entityId = '',
  displayName = '',
  birthYear = null,
} = {}) {
  const ref = favoriteDocRef(favoriteType)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const currentItems = normalizeFavoriteItems(currentData.items)
    const favoriteItem = buildFavoriteItem({
      entityId,
      displayName,
      birthYear,
      createdAt: Timestamp.now(),
    })
    const existingItem = currentItems.find(
      item => item.entityId === favoriteItem.entityId
    )

    if (existingItem) {
      return existingItem
    }

    if (currentItems.length >= PLAYERS_DATABASE_FAVORITES_LIMIT) {
      throw new Error(`Favorites limit reached: ${PLAYERS_DATABASE_FAVORITES_LIMIT}`)
    }

    transaction.set(
      ref,
      {
        items: [...currentItems, favoriteItem],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return favoriteItem
  })
}

export async function removeFavorite({
  favoriteType = '',
  entityId = '',
} = {}) {
  const ref = favoriteDocRef(favoriteType)
  const normalizedEntityId = String(entityId || '').trim()

  if (!normalizedEntityId) {
    throw new Error('Missing favorite entity id')
  }

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return {
        entityId: normalizedEntityId,
        removed: false,
      }
    }

    const currentData = snapshot.data() || {}
    const currentItems = normalizeFavoriteItems(currentData.items)
    const nextItems = currentItems.filter(
      item => item.entityId !== normalizedEntityId
    )

    if (nextItems.length === currentItems.length) {
      return {
        entityId: normalizedEntityId,
        removed: false,
      }
    }

    transaction.set(
      ref,
      {
        items: nextItems,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      entityId: normalizedEntityId,
      removed: true,
    }
  })
}
