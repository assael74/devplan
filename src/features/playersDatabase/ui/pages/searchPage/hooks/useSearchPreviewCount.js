// features/playersDatabase/ui/pages/searchPage/hooks/useSearchPreviewCount.js

import * as React from 'react'

import { readSearchPageCount } from '../../../../services/read/index.js'
import { usePlayersDatabaseFavorites } from '../../../favorites/index.js'

export default function useSearchPreviewCount({
  queryFilters,
  queryFiltersKey,
}) {
  const favorites = usePlayersDatabaseFavorites()
  const favoriteEntityIds = React.useMemo(() => {
    if (!queryFilters.favoritesOnly) return []

    return queryFilters.searchContext === 'team'
      ? favorites.birthTeamFavorites.map(item => item.entityId)
      : favorites.playerFavorites.map(item => item.entityId)
  }, [
    favorites.birthTeamFavorites,
    favorites.playerFavorites,
    queryFilters.favoritesOnly,
    queryFilters.searchContext,
  ])
  const favoritesKey = React.useMemo(
    () => favoriteEntityIds.slice().sort().join('|'),
    [favoriteEntityIds]
  )

  const [previewCount, setPreviewCount] = React.useState(0)
  const [previewLoading, setPreviewLoading] = React.useState(true)
  const [previewError, setPreviewError] = React.useState(null)

  React.useEffect(() => {
    let active = true

    setPreviewLoading(true)
    setPreviewError(null)

    readSearchPageCount({
      filters: queryFilters,
      favoriteEntityIds,
    })
      .then(count => {
        if (!active) return
        setPreviewCount(count)
        setPreviewLoading(false)
      })
      .catch(error => {
        if (!active) return
        setPreviewCount(0)
        setPreviewError(error)
        setPreviewLoading(false)
      })

    return () => {
      active = false
    }
  }, [favoritesKey, queryFiltersKey, queryFilters, favoriteEntityIds])

  return {
    previewCount,
    previewLoading,
    previewError,
  }
}
