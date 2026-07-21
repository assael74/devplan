// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsColumns.js

import * as React from 'react'
import {
  Option,
  Select,
  Typography,
} from '@mui/joy'

import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import {
  PLAYER_STATS_BASE_COLUMNS,
  STATS_ROSTER_STATUS_OPTIONS,
} from '../logic/teamPage.constants.js'
import { clean } from '../logic/teamPage.utils.js'
import {
  findStatsRosterMatch,
  getRosterPlayerOptionValue,
} from '../logic/teamStatsMatch.logic.js'

export default function useTeamStatsColumns({ players, rosterLookup }) {
  const rosterPlayerOptions = React.useMemo(() => players
    .map(player => ({
      value: getRosterPlayerOptionValue(player),
      label: player.fullName || player.normalizedName || player.playerId || 'שחקן ללא שם',
    }))
    .filter(option => option.value), [players])

  const nameColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[1],
    render: ({ row, rowIndex, column, value, onCellChange }) => {
      const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
      const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
        option.value === row.rosterStatus
      ))

      if ((matchedPlayer && row.rosterStatus === 'regular') || isException) {
        return (
          <Typography level='body-sm' sx={{ fontWeight: 600, textAlign: 'left' }}>
            {value || '-'}
          </Typography>
        )
      }

      return (
        <Select
          size='sm'
          value={row.matchedPlayerId || null}
          placeholder={value || 'בחר שחקן מהסגל'}
          sx={{ minWidth: 190, textAlign: 'left' }}
          onChange={(event, nextValue) => {
            if (typeof onCellChange !== 'function') return

            onCellChange({
              row,
              rowIndex,
              column: { ...column, key: 'fullNameRosterMatch' },
              value: nextValue || '',
            })
          }}
        >
          {rosterPlayerOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )
    },
  }), [rosterLookup, rosterPlayerOptions])

  const exceptionColumn = React.useMemo(() => ({
    key: 'rosterStatus',
    label: 'סיווג חריג',
    sx: { minWidth: 150 },
    render: ({ row, rowIndex, column, onCellChange }) => {
      const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
      const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
        option.value === row.rosterStatus
      ))

      if (matchedPlayer && !isException) return null

      return (
        <Select
          size='sm'
          value={isException ? row.rosterStatus : null}
          placeholder='בחר חריג'
          sx={{ minWidth: 150 }}
          onChange={(event, nextValue) => {
            if (typeof onCellChange !== 'function') return

            onCellChange({
              row,
              rowIndex,
              column,
              value: nextValue || 'unresolved',
            })
          }}
        >
          {STATS_ROSTER_STATUS_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )
    },
  }), [rosterLookup])

  const scoutProfileColumn = React.useMemo(() => ({
    key: 'scoutProfiles',
    label: 'פרופיל סקאוט',
    sx: { width: 132, minWidth: 132 },
    render: ({ row }) => {
      const signal = row.bestScoutSignal || row.scoutSignals?.[0] || null

      if (!signal) {
        return (
          <Typography level='body-sm' sx={{ color: 'neutral.500' }}>
            -
          </Typography>
        )
      }

      const label = clean(signal.profileLabel || signal.label || signal.profileId) || 'פרופיל סקאוט'
      const score = Number.isFinite(Number(signal.score))
        ? Math.round(Number(signal.score))
        : null
      const reliability = signal.reliability?.label ||
        signal.reliability?.level ||
        signal.reliabilityLevel ||
        ''
      const tooltip = [
        label,
        score !== null ? `ציון ${score}` : '',
        reliability ? `אמינות ${reliability}` : '',
      ].filter(Boolean).join(' · ')

      return (
        <ScoutProfileChip
          label={label}
          tooltip={tooltip}
          fontSize={11}
        />
      )
    },
  }), [])

  return React.useMemo(() => [
    PLAYER_STATS_BASE_COLUMNS[0],
    nameColumn,
    exceptionColumn,
    scoutProfileColumn,
    ...PLAYER_STATS_BASE_COLUMNS.slice(2),
  ], [exceptionColumn, nameColumn, scoutProfileColumn])
}
