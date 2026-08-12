// features/playersDatabase/ui/pages/teamPage/hooks/useTeamStatsColumns.js

import * as React from 'react'
import {
  Box,
  Chip,
  IconButton,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
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
import { teamStatsColumnsSx as sx } from './useTeamStatsColumns.sx.js'

function getIdentityColor(status) {
  const colors = {
    [STATS_IDENTITY_STATUS.ROSTER_MATCH]: 'success',
    [STATS_IDENTITY_STATUS.SYSTEM_MATCH]: 'primary',
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
    const yellowCards = toFiniteNumber(row.yellowCards)
    const cardsOk = yellowCards !== null && yellowCards <= 6

    return {
      color: cardsOk ? 'success' : 'warning',
      variant: 'soft',
      text: cardsOk
        ? '85%+ מדקות הקבוצה ועד 6 צהובים · תנאי הבסיס של התחנה האחרונה'
        : '85%+ מדקות הקבוצה, אבל תנאי הצהובים של התחנה האחרונה לא עבר',
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
  })

  return scoutView.label || ''
}

export default function useTeamStatsColumns({
  players,
  rosterLookup,
  getRowStatus,
}) {
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
      const rowStatus = typeof getRowStatus === 'function'
        ? getRowStatus(row)
        : null
      const rowValid = rowStatus?.valid === true

      if (rowValid) {
        return (
          <Box sx={sx.validNameRow}>
            <Typography
              level='body-sm'
              sx={sx.validName}
            >
              {value || '-'}
            </Typography>

            <PlayerUrlIcon playerUrl={row.playerUrl} />
          </Box>
        )
      }

      return (
        <Box sx={sx.matchRow}>
          <Select
            size='sm'
            value={matchedPlayer ? row.matchedPlayerId || null : null}
            placeholder={value || 'בחר שחקן מהסגל'}
            sx={sx.matchSelect}
            onChange={(event, nextValue) => {
              if (typeof onCellChange !== 'function') return

              onCellChange({
                row,
                rowIndex,
                column: {
                  ...column,
                  key: 'fullNameRosterMatch',
                },
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

          <PlayerUrlIcon playerUrl={row.playerUrl} />
        </Box>
      )
    },
  }), [getRowStatus, rosterLookup, rosterPlayerOptions])

  const gamesColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[2],
    readOnly: true,
    render: ({ row, value }) => renderMarkedNumber({
      value,
      mark: getGamesMark(row),
    }),
  }), [])

  const goalsColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[3],
    readOnly: true,
    render: ({ value }) => renderMarkedNumber({
      value,
      mark: getGoalMark(value),
    }),
  }), [])

  const startsColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[4],
    readOnly: true,
    render: ({ row, value }) => renderMarkedNumber({
      value,
      mark: getStartsMark(row),
    }),
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
    sortValue: row => toFiniteNumber(row.minutes) ?? -1,
  }), [])

  const identityColumn = React.useMemo(() => ({
    key: 'identityStatus',
    label: 'זיהוי שחקן',
    readOnly: true,
    sortable: true,
    sortValue: row => getStatsIdentityLabel(row.identityStatus),
    sx: sx.identityColumn,
    render: ({ row }) => (
      <Tooltip title={row.identityMessage || getStatsIdentityLabel(row.identityStatus)}>
        <Chip
          size='sm'
          variant='soft'
          color={getIdentityColor(row.identityStatus)}
          sx={sx.identityChip}
        >
          {getStatsIdentityLabel(row.identityStatus)}
        </Chip>
      </Tooltip>
    ),
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

      const selectedOption = STATS_ROSTER_STATUS_OPTIONS.find(option => (
        option.value === row.rosterStatus
      )) || null

      if (selectedOption) {
        return (
          <Typography level='body-sm' sx={sx.statusText}>
            {selectedOption.label}
          </Typography>
        )
      }

      return (
        <Select
          size='sm'
          value={null}
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
      })

      if (!scoutView.primaryItem || !scoutView.label) {
        return (
          <Typography level='body-sm' sx={sx.emptyProfile}>
            -
          </Typography>
        )
      }

      return (
        <Box sx={sx.profileWrap}>
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
