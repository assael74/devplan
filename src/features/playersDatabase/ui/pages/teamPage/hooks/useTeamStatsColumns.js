// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsColumns.js

import * as React from 'react'
import {
  Box,
  Chip,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import ScoutCompactTooltip from '../../../components/scout/ScoutCompactTooltip.js'
import { buildScoutCompactView } from '../../../components/scout/scoutDisplay.model.js'
import {
  PLAYER_STATS_BASE_COLUMNS,
  STATS_ROSTER_STATUS_OPTIONS,
} from '../logic/teamPage.constants.js'
import {
  STATS_IDENTITY_STATUS,
  findStatsRosterMatch,
  getRosterPlayerOptionValue,
  getStatsIdentityLabel,
} from '../logic/teamStatsMatch.logic.js'

const getIdentityColor = status => ({
  [STATS_IDENTITY_STATUS.ROSTER_MATCH]: 'success',
  [STATS_IDENTITY_STATUS.SYSTEM_MATCH]: 'primary',
  [STATS_IDENTITY_STATUS.NEW_PLAYER]: 'neutral',
  [STATS_IDENTITY_STATUS.AMBIGUOUS]: 'warning',
  [STATS_IDENTITY_STATUS.UNRESOLVED]: 'danger',
}[status] || 'neutral')

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
      const identityResolved = [
        STATS_IDENTITY_STATUS.ROSTER_MATCH,
        STATS_IDENTITY_STATUS.SYSTEM_MATCH,
      ].includes(row.identityStatus)

      if (identityResolved) {
        return (
          <Typography level='body-sm' sx={{ fontWeight: 600, textAlign: 'left' }}>
            {value || '-'}
          </Typography>
        )
      }

      return (
        <Select
          size='sm'
          value={matchedPlayer ? row.matchedPlayerId || null : null}
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

  const identityColumn = React.useMemo(() => ({
    key: 'identityStatus',
    label: 'זיהוי שחקן',
    readOnly: true,
    sx: { minWidth: 132 },
    render: ({ row }) => (
      <Tooltip title={row.identityMessage || getStatsIdentityLabel(row.identityStatus)}>
        <Chip
          size='sm'
          variant='soft'
          color={getIdentityColor(row.identityStatus)}
          sx={{ fontWeight: 600 }}
        >
          {getStatsIdentityLabel(row.identityStatus)}
        </Chip>
      </Tooltip>
    ),
  }), [])

  const statusColumn = React.useMemo(() => ({
    key: 'rosterStatus',
    label: 'סטטוס בסגל',
    sx: { minWidth: 155 },
    render: ({ row, rowIndex, column, onCellChange }) => {
      if (row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH) {
        return (
          <Typography level='body-sm' sx={{ fontWeight: 600 }}>
            שחקן סגל
          </Typography>
        )
      }

      const selectedOption = STATS_ROSTER_STATUS_OPTIONS.find(option => (
        option.value === row.rosterStatus
      )) || null

      if (selectedOption) {
        return (
          <Typography level='body-sm' sx={{ fontWeight: 600 }}>
            {selectedOption.label}
          </Typography>
        )
      }

      return (
        <Select
          size='sm'
          value={null}
          placeholder='בחר סטטוס'
          sx={{ minWidth: 155 }}
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
  }), [])

  const scoutProfileColumn = React.useMemo(() => ({
    key: 'scoutProfiles',
    label: 'פרופילי סקאוט',
    sx: { width: 250, minWidth: 250 },
    render: ({ row }) => {
      const profiles = [
        ...(Array.isArray(row.scoutProfiles) ? row.scoutProfiles : []),
        ...(Array.isArray(row.scoutSignals) ? row.scoutSignals : []),
      ]
      const scoutView = buildScoutCompactView({
        profiles,
        combinations: Array.isArray(row.scoutCombinations)
          ? row.scoutCombinations
          : [],
        display: row.scoutProfileDisplay || {},
      })

      if (!scoutView.primaryItem || !scoutView.label) {
        return (
          <Typography level='body-sm' sx={{ color: 'neutral.500' }}>
            -
          </Typography>
        )
      }

      return (
        <Box sx={{ display: 'flex', minWidth: 0 }}>
          <ScoutProfileChip
            label={scoutView.label}
            tooltip={(
              <ScoutCompactTooltip
                title={scoutView.tooltipTitle}
                items={scoutView.tooltipItems}
                isCombination={scoutView.isCombination}
              />
            )}
            iconId={scoutView.primaryItem.iconId}
            variant={scoutView.variant}
            fontSize={10}
          />
        </Box>
      )
    },
  }), [])

  return React.useMemo(() => [
    PLAYER_STATS_BASE_COLUMNS[0],
    nameColumn,
    identityColumn,
    statusColumn,
    scoutProfileColumn,
    ...PLAYER_STATS_BASE_COLUMNS.slice(2),
  ], [identityColumn, nameColumn, scoutProfileColumn, statusColumn])
}
