// features/playersDatabase/services/write/flows/favorites/addFavorite.flow.js

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../../constants/pdb.constants.js'
import { addFavorite } from '../../favorites/index.js'
import { addPlayerFavoriteWithLifecycle } from '../../favorites/playerFavoriteLifecycle.js'

export async function addFavoriteFlow(payload = {}) {
  const scouting = payload.scouting && typeof payload.scouting === 'object'
    ? payload.scouting
    : null

  if (
    payload.favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER &&
    scouting
  ) {
    return addPlayerFavoriteWithLifecycle({
      entityId: payload.entityId,
      displayName: payload.displayName,
      birthYear: payload.birthYear,
      scouting,
    })
  }

  return addFavorite(payload)
}
