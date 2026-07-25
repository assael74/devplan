// features/playersDatabase/services/write/players/playerFavorite.js

import { deleteField, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
  playerDocRef,
} from './playerDoc.model.js'

export async function updatePlayerFavorite({
  player = {},
  favorite = false,
} = {}) {
  const playerId = clean(player.playerId)
  const playerDocumentId = clean(
    player.playerDocumentId ||
    buildPlayerDocumentId(player)
  )

  if (!playerId) throw new Error('Missing player id')
  if (!playerDocumentId) throw new Error('Missing player document id')

  const ref = playerDocRef(playerDocumentId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const baseDoc = buildPlayerBaseDoc({
      ...player,
      playerId,
      playerDocumentId,
      favorite: Boolean(favorite),
    }, currentData)

    transaction.set(
      ref,
      {
        ...baseDoc,
        id: playerDocumentId,
        playerId,
        playerDocumentId,
        favorite: Boolean(favorite),
        current: Array.isArray(currentData.current) ? currentData.current : [],
        history: Array.isArray(currentData.history) ? currentData.history : [],
        scoutProfiles: deleteField(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerId,
      playerDocumentId,
      favorite: Boolean(favorite),
      created: !snapshot.exists(),
      updated: true,
    }
  })
}
