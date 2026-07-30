// features/playersDatabase/services/read/favorites.read.js

import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  PLAYERS_DATABASE_COLLECTIONS,
  PLAYERS_DATABASE_FAVORITES_DOCUMENTS,
} from '../../constants/pdb.constants.js'
import {
  buildFavoritesMap,
  normalizeFavoriteItems,
} from '../../model/favorite.model.js'

const favoriteDocRef = documentId => doc(
  db,
  PLAYERS_DATABASE_COLLECTIONS.favorites,
  documentId
)

const readFavoriteDocument = async documentId => {
  const snapshot = await getDoc(favoriteDocRef(documentId))
  const data = snapshot.exists() ? snapshot.data() || {} : {}

  return normalizeFavoriteItems(data.items)
}

export async function readFavorites() {
  const [players, birthTeams] = await Promise.all([
    readFavoriteDocument(PLAYERS_DATABASE_FAVORITES_DOCUMENTS.PLAYERS),
    readFavoriteDocument(PLAYERS_DATABASE_FAVORITES_DOCUMENTS.BIRTH_TEAMS),
  ])

  return {
    players,
    birthTeams,
    playerMap: buildFavoritesMap(players),
    birthTeamMap: buildFavoritesMap(birthTeams),
  }
}
