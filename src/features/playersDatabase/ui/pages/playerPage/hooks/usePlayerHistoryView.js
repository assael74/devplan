// features/playersDatabase/ui/pages/playerPage/hooks/usePlayerHistoryView.js

import * as React from 'react'

import {
  PLAYER_HISTORY_FILTERS,
  PLAYER_HISTORY_PLACEHOLDER_ROWS,
} from '../logic/playerPage.constants.js'
import { resolvePlayerHistoryRows } from '../logic/playerPage.utils.js'

export default function usePlayerHistoryView(
  player,
  selectedSeasonKey,
  onSeasonChange
) {
  const [filter, setFilter] = React.useState(
    PLAYER_HISTORY_FILTERS.ALL
  )

  const sourceRows = React.useMemo(
    () => resolvePlayerHistoryRows(player),
    [player]
  )
  const rows = React.useMemo(
    () => sourceRows.length
      ? sourceRows
      : PLAYER_HISTORY_PLACEHOLDER_ROWS,
    [sourceRows]
  )
  const seasonOptions = React.useMemo(() => {
    const keys = [...new Set(
      rows
        .map(row => row.seasonKey)
        .filter(Boolean)
    )]

    return keys.map(seasonKey => ({
      seasonKey,
      label: seasonKey,
    }))
  }, [rows])
  const visibleRows = React.useMemo(() => (
    rows.filter(row => {
      const shouldFilterBySeason = filter === PLAYER_HISTORY_FILTERS.ALL
      const matchesSeason = !shouldFilterBySeason ||
        !selectedSeasonKey ||
        row.seasonKey === selectedSeasonKey

      if (!matchesSeason) return false

      if (filter === PLAYER_HISTORY_FILTERS.CURRENT) {
        return row.isCurrentSeason
      }

      if (filter === PLAYER_HISTORY_FILTERS.PREVIOUS) {
        return !row.isCurrentSeason
      }

      return true
    })
  ), [
    filter,
    rows,
    selectedSeasonKey,
  ])

  const handleSeasonChange = React.useCallback(seasonKey => {
    setFilter(PLAYER_HISTORY_FILTERS.ALL)

    if (onSeasonChange) {
      onSeasonChange(seasonKey || '')
    }
  }, [onSeasonChange])

  const handleFilterChange = React.useCallback(nextFilter => {
    setFilter(nextFilter)
  }, [])

  return {
    filter,
    setFilter: handleFilterChange,
    rows,
    visibleRows,
    selectedSeasonKey: filter === PLAYER_HISTORY_FILTERS.ALL
      ? selectedSeasonKey
      : '',
    setSelectedSeasonKey: handleSeasonChange,
    seasonOptions,
    hasRealData: sourceRows.length > 0,
  }
}
