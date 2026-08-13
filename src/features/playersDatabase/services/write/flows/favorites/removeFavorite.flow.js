// features/playersDatabase/services/write/flows/favorites/removeFavorite.flow.js

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../../constants/pdb.constants.js'
import { removeFavorite } from '../../favorites/index.js'
import { removePlayerFavoriteWithLifecycle } from '../../favorites/playerFavoriteLifecycle.js'

export async function removeFavoriteFlow(payload = {}) {
  const playerDocumentId = String(
    payload.scouting?.playerDocumentId ||
    payload.playerDocumentId ||
    ''
  ).trim()

  if (
    payload.favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER &&
    playerDocumentId
  ) {
    return removePlayerFavoriteWithLifecycle({
      entityId: payload.entityId,
      playerDocumentId,
    })
  }

  return removeFavorite(payload)
}
