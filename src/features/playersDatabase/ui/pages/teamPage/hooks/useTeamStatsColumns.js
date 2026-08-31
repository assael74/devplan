// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsColumns.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import ScoutStoryChip from '../../../components/scout/ScoutStoryChip.js'
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
import { teamStatsColumnsSx as sx } from './useTeamStatsColumns.sx.js'

function getIdentityColor(status) {
  const colors = {
    [STATS_IDENTITY_STATUS.ROSTER_MATCH]: 'success',
    [STATS_IDENTITY_STATUS.SYSTEM_MATCH]: 'primary',
    [STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE]: 'warning',
    [STATS_IDENTITY_STATUS.NEW_PLAYER]: 'neutral',
    [STATS_IDENTITY_STATUS.AMBIGUOUS]: 'warning',
    [STATS_IDENTITY_STATUS.UNRESOLVED]: 'danger',
  }

  return colors[status] || 'neutral'
}

const resolvePlayerUrl = value => {
  const playerUrl = String(value || '').trim()

  if (!playerUrl) return ''
  if (/^https?:\/\//i.test(playerUrl)) return playerUrl

  const path = playerUrl.startsWith('/')
    ? playerUrl
    : `/${playerUrl}`

  return `https://www.football.org.il${path}`
}

const TRANSFER_DIRECTIONS = ['unknown', 'up', 'lateral', 'down']

const getNextTransferDirection = value => {
  const currentIndex = TRANSFER_DIRECTIONS.indexOf(value)
  return TRANSFER_DIRECTIONS[(currentIndex + 1) % TRANSFER_DIRECTIONS.length]
}

const getTransferDirectionIcon = value => ({
  up: 'sortUp',
  lateral: 'swapVert',
  down: 'sortDown',
}[value] || 'swapVert')

const getTransferDirectionColor = value => ({
  up: 'success',
  lateral: 'primary',
  down: 'danger',
}[value] || 'neutral')

const getMinutesCorrectionImpactLabel = row => {
  const impact = row?.statsMinutesCorrection
  if (!impact) return ''

  const added = Array.isArray(impact.addedProfiles) ? impact.addedProfiles : []
  const removed = Array.isArray(impact.removedProfiles) ? impact.removedProfiles : []
  const addedLabel = added.length ? `נוספו: ${added.map(item => item.label).join(', ')}` : ''
  const removedLabel = removed.length ? `הוסרו: ${removed.map(item => item.label).join(', ')}` : ''

  if (!addedLabel && !removedLabel) {
    return `תיקון דקות: -${impact.amount} · ללא שינוי בפרופיל`
  }

  return [
    `תיקון דקות: -${impact.amount}`,
    addedLabel,
    removedLabel,
  ].filter(Boolean).join(' · ')
}

const getTransferDirectionLabel = value => ({
  unknown: 'כיוון מעבר: לא ידוע',
  up: 'כיוון מעבר: התקדם לרמה גבוהה יותר',
  lateral: 'כיוון מעבר: אותה רמה',
  down: 'כיוון מעבר: ירד רמה',
}[value] || 'כיוון מעבר: לא ידוע')

const toFiniteNumber = value => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

const getSeasonMinutes = row => {
  const seasonMinutes = toFiniteNumber(
    row.scoutCalculationContract?.seasonMinutes
  )

  return seasonMinutes !== null && seasonMinutes > 0
    ? seasonMinutes
    : null
}

const getMinutesPct = row => {
  const minutes = toFiniteNumber(row.minutes)
  const seasonMinutes = getSeasonMinutes(row)

  if (minutes === null || seasonMinutes === null) return null

  return minutes / seasonMinutes
}

const getStartsPct = row => {
  const starts = toFiniteNumber(row.starts)
  const teamGames = toFiniteNumber(
    row.scoutCalculationContract?.teamGames
  )

  if (starts === null || teamGames === null || teamGames <= 0) return null

  return starts / teamGames
}

const getMinutesPerGame = row => {
  const minutes = toFiniteNumber(row.minutes)
  const games = toFiniteNumber(row.games)

  if (minutes === null || games === null || games <= 0) return null

  return minutes / games
}

const getGoalMark = value => {
  const goals = toFiniteNumber(value)

  if (goals === null || goals < 5) return null

  if (goals >= 15) {
    return {
      variant: 'solid',
      text: '15+ שערים · תנאי בסיס של הסקורר המובהק',
    }
  }

  if (goals >= 10) {
    return {
      variant: 'outlined',
      text: '10+ שערים · עוקף את דרישת ההקשר ההתקפי בפרופילים הרלוונטיים',
    }
  }

  if (goals >= 7) {
    return {
      variant: 'soft',
      text: '7-9 שערים · תנאי בסיס של האיום המשני',
    }
  }

  return {
    variant: 'soft',
    text: '5+ שערים · תנאי בסיס של ניצול מצבים קטלני / האיום מאחור',
  }
}

const getGamesMark = row => {
  const games = toFiniteNumber(row.games)
  const starts = toFiniteNumber(row.starts)
  const subIn = toFiniteNumber(row.substituteIn)
  const minutesPerGame = getMinutesPerGame(row)
  const younger = (
    row.rosterStatus === 'youngerAgeGroup' ||
    row.isYoungerAgeGroup === true
  )

  if (younger && games !== null && games >= 3) {
    return {
      color: 'success',
      text: 'שנתון צעיר + 3 משחקים ומעלה · תנאי הבסיס של הכישרון המוקפץ',
    }
  }

  const blockedTopTeam = (
    games !== null &&
    games >= 10 &&
    minutesPerGame !== null &&
    minutesPerGame <= 25 &&
    subIn !== null &&
    subIn >= 6 &&
    starts !== null &&
    starts <= 3
  )

  if (blockedTopTeam) {
    return {
      color: 'warning',
      text: 'עומד בתנאי הנתונים של שחקן איכותי שלא מצליח לפרוץ',
    }
  }

  return null
}

const getStartsMark = row => {
  const startsPct = getStartsPct(row)
  const subOut = toFiniteNumber(row.substitutedOut)

  if (startsPct === null || startsPct < 0.9 || subOut !== 0) return null

  return {
    color: 'success',
    text: '90%+ פתיחות בהרכב וללא החלפה · תנאי הבסיס של באנקר הרכב',
  }
}

const getMinutesPctMark = row => {
  const minutesPct = getMinutesPct(row)

  if (minutesPct === null) return null

  if (minutesPct >= 0.9) {
    return {
      color: 'success',
      variant: 'solid',
      text: '90%+ מדקות הקבוצה · תנאי הבסיס של העוגן המקצועי',
    }
  }

  if (minutesPct >= 0.85) {
    const goals = toFiniteNumber(row.goals)
    const goalsOk = goals !== null && goals <= 2

    return {
      color: goalsOk ? 'success' : 'warning',
      variant: 'soft',
      text: goalsOk
        ? '85%+ מדקות הקבוצה ועד 2 שערים · תנאי הבסיס של התחנה האחרונה'
        : '85%+ מדקות הקבוצה, אבל תנאי השערים של התחנה האחרונה לא עבר',
    }
  }

  if (minutesPct >= 0.05 && minutesPct <= 0.15) {
    return {
      color: 'warning',
      variant: 'soft',
      text: '5%-15% מדקות הקבוצה · טווח הבסיס של שחקן איכותי שלא מקבל הזדמנות',
    }
  }

  return null
}

const renderMarkedNumber = ({ value, mark }) => {
  if (!mark) {
    return (
      <Typography level='body-sm'>
        {value || value === 0 ? value : '-'}
      </Typography>
    )
  }

  return (
    <Tooltip title={mark.text}>
      <Chip
        size='sm'
        color={mark.color || 'success'}
        variant={mark.variant || 'soft'}
        sx={sx.markedNumber}
      >
        {value || value === 0 ? value : '-'}
      </Chip>
    </Tooltip>
  )
}

const PlayerUrlIcon = ({ playerUrl }) => {
  const href = resolvePlayerUrl(playerUrl)

  if (!href) return null

  return (
    <Tooltip title={href}>
      <IconButton
        component='a'
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        size='sm'
        variant='plain'
        color='primary'
        sx={sx.playerUrlIcon}
        onClick={event => event.stopPropagation()}
      >
        {iconUi({
          id: 'link',
          size: 'sm',
        })}
      </IconButton>
    </Tooltip>
  )
}

const resolveScoutProfileSortLabel = row => {
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
    player: row,
  })

  return scoutView.label || ''
}

const isTransferRosterStatus = status => (
  status === 'transferredOut' ||
  status === 'transferredIn'
)

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

  const goalsColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[3],
    sortable: true,
    sortValue: row => {
      const goals = toFiniteNumber(row.goals)
      return goals === null ? -1 : goals
    },
  }), [])

  const startsColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[4],
  }), [])

  const minutesPctColumn = React.useMemo(() => ({
    key: 'minutesPct',
    label: '% דקות',
    readOnly: true,
    sx: {
      width: 82,
      minWidth: 82,
    },
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
    sx: sx.identityColumn,
    render: ({ row, rowIndex, column, cellStatus, onCellChange }) => {
      const isInvalidIdentity = cellStatus?.valid === false
      const isUnidentifiedPlayer = row.identityStatus === STATS_IDENTITY_STATUS.UNRESOLVED || (
        row.identityStatus === STATS_IDENTITY_STATUS.NEW_PLAYER && isInvalidIdentity
      )
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
          <Chip
            size='sm'
            variant='soft'
            color={isInvalidIdentity ? 'danger' : getIdentityColor(row.identityStatus)}
            sx={sx.identityChip}
          >
            {identityLabel}
          </Chip>
        </Tooltip>
      )
    },
  }), [])

  const statusColumn = React.useMemo(() => ({
    key: 'rosterStatus',
    label: 'סטטוס בסגל',
    sx: sx.statusColumn,
    render: ({ row, rowIndex, column, onCellChange }) => {
      if (row.identityStatus === STATS_IDENTITY_STATUS.ROSTER_MATCH) {
        return (
          <Typography level='body-sm' sx={sx.statusText}>
            שחקן סגל
          </Typography>
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
                {option.label}
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

  const scoutProfileColumn = React.useMemo(() => ({
    key: 'scoutProfiles',
    label: 'פרופילי סקאוט',
    sortable: true,
    sortValue: resolveScoutProfileSortLabel,
    sx: sx.scoutProfileColumn,
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
        player: row,
      })
      const hasProfileCorrection = Boolean(
        row.statsMinutesCorrection?.addedProfiles?.length ||
        row.statsMinutesCorrection?.removedProfiles?.length
      )

      return (
        <Box sx={sx.profileWrap}>
          <ScoutStoryChip
            player={row}
            label={scoutView.compactLabel}
            fontSize={10}
          />
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
    PLAYER_STATS_BASE_COLUMNS[0],
    nameColumn,
    identityColumn,
    statusColumn,
    scoutProfileColumn,
    gamesColumn,
    goalsColumn,
    startsColumn,
    minutesColumn,
    minutesPctColumn,
  ], [
    gamesColumn,
    goalsColumn,
    identityColumn,
    minutesColumn,
    minutesPctColumn,
    nameColumn,
    scoutProfileColumn,
    startsColumn,
    statusColumn,
  ])
}

function NameMatchPopover({
  value,
  selectedValue,
  message,
  options,
  playerUrl,
  onChange,
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Box sx={sx.matchRow}>
      <Dropdown open={open} onOpenChange={(event, nextOpen) => setOpen(nextOpen)}>
        <Tooltip title={message}>
          <MenuButton size='sm' color='neutral' variant='plain' sx={sx.invalidNameButton}>
            {value || 'בחר שחקן'}
          </MenuButton>
        </Tooltip>
        <Menu size='sm' variant='outlined' placement='bottom-start'>
        <Stack sx={sx.nameMatchPopover} spacing={0.65}>
          <Typography level='body-xs'>{message}</Typography>
          <Select size='sm' value={selectedValue || null} placeholder='בחר שחקן מהסגל' onChange={(event, nextValue) => { onChange(nextValue || ''); setOpen(false) }}>
            {options.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
          </Select>
        </Stack>
        </Menu>
      </Dropdown>
      <PlayerUrlIcon playerUrl={playerUrl} />
    </Box>
  )
}

function IdentityResolutionPopover({
  row,
  rowIndex,
  column,
  onCellChange,
  mode,
  label,
}) {
  const [open, setOpen] = React.useState(false)
  const candidates = Array.isArray(row.identityCandidates) ? row.identityCandidates : []
  const systemCandidate = candidates[0] || null
  const originalFullName = row.originalFullName || row.fullName || '-'
  const approveCandidate = candidate => {
    if (!candidate?.playerId || typeof onCellChange !== 'function') return

    onCellChange({
      row,
      rowIndex,
      column: { ...column, key: 'systemCandidateApproval' },
      value: candidate.candidateKey || candidate.playerId,
    })
    setOpen(false)
  }

  return (
    <Dropdown open={open} onOpenChange={(event, nextOpen) => setOpen(nextOpen)}>
      <MenuButton
        size='sm'
        variant='soft'
        color='warning'
        sx={sx.identityResolutionButton}
      >
        {label}
      </MenuButton>
      <Menu size='sm' variant='outlined' placement='bottom-start'>
        <Stack sx={sx.identityResolutionPopover} spacing={0.7}>
          <Typography level='body-xs' sx={sx.identityResolutionName}>
            {originalFullName}
          </Typography>
          {mode === 'systemCandidate' ? (
            <>
              <Typography level='body-xs'>
                {systemCandidate?.displayName || systemCandidate?.fullName || systemCandidate?.playerDocumentId || 'לא נמצאה התאמה מאושרת'}
              </Typography>
              {systemCandidate?.playerId ? (
                <Button size='sm' onClick={() => approveCandidate(systemCandidate)}>
                  אשר התאמה
                </Button>
              ) : (
                <Typography level='body-xs' color='warning'>
                  קיים במערכת אך חסר קישור זהות קנוני
                </Typography>
              )}
            </>
          ) : null}
          {mode === 'ambiguous' ? (
            <Select
              size='sm'
              value={null}
              placeholder='בחר התאמה קיימת'
              onChange={(event, candidateKey) => {
                const candidate = candidates.find(item => item.candidateKey === candidateKey)
                if (candidate) approveCandidate(candidate)
              }}
            >
              {candidates.map(candidate => (
                <Option
                  key={candidate.candidateKey || candidate.playerId || candidate.playerDocumentId}
                  value={candidate.candidateKey}
                  disabled={!candidate.playerId}
                >
                  {candidate.displayName || candidate.fullName || candidate.playerDocumentId || candidate.playerId}
                </Option>
              ))}
            </Select>
          ) : null}
        </Stack>
      </Menu>
    </Dropdown>
  )
}
