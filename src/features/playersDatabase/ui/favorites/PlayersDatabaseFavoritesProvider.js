// features/playersDatabase/ui/favorites/PlayersDatabaseFavoritesProvider.js

import * as React from 'react'

import PlayersDatabaseFavoritesContext from './PlayersDatabaseFavoritesContext.js'

const EMPTY_FAVORITES = Object.freeze([])
const EMPTY_FAVORITES_MAP = new Map()

const inactiveFavoritesValue = Object.freeze({
  playerFavorites: EMPTY_FAVORITES,
  birthTeamFavorites: EMPTY_FAVORITES,
  playerFavoritesMap: EMPTY_FAVORITES_MAP,
  birthTeamFavoritesMap: EMPTY_FAVORITES_MAP,
  loading: false,
  error: null,
  reload: () => Promise.resolve({
    players: EMPTY_FAVORITES,
    birthTeams: EMPTY_FAVORITES,
  }),
  addFavorite: () => Promise.resolve(null),
  removeFavorite: () => Promise.resolve(null),
  isPlayerFavorite: () => false,
  isBirthTeamFavorite: () => false,
  pendingKeysRevision: '',
  isFavoritePending: () => false,
})

export function PlayersDatabaseFavoritesProvider({ children }) {
  return (
    <PlayersDatabaseFavoritesContext.Provider value={inactiveFavoritesValue}>
      {children}
    </PlayersDatabaseFavoritesContext.Provider>
  )
}

export function usePlayersDatabaseFavorites() {
  const context = React.useContext(PlayersDatabaseFavoritesContext)

  if (!context) {
    throw new Error(
      'usePlayersDatabaseFavorites must be used inside PlayersDatabaseFavoritesProvider'
    )
  }

  return context
}
