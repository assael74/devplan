// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerHistoryView.js

import * as React from 'react'

import { PLAYER_HISTORY_PLACEHOLDER_ROWS } from '../logic/playerPage.constants.js'
import { resolvePlayerHistoryRows } from '../logic/playerPage.utils.js'

export default function usePlayerHistoryView(player) {
  const [selectedSeasonKey, setSelectedSeasonKey] = React.useState('')
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
    selectedSeasonKey
      ? rows.filter(row => row.seasonKey === selectedSeasonKey)
      : rows
  ), [rows, selectedSeasonKey])

  React.useEffect(() => {
    setSelectedSeasonKey('')
  }, [player.playerId])

  return {
    rows,
    visibleRows,
    selectedSeasonKey,
    setSelectedSeasonKey,
    seasonOptions,
    hasRealData: sourceRows.length > 0,
  }
}
