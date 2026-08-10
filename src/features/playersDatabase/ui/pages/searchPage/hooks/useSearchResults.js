// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchResults.js

import * as React from 'react'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../../constants/pdb.constants.js'
import { readSearchPageRows } from '../../../../services/read/index.js'
import { usePlayersDatabaseFavorites } from '../../../favorites/index.js'
import {
  adaptPlayerSearchIndexDocument,
  adaptTeamSearchIndexDocument,
} from '../../../../domain/index.js'
import { normalizeSearchRows } from '../logic/search.model.js'
import { buildSearchSummary } from '../logic/search.selectors.js'
import {
  buildSearchResultFilterOptions,
  createSearchResultFilters,
  filterSearchResultRows,
  hasSearchResultFilters,
} from '../logic/searchResultFilters.js'
import { cloneSearchFilters } from './useSearchQueryFilters.js'
import useSearchPlayerActions from './useSearchPlayerActions.js'
import useSearchTeamUrlEditor from './useSearchTeamUrlEditor.js'

const adaptSearchRow = row => (
  row?.entityType === 'birthTeamSeason'
    ? adaptTeamSearchIndexDocument(row)
    : adaptPlayerSearchIndexDocument(row)
)

export default function useSearchResults({ queryFilters }) {
  const favorites = usePlayersDatabaseFavorites()
  const [loadedFilters, setLoadedFilters] = React.useState(null)
  const [loadedRows, setLoadedRows] = React.useState([])
  const [loadLoading, setLoadLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState(null)
  const [loadRevision, setLoadRevision] = React.useState(0)
  const [loadCompletedRevision, setLoadCompletedRevision] = React.useState(0)
  const [resultFilters, setResultFilters] = React.useState(
    createSearchResultFilters
  )

  const loadedFiltersKey = React.useMemo(
    () => JSON.stringify(loadedFilters || null),
    [loadedFilters]
  )

  const favoriteEntityIds = React.useMemo(() => {
    if (!loadedFilters?.favoritesOnly) return []

    return loadedFilters.searchContext === 'team'
      ? favorites.birthTeamFavorites.map(item => item.entityId)
      : favorites.playerFavorites.map(item => item.entityId)
  }, [
    favorites.birthTeamFavorites,
    favorites.playerFavorites,
    loadedFilters?.favoritesOnly,
    loadedFilters?.searchContext,
  ])
  const favoritesKey = React.useMemo(
    () => favoriteEntityIds.slice().sort().join('|'),
    [favoriteEntityIds]
  )

  React.useEffect(() => {
    if (!loadedFilters) {
      setLoadedRows([])
      return undefined
    }

    let active = true

    setLoadLoading(true)
    setLoadError(null)

    readSearchPageRows({
      filters: loadedFilters,
      favoriteEntityIds,
    })
      .then(rows => {
        if (!active) return

        const domainRows = rows.map(adaptSearchRow)
        setLoadedRows(normalizeSearchRows(domainRows))
        setResultFilters(createSearchResultFilters())
        setLoadLoading(false)
        setLoadCompletedRevision(current => current + 1)
      })
      .catch(error => {
        if (!active) return
        setLoadedRows([])
        setLoadError(error)
        setLoadLoading(false)
      })

    return () => {
      active = false
    }
  }, [favoritesKey, loadedFiltersKey, loadRevision, loadedFilters, favoriteEntityIds])

  const loadedEntityType = loadedFilters?.searchContext || ''

  const playerActions = useSearchPlayerActions({
    setLoadedRows,
    setLoadRevision,
  })
  const teamUrlEditor = useSearchTeamUrlEditor({ setLoadedRows })

  const rowsWithFavorites = React.useMemo(
    () => loadedRows.map(row => {
      const favoriteType = row.entityType === 'birthTeamSeason'
        ? PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
        : PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
      const entityId = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
        ? row.birthTeamId
        : row.playerId
      const favorite = favoriteType === PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
        ? favorites.isBirthTeamFavorite(entityId)
        : favorites.isPlayerFavorite(entityId)

      return {
        ...row,
        favorite,
        favoritePending: favorites.isFavoritePending(favoriteType, entityId),
        notesPending: playerActions.pendingNoteKeys.has(playerActions.getRowKey(row)),
        scoutProfilePendingIds: (Array.isArray(row.scoutProfiles) ? row.scoutProfiles : [])
          .map(profile => profile?.id)
          .filter(profileId => playerActions.pendingScoutProfileKeys.has(playerActions.getScoutProfileKey(row, profileId))),
      }
    }),
    [
      favorites.birthTeamFavoritesMap,
      favorites.pendingKeysRevision,
      favorites.playerFavoritesMap,
      playerActions.getRowKey,
      playerActions.getScoutProfileKey,
      loadedRows,
      playerActions.pendingNoteKeys,
      playerActions.pendingScoutProfileKeys,
    ]
  )

  const resultFilterOptions = React.useMemo(
    () => buildSearchResultFilterOptions({
      rows: rowsWithFavorites,
      entityType: loadedEntityType,
    }),
    [rowsWithFavorites, loadedEntityType]
  )

  const rows = React.useMemo(
    () => filterSearchResultRows({
      rows: rowsWithFavorites,
      filters: resultFilters,
      entityType: loadedEntityType,
    }),
    [rowsWithFavorites, resultFilters, loadedEntityType]
  )

  const summary = React.useMemo(
    () => buildSearchSummary(rows),
    [rows]
  )

  const updateResultFilter = React.useCallback((field, value) => {
    setResultFilters(current => ({
      ...current,
      [field]: Array.isArray(value) ? value : String(value || ''),
    }))
  }, [])

  const resetResultFilters = React.useCallback(() => {
    setResultFilters(createSearchResultFilters())
  }, [])


  const toggleFavorite = React.useCallback(async row => {
    const isBirthTeam = row?.entityType === 'birthTeamSeason'
    const favoriteType = isBirthTeam
      ? PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM
      : PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER
    const entityId = isBirthTeam ? row?.birthTeamId : row?.playerId

    if (!entityId) return null

    if (row.favorite) {
      return favorites.removeFavorite({
        favoriteType,
        entityId,
      })
    }

    return favorites.addFavorite({
      favoriteType,
      entityId,
      displayName: isBirthTeam ? row.teamName : row.playerName,
      birthYear: row.birthYear,
    })
  }, [favorites])


  const loadDocuments = React.useCallback(() => {
    setLoadedFilters(cloneSearchFilters(queryFilters))
    setLoadRevision(current => current + 1)
  }, [queryFilters])

  return {
    rows,
    loadedRowsCount: loadedRows.length,
    resultFilters,
    resultFilterOptions,
    hasResultFilters: hasSearchResultFilters(resultFilters),
    summary,
    hasLoaded: Boolean(loadedFilters),
    loadedEntityType,
    loadLoading,
    loadError,
    loadCompletedRevision,
    updateResultFilter,
    resetResultFilters,
    toggleFavorite,
    saveNotes: playerActions.saveNotes,
    removeScoutProfile: playerActions.removeScoutProfile,
    teamUrlEditor,
    roleEditor: playerActions.roleEditor,
    loadDocuments,
  }
}
