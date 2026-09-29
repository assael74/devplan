// features/playersDatabase/ui/favorites/PlayersDatabaseFavoritesProvider.js

import * as React from 'react'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../constants/pdb.constants.js'
import { buildFavoritesMap } from '../../model/player/favorite.model.js'
import { readFavorites } from '../../services/read/index.js'
import { addBirthTeamFavorite } from '../../services/writeV2/favorites/birthTeam/add.js'
import { removeBirthTeamFavorite } from '../../services/writeV2/favorites/birthTeam/remove.js'
import { addPlayerFavorite } from '../../services/writeV2/favorites/player/add.js'
import { removePlayerFavorite } from '../../services/writeV2/favorites/player/remove.js'
import PlayersDatabaseFavoritesContext from './PlayersDatabaseFavoritesContext.js'

const buildPendingKey = (favoriteType, entityId) => (
  `${favoriteType}:${String(entityId || '').trim()}`
)

const replaceFavoriteItem = (items, nextItem) => {
  const source = Array.isArray(items) ? items : []
  const exists = source.some(item => item.entityId === nextItem.entityId)

  if (!exists) {
    return [...source, nextItem]
  }

  return source.map(item => (
    item.entityId === nextItem.entityId ? nextItem : item
  ))
}

const removeFavoriteItem = (items, entityId) => (
  (Array.isArray(items) ? items : []).filter(item => item.entityId !== entityId)
)

export function PlayersDatabaseFavoritesProvider({ children }) {
  const [playerFavorites, setPlayerFavorites] = React.useState([])
  const [birthTeamFavorites, setBirthTeamFavorites] = React.useState([])
  const [pendingKeys, setPendingKeys] = React.useState(() => new Set())
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const loadFavorites = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await readFavorites()
      setPlayerFavorites(result.players || [])
      setBirthTeamFavorites(result.birthTeams || [])
      return result
    } catch (loadError) {
      setError(loadError)
      throw loadError
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadFavorites().catch(() => {})
  }, [loadFavorites])

  const setPending = React.useCallback((key, pending) => {
    setPendingKeys(current => {
      const next = new Set(current)

      if (pending) {
        next.add(key)
      } else {
        next.delete(key)
      }

      return next
    })
  }, [])

  const addFavorite = React.useCallback(async ({
    favoriteType = '',
    entityId = '',
    displayName = '',
    birthYear = null,
  } = {}) => {
    const normalizedEntityId = String(entityId || '').trim()
    const pendingKey = buildPendingKey(favoriteType, normalizedEntityId)

    if (!normalizedEntityId || pendingKeys.has(pendingKey)) {
      return null
    }

    const setItems = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
      ? setPlayerFavorites
      : setBirthTeamFavorites
    const optimisticItem = {
      entityId: normalizedEntityId,
      displayName: String(displayName || '').trim(),
      birthYear: Number(birthYear) || null,
      createdAt: null,
    }
    let previousItems = []

    setError(null)
    setPending(pendingKey, true)
    setItems(current => {
      previousItems = current
      return replaceFavoriteItem(current, optimisticItem)
    })

    try {
      const add = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
        ? addPlayerFavorite
        : addBirthTeamFavorite
      const savedItem = await add({
        entityId: normalizedEntityId,
        displayName,
        birthYear,
      })

      setItems(current => replaceFavoriteItem(current, savedItem))
      return savedItem
    } catch (writeError) {
      setItems(previousItems)
      setError(writeError)
      throw writeError
    } finally {
      setPending(pendingKey, false)
    }
  }, [pendingKeys, setPending])

  const removeFavorite = React.useCallback(async ({
    favoriteType = '',
    entityId = '',
  } = {}) => {
    const normalizedEntityId = String(entityId || '').trim()
    const pendingKey = buildPendingKey(favoriteType, normalizedEntityId)

    if (!normalizedEntityId || pendingKeys.has(pendingKey)) {
      return null
    }

    const setItems = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
      ? setPlayerFavorites
      : setBirthTeamFavorites
    let previousItems = []

    setError(null)
    setPending(pendingKey, true)
    setItems(current => {
      previousItems = current
      return removeFavoriteItem(current, normalizedEntityId)
    })

    try {
      const remove = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
        ? removePlayerFavorite
        : removeBirthTeamFavorite
      return await remove({ entityId: normalizedEntityId })
    } catch (writeError) {
      setItems(previousItems)
      setError(writeError)
      throw writeError
    } finally {
      setPending(pendingKey, false)
    }
  }, [pendingKeys, setPending])

  const playerFavoritesMap = React.useMemo(
    () => buildFavoritesMap(playerFavorites),
    [playerFavorites]
  )
  const birthTeamFavoritesMap = React.useMemo(
    () => buildFavoritesMap(birthTeamFavorites),
    [birthTeamFavorites]
  )

  const value = React.useMemo(() => ({
    playerFavorites,
    birthTeamFavorites,
    playerFavoritesMap,
    birthTeamFavoritesMap,
    loading,
    error,
    reload: loadFavorites,
    addFavorite,
    removeFavorite,
    isPlayerFavorite: playerId => playerFavoritesMap.has(String(playerId || '').trim()),
    isBirthTeamFavorite: birthTeamId => (
      birthTeamFavoritesMap.has(String(birthTeamId || '').trim())
    ),
    pendingKeysRevision: Array.from(pendingKeys).sort().join('|'),
    isFavoritePending: (favoriteType, entityId) => (
      pendingKeys.has(buildPendingKey(favoriteType, entityId))
    ),
  }), [
    addFavorite,
    birthTeamFavorites,
    birthTeamFavoritesMap,
    error,
    loadFavorites,
    loading,
    pendingKeys,
    playerFavorites,
    playerFavoritesMap,
    removeFavorite,
  ])

  return (
    <PlayersDatabaseFavoritesContext.Provider value={value}>
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
