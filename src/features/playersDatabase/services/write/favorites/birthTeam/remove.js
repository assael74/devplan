// src/features/playersDatabase/services/writeV2/favorites/birthTeam/remove.js

import { doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../../services/firestore/usage/index.js'
import {
  PLAYERS_DATABASE_COLLECTIONS,
  PLAYERS_DATABASE_FAVORITES_DOCUMENTS,
} from '../../../../constants/pdb.constants.js'
import { normalizeFavoriteItems } from '../../../../model/player/favorite.model.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export function removeBirthTeamFavorite({ entityId }) {
  const id = clean(entityId)
  if (!id) throw new Error('Missing favorite entity id')
  const ref = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.favorites,
    PLAYERS_DATABASE_FAVORITES_DOCUMENTS.BIRTH_TEAMS,
  )

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return { entityId: id, removed: false }
    const items = normalizeFavoriteItems(snapshot.data()?.items)
    const nextItems = items.filter(item => item.entityId !== id)
    if (nextItems.length === items.length) return { entityId: id, removed: false }

    transaction.set(
      ref,
      { items: nextItems, updatedAt: serverTimestamp() },
      { merge: true },
    )
    return { entityId: id, removed: true }
  }, { feature: 'playersDatabase', action: 'remove-birth-team-favorite' })
}
