// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsColumns.js

import * as React from 'react'
import {
  Box,
  Chip,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import ScoutProfileChip from '../../../components/scout/profile/ScoutProfileChip.js'
import PlayerLineClassificationChip from '../../../components/playerMeta/PlayerLineClassificationChip.js'
import { buildTableScoutProfileChip } from '../model/teamPositionScoutProfile.presentation.js'
import {
  PLAYER_STATS_BASE_COLUMNS,
  STATS_ROSTER_STATUS_OPTIONS,
} from '../logic/teamPage.constants.js'
import { TEAM_STATS_IMPORT_TABLE_WIDTHS } from '../../../components/modals/sx/statsImportTableWidths.sx.js'
import {
  STATS_IDENTITY_STATUS,
  findStatsRosterMatch,
  getRosterPlayerOptionValue,
  getStatsIdentityLabel,
} from '../logic/teamStatsMatch.logic.js'
import { teamStatsColumnsSx as sx } from './useTeamStatsColumns.sx.js'
import {
  IdentityResolutionPopover,
  NameMatchPopover,
  PlayerUrlIcon,
  ROSTER_STATUS_SHORT_LABELS,
  TableHeaderIcon,
  getIdentityColor,
  getMinutesCorrectionImpactLabel,
  getMinutesPct,
  getMinutesPctMark,
  getNextTransferDirection,
  getTransferDirectionColor,
  getTransferDirectionIcon,
  getTransferDirectionLabel,
  isTransferRosterStatus,
  renderMarkedNumber,
  resolveScoutProfileSortLabel,
  toFiniteNumber,
} from './teamStatsColumns.presentation.js'

export default function useTeamStatsColumns({
  players,
  rosterLookup,
  getRowStatus,
  getCellStatus,
}) {
  const rosterPlayerOptions = React.useMemo(() => players
    .map(player => ({
      value: getRosterPlayerOptionValue(player),
      label: player.fullName || player.normalizedName || player.playerId || 'שחקן ללא שם',
    }))
    .filter(option => option.value), [players])

  const nameColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[1],
    render: ({ row, rowIndex, column, value, onCellChange, cellStatus }) => {
      const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
      const rowValid = cellStatus?.valid !== false

      if (rowValid) {
        return (
          <Box sx={sx.validNameRow}>
            <Typography
              level='body-sm'
              sx={sx.validName}
            >
              {row.originalFullName || value || '-'}
            </Typography>

            <PlayerUrlIcon playerUrl={row.playerUrl} />
          </Box>
        )
      }

      return <NameMatchPopover
        value={row.originalFullName || value}
        selectedValue={matchedPlayer ? row.matchedPlayerId || '' : ''}
        message={cellStatus?.message || 'בחר שחקן מהסגל'}
        options={rosterPlayerOptions}
        playerUrl={row.playerUrl}
        onChange={nextValue => onCellChange?.({ row, rowIndex, column: { ...column, key: 'fullNameRosterMatch' }, value: nextValue })}
      />
    },
  }), [getCellStatus, rosterLookup, rosterPlayerOptions])

  const gamesColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[2],
  }), [])

  const indexColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[0],
    headerContent: <TableHeaderIcon id='sortOrder' label='אינדקס' />,
  }), [])

  const goalsColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[3],
    headerContent: <TableHeaderIcon id='goals' label='שערים' />,
    sortable: true,
    sortValue: row => {
      const goals = toFiniteNumber(row.goals)
      return goals === null ? -1 : goals
    },
  }), [])

  const startsColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[4],
    headerContent: <TableHeaderIcon id='isStart' label='הרכב פותח' />,
  }), [])

  const substitutionsColumn = React.useMemo(() => ({
    key: 'substitutedOut',
    label: 'הוחלף',
    headerContent: <TableHeaderIcon id='swapVert' label='הוחלף במהלך המשחק' />,
    sortable: true,
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.substitutedOut,
    sortValue: row => toFiniteNumber(row.substitutedOut) || 0,
  }), [])

  const minutesPctColumn = React.useMemo(() => ({
    key: 'minutesPct',
    label: '% דקות',
    readOnly: true,
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.minutesPct,
    render: ({ row }) => {
      const minutesPct = getMinutesPct(row)

      if (minutesPct === null) {
        return (
          <Typography level='body-sm'>
            -
          </Typography>
        )
      }

      return renderMarkedNumber({
        value: `${Math.round(minutesPct * 100)}%`,
        mark: getMinutesPctMark(row),
      })
    },
  }), [])

  const minutesColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[5],
    sortable: true,
    sortValue: row => {
      const minutes = toFiniteNumber(row.minutes)
      return minutes === null ? -1 : minutes
    },
  }), [])

  const identityColumn = React.useMemo(() => ({
    key: 'identityStatus',
    label: 'זיהוי שחקן',
    readOnly: true,
    sortable: true,
    sortValue: row => getStatsIdentityLabel(row.identityStatus),
    sx: {
      ...sx.identityColumn,
      ...TEAM_STATS_IMPORT_TABLE_WIDTHS.identityStatus,
    },
    render: ({ row, rowIndex, column, cellStatus, onCellChange }) => {
      const isInvalidIdentity = cellStatus?.valid === false
      const isUnidentifiedPlayer = row.identityStatus === STATS_IDENTITY_STATUS.UNRESOLVED || (
        row.identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER && isInvalidIdentity
      )
      const isNewPlayer = row.identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER
      const isIdentifiedPlayer = row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH ||
        row.identityStatus === STATS_IDENTITY_STATUS.SYSTEM_MATCH
      const requiresSystemCandidateApproval = row.identityStatus === STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE
      const requiresAmbiguousChoice = row.identityStatus === STATS_IDENTITY_STATUS.AMBIGUOUS
      const identityLabel = isUnidentifiedPlayer
        ? 'לא זוהה שחקן'
        : isInvalidIdentity
        ? cellStatus.message || 'נדרשת הכרעת זהות'
        : getStatsIdentityLabel(row.identityStatus)

      if (requiresSystemCandidateApproval || requiresAmbiguousChoice) {
        return (
          <IdentityResolutionPopover
            row={row}
            rowIndex={rowIndex}
            column={column}
            onCellChange={onCellChange}
            mode={requiresSystemCandidateApproval ? 'systemCandidate' : 'ambiguous'}
            label={requiresSystemCandidateApproval ? 'אשר התאמה' : 'בחר התאמה'}
          />
        )
      }

      return (
        <Tooltip title={cellStatus?.message || row.identityMessage || identityLabel}>
          {isUnidentifiedPlayer ? (
            <Box component='span' aria-label='לא זוהה שחקן' sx={sx.unidentifiedIdentityIcon}>
              {iconUi({ id: 'newReleases', size: 'sm', sx: { color: 'danger.500' } })}
            </Box>
          ) : isNewPlayer ? (
            <Box component='span' aria-label='שחקן חדש' sx={sx.newPlayerIdentityIcon}>
              {iconUi({ id: 'rosterJoined', size: 'sm', sx: { color: 'primary.500' } })}
            </Box>
          ) : isIdentifiedPlayer ? (
            <Box component='span' aria-label={identityLabel} sx={sx.identifiedIdentityIcon}>
              {iconUi({ id: 'verified', size: 'sm', sx: { color: 'success.500' } })}
            </Box>
          ) : (
            <Chip
              size='sm'
              variant='soft'
              color={isInvalidIdentity ? 'danger' : getIdentityColor(row.identityStatus)}
              sx={sx.identityChip}
            >
              {identityLabel}
            </Chip>
          )}
        </Tooltip>
      )
    },
  }), [])

  const statusColumn = React.useMemo(() => ({
    key: 'rosterStatus',
    label: 'סטטוס בסגל',
    sx: {
      ...sx.statusColumn,
      ...TEAM_STATS_IMPORT_TABLE_WIDTHS.rosterStatus,
    },
    render: ({ row, rowIndex, column, onCellChange }) => {
      if (row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH) {
        return (
          <Tooltip title='שחקן סגל'>
            <Box component='span' aria-label='שחקן סגל' sx={sx.statusIcon}>
              {iconUi({ id: 'isSquad', size: 'sm' })}
            </Box>
          </Tooltip>
        )
      }

      const selectedStatus = STATS_ROSTER_STATUS_OPTIONS.some(option => (
        option.value === row.rosterStatus
      ))
        ? row.rosterStatus
        : null
      const showTransferDirection = isTransferRosterStatus(row.rosterStatus)

      return (
        <Stack direction='row' spacing={0.5} sx={sx.statusStack}>
          <Select
            size='sm'
            indicator={null}
            value={selectedStatus}
            placeholder='בחר סטטוס'
            sx={sx.statusSelect}
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
                {ROSTER_STATUS_SHORT_LABELS[option.value] || option.label}
              </Option>
            ))}
          </Select>

          {showTransferDirection ? (
            <Tooltip title={getTransferDirectionLabel(
              row.manualTransferDirection || 'unknown'
            )}>
              <Chip
                size='sm'
                variant='soft'
                color={getTransferDirectionColor(
                  row.manualTransferDirection || 'unknown'
                )}
                sx={sx.transferDirectionChip}
                onClick={() => {
                if (typeof onCellChange !== 'function') return

                onCellChange({
                  row,
                  rowIndex,
                  column: {
                    ...column,
                    key: 'manualTransferDirection',
                  },
                  value: getNextTransferDirection(
                    row.manualTransferDirection || 'unknown'
                  ),
                })
              }}
              >
                {iconUi({
                  id: getTransferDirectionIcon(
                    row.manualTransferDirection || 'unknown'
                  ),
                  size: 'sm',
                })}
              </Chip>
            </Tooltip>
          ) : null}
        </Stack>
      )
    },
  }), [])


  const lineClassificationColumn = React.useMemo(() => ({
    key: 'lineClassification',
    label: 'חוליה / עמדה',
    readOnly: true,
    sortable: true,
    sortValue: row => [
      row?.lineClassification?.line || '',
      row?.lineClassification?.position || '',
    ].join(' '),
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.lineClassification,
    render: ({ row }) => {
      const classification = row?.lineClassification
      return (
        <PlayerLineClassificationChip
          classification={classification}
          primaryPosition={row?.primaryPosition}
          compact
        />
      )
    },
  }), [])

  const scoutProfileColumn = React.useMemo(() => ({
    key: 'scoutProfiles',
    label: 'פרופילי סקאוט',
    sortable: true,
    sortValue: resolveScoutProfileSortLabel,
    sx: {
      ...sx.scoutProfileColumn,
      ...TEAM_STATS_IMPORT_TABLE_WIDTHS.scoutProfiles,
    },
    render: ({ row }) => {
      const profiles = [
        ...(Array.isArray(row.scoutProfiles) ? row.scoutProfiles : []),
        ...(Array.isArray(row.scoutSignals) ? row.scoutSignals : []),
      ]
      const scoutProfileChip = buildTableScoutProfileChip({
        ...row,
        scoutProfiles: profiles,
      })
      const hasProfileCorrection = Boolean(
        row.statsMinutesCorrection?.addedProfiles?.length ||
        row.statsMinutesCorrection?.removedProfiles?.length
      )

      return (
        <Box sx={sx.profileWrap}>
          {scoutProfileChip ? (
            <ScoutProfileChip
              {...scoutProfileChip}
              size='compact'
              tooltipSize='compact'
              showConditions
              showConditionsDepth
            />
          ) : null}
          {hasProfileCorrection ? (
            <Tooltip title={getMinutesCorrectionImpactLabel(row)} arrow>
              <Chip
                size='sm'
                variant='soft'
                color={row.statsMinutesCorrection.addedProfiles?.length
                  ? 'success'
                  : row.statsMinutesCorrection.removedProfiles?.length
                    ? 'danger'
                    : 'neutral'}
                sx={sx.profileCorrectionChip}
              >
                +{row.statsMinutesCorrection.addedProfiles?.length || 0}/-{row.statsMinutesCorrection.removedProfiles?.length || 0}
              </Chip>
            </Tooltip>
          ) : null}
        </Box>
      )
    },
  }), [])

  return React.useMemo(() => [
    indexColumn,
    nameColumn,
    identityColumn,
    statusColumn,
    scoutProfileColumn,
    lineClassificationColumn,
    gamesColumn,
    goalsColumn,
    startsColumn,
    substitutionsColumn,
    minutesColumn,
    minutesPctColumn,
  ], [
    gamesColumn,
    goalsColumn,
    identityColumn,
    indexColumn,
    lineClassificationColumn,
    minutesColumn,
    minutesPctColumn,
    nameColumn,
    scoutProfileColumn,
    startsColumn,
    statusColumn,
    substitutionsColumn,
  ])
}

