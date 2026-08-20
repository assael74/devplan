// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerHistoryView.js

import * as React from 'react'

import { PLAYER_HISTORY_PLACEHOLDER_ROWS } from '../logic/playerPage.constants.js'
import {
  resolveLatestSeasonContext,
  resolvePlayerHistoryRows,
} from '../logic/playerPage.utils.js'

function buildContextLabel(row, duplicateTeam) {
  const teamBase = row.clubName && row.clubName !== '-'
    ? row.clubName
    : row.teamName || 'קבוצה'
  const slot = duplicateTeam && row.birthTeamSlot
    ? ` ${row.birthTeamSlot}`
    : ''
  const league = row.leagueName && row.leagueName !== '-'
    ? row.leagueName
    : 'ליגה לא ידועה'
  const ageGroup = row.ageGroupLabel && row.ageGroupLabel !== '-'
    ? row.ageGroupLabel
    : ''
  const playingUp = row.isYoungerAgeGroup ? ' · משחק מעל שנתון' : ''

  return [
    `${teamBase}${slot}`,
    league,
    ageGroup,
  ].filter(Boolean).join(' · ') + playingUp
}

export default function usePlayerHistoryView(player) {
  const sourceRows = React.useMemo(
    () => resolvePlayerHistoryRows(player),
    [player]
  )
  const rows = React.useMemo(
    () => sourceRows.length ? sourceRows : PLAYER_HISTORY_PLACEHOLDER_ROWS,
    [sourceRows]
  )
  const defaultRow = React.useMemo(
    () => resolveLatestSeasonContext(rows),
    [rows]
  )
  const [selectedContextId, setSelectedContextId] = React.useState('')

  React.useEffect(() => {
    const selectedExists = rows.some(row => row.id === selectedContextId)

    if (selectedExists) return

    setSelectedContextId(defaultRow?.id || '')
  }, [defaultRow?.id, rows, selectedContextId])

  const selectedRow = React.useMemo(() => (
    rows.find(row => row.id === selectedContextId) || defaultRow || null
  ), [defaultRow, rows, selectedContextId])
  const contextOptions = React.useMemo(() => rows.map(row => {
    const duplicateTeam = rows.filter(item => (
      item.seasonKey === row.seasonKey &&
      item.clubName === row.clubName
    )).length > 1

    return {
      id: row.id,
      seasonKey: row.seasonKey,
      teamId: row.teamId,
      leagueId: row.leagueId,
      label: `${row.seasonKey} · ${buildContextLabel(row, duplicateTeam)}`,
    }
  }), [rows])

  return {
    rows,
    visibleRows: rows,
    selectedRow,
    selectedContextId: selectedRow?.id || '',
    selectedSeasonKey: selectedRow?.seasonKey || defaultRow?.seasonKey || '',
    latestSeasonKey: defaultRow?.seasonKey || '',
    contextOptions,
    hasRealData: sourceRows.length > 0,
    setSelectedContextId,
  }
}
