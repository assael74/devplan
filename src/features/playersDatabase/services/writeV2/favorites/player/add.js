// src/features/playersDatabase/services/writeV2/favorites/player/add.js

import { doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import {
  PLAYERS_DATABASE_COLLECTIONS,
  PLAYERS_DATABASE_FAVORITES_DOCUMENTS,
  PLAYERS_DATABASE_FAVORITES_LIMIT,
} from '../../../../constants/pdb.constants.js'
import {
  buildFavoriteItem,
  normalizeFavoriteItems,
} from '../../../../model/player/favorite.model.js'

export function addPlayerFavorite({ entityId, displayName, birthYear = null }) {
  const ref = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.favorites,
    PLAYERS_DATABASE_FAVORITES_DOCUMENTS.PLAYERS,
  )

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const items = normalizeFavoriteItems(snapshot.exists() ? snapshot.data()?.items : [])
    const favorite = buildFavoriteItem({
      entityId,
      displayName,
      birthYear,
      createdAt: Timestamp.now(),
    })
    const existing = items.find(item => item.entityId === favorite.entityId)
    if (existing) return existing
    if (items.length >= PLAYERS_DATABASE_FAVORITES_LIMIT) {
      throw new Error(`Favorites limit reached: ${PLAYERS_DATABASE_FAVORITES_LIMIT}`)
    }

    transaction.set(
      ref,
      { items: [...items, favorite], updatedAt: serverTimestamp() },
      { merge: true },
    )
    return favorite
  }, { feature: 'playersDatabase', action: 'add-player-favorite' })
}
