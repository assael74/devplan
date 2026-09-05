import * as React from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/joy'

import PlayerLineClassificationChip from '../../components/playerMeta/PlayerLineClassificationChip.js'
import ScoutProfileChipV2, { buildScoutProfileChipV2Model } from '../../components/scout/ScoutProfileChipV2.js'
import { buildScoutCompactView } from '../../components/scout/scoutDisplay.model.js'
import DataTable from '../../components/tables/dataTable/DataTable.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import exportTeamPositionClassificationToXlsx from './logic/teamPositionClassification.export.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'
import { teamPositionClassificationTableSx as sx } from './sx/teamPositionClassificationTable.sx.js'

const displayValue = value => value === null || value === undefined ? '—' : value

const PLAYER_STATUS_DISPLAY = {
  youngerAgeGroup: { label: 'שנתון צעיר', iconId: 'rosterYounger', color: 'primary' },
  retired: { label: 'פרש', iconId: 'rosterRetired', color: 'neutral' },
  transferredIn: { label: 'הצטרף במהלך העונה', iconId: 'rosterJoined', color: 'success' },
}

const renderPlayerName = row => {
  const direction = row.manualTransferDirection || 'unknown'
  const status = row.rosterStatus === 'transferredOut'
    ? ({
        up: { label: 'עזב לקבוצה ברמה גבוהה יותר', iconId: 'sortUp', color: 'success' },
        down: { label: 'עזב לקבוצה ברמה נמוכה יותר', iconId: 'sortDown', color: 'danger' },
        lateral: { label: 'עזב לקבוצה באותה רמה', iconId: 'swapVert', color: 'primary' },
      }[direction] || { label: 'עזב במהלך העונה', iconId: 'rosterLeft', color: 'danger' })
    : PLAYER_STATUS_DISPLAY[row.rosterStatus]

  return (
    <Box sx={sx.playerNameContent}>
      <Typography sx={sx.player}>{row.name}</Typography>
      {status ? (
        <Tooltip title={status.label}>
          <Box component='span' aria-label={status.label} sx={sx.playerStatusBadge(status.color)}>
            {iconUi({ id: status.iconId, size: 'sm' })}
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  )
}

const displayGamesStarts = row => {
  const games = displayValue(row.games)
  const starts = displayValue(row.starts)

  return `${games} / ${starts}`
}

const MINUTES_BAND_RANGES = Object.freeze({
  נמוך: '0–69%',
  בינוני: '70–74%',
  'בינוני־גבוה': '75–89%',
  גבוה: '90–100%',
})

const minutesProgressTooltip = band => (
  `${band} · ${MINUTES_BAND_RANGES[band] || '—'}`
)

const resolveMinutesProgressTone = rate => {
  const value = Number(rate)

  if (!Number.isFinite(value)) return 'unavailable'
  if (value >= 90) return 'high'
  if (value >= 75) return 'mediumHigh'
  if (value >= 70) return 'medium'
  return 'low'
}

const resolveMinutesTooltipColor = tone => ({
  high: 'success',
  mediumHigh: 'primary',
  medium: 'warning',
  low: 'danger',
  unavailable: 'neutral',
}[tone] || 'neutral')

const resolveMinutesBandLabel = (row, tone) => {
  if (MINUTES_BAND_RANGES[row.minutesBand]) return row.minutesBand

  return {
    high: 'גבוה',
    mediumHigh: 'בינוני־גבוה',
    medium: 'בינוני',
    low: 'נמוך',
  }[tone] || 'לא זמין'
}

const renderMinutes = row => {
  const hasRate = row.minutesRate !== null && row.minutesRate !== undefined
  const rate = Number(row.minutesRate)
  const progress = Number.isFinite(rate)
    ? Math.max(0, Math.min(100, rate))
    : 0
  const tone = resolveMinutesProgressTone(row.minutesRate)
  const band = resolveMinutesBandLabel(row, tone)

  return (
    <Tooltip
      title={minutesProgressTooltip(band)}
      placement='bottom'
      variant='soft'
      color={resolveMinutesTooltipColor(tone)}
      slotProps={{ tooltip: { sx: sx.progressTooltip } }}
    >
      <Box sx={sx.minutesProgress}>
        <Box sx={sx.minutesValues}>
          <Typography sx={sx.minutesValue}>{displayValue(row.minutes)}</Typography>
          <Typography sx={sx.minutesRate}>{hasRate ? `· ${row.minutesRate}%` : '· —'}</Typography>
        </Box>
        <Box sx={sx.minutesProgressTrack}>
          <Box sx={sx.minutesProgressValue({ progress, tone })} />
        </Box>
      </Box>
    </Tooltip>
  )
}

const SUBSTITUTION_BAND_RANGES = Object.freeze({
  נמוך: '0–29%',
  בינוני: '30–49%',
  גבוה: '50–100%',
})

const substitutionProgressTooltip = band => (
  `${band} · ${SUBSTITUTION_BAND_RANGES[band] || '—'}`
)

const resolveSubstitutionProgressTone = rate => {
  const value = Number(rate)

  if (!Number.isFinite(value)) return 'unavailable'
  if (value >= 50) return 'high'
  if (value >= 30) return 'medium'
  return 'low'
}

const resolveSubstitutionTooltipColor = tone => ({
  high: 'danger',
  medium: 'warning',
  low: 'success',
  unavailable: 'neutral',
}[tone] || 'neutral')

const resolveSubstitutionBandLabel = (row, tone) => {
  if (SUBSTITUTION_BAND_RANGES[row.substitutionBand]) return row.substitutionBand

  return {
    high: 'גבוה',
    medium: 'בינוני',
    low: 'נמוך',
  }[tone] || 'לא זמין'
}

const renderSubstitutions = row => {
  const hasRate = row.substitutionRate !== null && row.substitutionRate !== undefined
  const rate = Number(row.substitutionRate)
  const progress = Number.isFinite(rate)
    ? Math.max(0, Math.min(100, rate))
    : 0
  const tone = resolveSubstitutionProgressTone(row.substitutionRate)
  const band = resolveSubstitutionBandLabel(row, tone)

  return (
    <Tooltip
      title={substitutionProgressTooltip(band)}
      placement='bottom'
      variant='soft'
      color={resolveSubstitutionTooltipColor(tone)}
      slotProps={{ tooltip: { sx: sx.progressTooltip } }}
    >
      <Box sx={sx.substitutionsProgress}>
        <Box sx={sx.substitutionsValues}>
          <Typography sx={sx.substitutionsValue}>{displayValue(row.substitutedOut)}</Typography>
          <Typography sx={sx.substitutionsRate}>{hasRate ? `· ${row.substitutionRate}%` : '· —'}</Typography>
        </Box>
        <Box sx={sx.substitutionsProgressTrack}>
          <Box sx={sx.substitutionsProgressValue({ progress, tone })} />
        </Box>
      </Box>
    </Tooltip>
  )
}

const buildPlayerScoutProfile = player => {
  const scout = player?.scout || {}
  const profiles = Array.isArray(player?.scoutProfiles)
    ? player.scoutProfiles
    : Array.isArray(player?.scoutSignals)
      ? player.scoutSignals
      : Array.isArray(scout.profiles)
        ? scout.profiles
        : []
  const combinations = Array.isArray(player?.scoutCombinations)
    ? player.scoutCombinations
    : Array.isArray(scout.combinations)
      ? scout.combinations
      : []
  const display = player?.scoutProfileDisplay || scout.display || {}
  const profilePlayer = {
    ...player,
    scoutProfiles: profiles,
    scoutCombinations: combinations,
    scoutProfileDisplay: display,
    profile: player?.profile || display.label || '',
  }

  return {
    player: profilePlayer,
    view: buildScoutCompactView({
      profiles,
      combinations,
      display,
      fallbackLabel: profilePlayer.profile,
      player: profilePlayer,
    }),
  }
}

const resolveProfileDepthPct = source => {
  const percentageCandidates = [
    source?.profileDepth?.depthPct,
    source?.profileStrength?.depthPct,
    source?.depthPct,
  ]
  const percentage = percentageCandidates.find(value => Number.isFinite(Number(value)))
  if (percentage !== undefined) return Number(percentage)

  const depthCandidates = [
    source?.profileDepth?.depth,
    source?.profileStrength?.depth,
    source?.depth,
  ]
  const depth = depthCandidates.find(value => Number.isFinite(Number(value)))
  return depth === undefined ? 0 : Number(depth) * 100
}

const buildTableScoutProfileChip = player => {
  const profile = buildPlayerScoutProfile(player)
  const primaryProfile = profile.view.primaryItem

  if (!primaryProfile || primaryProfile.type !== 'profile') return null

  const chipProps = {
    profileId: primaryProfile.id,
    label: primaryProfile.shortLabel || primaryProfile.label,
    profile: primaryProfile.source,
    profiles: profile.view.displayItems
      .filter(item => item.type === 'profile')
      .map(item => item.source),
    depthPct: resolveProfileDepthPct(primaryProfile.source),
    extraCount: Math.max(0, (profile.view.displayItems?.length || 0) - 1),
  }

  return buildScoutProfileChipV2Model(chipProps) ? chipProps : null
}

const renderScoutProfile = row => {
  const scoutProfileChip = buildTableScoutProfileChip(row.player)
  if (!scoutProfileChip) return null

  return (
    <Box sx={sx.scoutProfileCell}>
      <ScoutProfileChipV2 {...scoutProfileChip} size='compact' showConditions showConditionsDepth />
    </Box>
  )
}

const getAllSquadRosterOrder = row => {
  if (row.rosterStatus === 'transferredOut') return 5
  if (row.rosterStatus === 'youngerAgeGroup') return 4
  if (row.squadClassificationStatus === 'irrelevant') return 3
  if (row.squadClassificationStatus === 'insufficientSample') return 2
  if (row.squadClassificationStatus === 'unclassifiedSufficientSample') return 1

  return 0
}

const getPersonalMinutesRate = row => {
  const value = Number(row.minutesRate)

  return Number.isFinite(value) ? value : -1
}

const sortByPersonalMinutesRate = (left, right) => (
  getPersonalMinutesRate(right) - getPersonalMinutesRate(left)
)

export default function TeamPositionClassificationTable({
  rows = [],
  teamName = '',
  seasonKey = '',
  onPlayerRoleEdit,
  onPlayerOpen,
  structureFilter = TEAM_STRUCTURE_FILTER.CLASSIFIED,
  embedded = false,
}) {
  const filteredRows = rows.filter(row => (
    Array.isArray(row.structureFilterKeys) && row.structureFilterKeys.includes(structureFilter)
  ))
  const visibleRows = structureFilter === TEAM_STRUCTURE_FILTER.ALL_SQUAD
    ? filteredRows
      .map((row, index) => ({ row, index }))
      .sort((left, right) => (
        getAllSquadRosterOrder(left.row) - getAllSquadRosterOrder(right.row) ||
        sortByPersonalMinutesRate(left.row, right.row) ||
        left.index - right.index
      ))
      .map(item => item.row)
    : filteredRows
      .map((row, index) => ({ row, index }))
      .sort((left, right) => (
        sortByPersonalMinutesRate(left.row, right.row) ||
        left.index - right.index
      ))
      .map(item => item.row)
  const getRowSx = structureFilter === TEAM_STRUCTURE_FILTER.ALL_SQUAD
    ? row => sx.squadClassificationRow(row.squadClassificationStatus)
    : undefined

  const columns = React.useMemo(() => [
    {
      key: 'index',
      label: '#',
      sortable: false,
      sx: sx.indexColumn,
      render: (_, index) => <Typography sx={sx.index}>{index + 1}</Typography>,
    },
    {
      key: 'avatar',
      label: '',
      sortable: false,
      sx: sx.avatarColumn,
      render: () => (
        <Box
          component='img'
          src={playerImage}
          alt=''
          sx={sx.avatar}
        />
      ),
    },
    {
      key: 'name',
      label: 'שחקן',
      sx: sx.playerColumn,
      getHref: row => row.playerUrl,
      getLinkAriaLabel: row => `פתיחת עמוד השחקן ${row.name}`,
      getSortValue: row => row.name,
      render: renderPlayerName,
    },
    {
      key: 'gamesStarts',
      label: 'משחקים / הרכב',
      sx: sx.gamesStartsColumn,
      getSortValue: row => Number(row.games) || 0,
      render: row => displayGamesStarts(row),
    },
    {
      key: 'minutes',
      label: 'כמות דקות',
      sx: sx.minutesColumn,
      getSortValue: row => row.minutes,
      render: renderMinutes,
    },
    {
      key: 'substitutedOut',
      label: 'כמות חילופים',
      sx: sx.substitutionsColumn,
      getSortValue: row => row.substitutedOut,
      render: renderSubstitutions,
    },
    {
      key: 'goals',
      label: 'שערים',
      sx: sx.goalsColumn,
      getSortValue: row => row.goals,
      render: row => displayValue(row.goals),
    },
    {
      key: 'lineClassification',
      label: 'חוליה / עמדה',
      sx: sx.lineClassificationColumn,
      getSortValue: row => {
        if (row.isGoalkeeper) return 0

        return ({ DEFENSE: 1, MIDFIELD: 2, ATTACK: 3 })[
          row.classification?.line
        ] ?? 4
      },
      render: row => (
        <Tooltip title='עריכת חוליה ועמדה' placement='bottom'>
          <Box
            component='button'
            type='button'
            disabled={!row.player || !onPlayerRoleEdit}
            onClick={event => {
              event.stopPropagation()
              onPlayerRoleEdit?.(row.player)
            }}
            sx={sx.classificationEdit}
            aria-label={`עריכת חוליה ועמדה עבור ${row.name}`}
          >
            <PlayerLineClassificationChip
              classification={row.classification}
              primaryPosition={row.primaryPosition}
              positionLayer={row.positionLayer}
              clickable
              compact
              tooltipDetail={`כלל הסיווג: ${row.rule}`}
            />
          </Box>
        </Tooltip>
      ),
    },
    {
      key: 'scoutProfile',
      label: 'פרופיל',
      sx: sx.scoutProfileColumn,
      getSortValue: row => buildTableScoutProfileChip(row.player)?.label || '',
      render: renderScoutProfile,
    },
    {
      key: 'openPlayer',
      label: '',
      sortable: false,
      sx: sx.openPlayerColumn,
      render: row => (
        <Tooltip title='כניסה לשחקן' placement='bottom'>
          <IconButton
            size='sm'
            variant='outlined'
            color='neutral'
            aria-label={`כניסה לעמוד השחקן ${row.name}`}
            disabled={!row.player || !onPlayerOpen}
            sx={sx.openPlayerButton}
            onClick={event => {
              event.stopPropagation()
              onPlayerOpen?.(row.player)
            }}
          >
            {iconUi({ id: 'view', size: 'sm' })}
          </IconButton>
        </Tooltip>
      ),
    },
  ], [onPlayerOpen, onPlayerRoleEdit])

  const handleExport = () => {
    exportTeamPositionClassificationToXlsx({ rows, teamName, seasonKey })
  }

  return (
    <Box sx={[sx.section, embedded && sx.sectionEmbedded]}>
      {!embedded ? (
        <Box sx={sx.header}>
          <Box>
            <Typography sx={sx.title}>חלוקת דקות הסגל</Typography>
          </Box>
          <Box sx={sx.actions}>
            <Tooltip title='ייצוא כל נתוני הטבלה ל־Excel' placement='bottom'>
              <IconButton
                size='sm'
                variant='outlined'
                color='neutral'
                aria-label='ייצוא נתוני סיווג העמדה ל־Excel'
                sx={sx.exportButton}
                disabled={!rows.length}
                onClick={handleExport}
              >
                {iconUi({ id: 'download', size: 'sm' })}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : null}

      <DataTable
        className='dpScrollThin'
        columns={columns}
        rows={visibleRows}
        getRowKey={row => row.id}
        defaultSort={structureFilter === TEAM_STRUCTURE_FILTER.ALL_SQUAD
          ? { key: '', direction: 'asc' }
          : { key: 'lineClassification', direction: 'asc' }}
        emptyText='אין שחקנים להצגה'
        getRowSx={getRowSx}
        wrapSx={sx.tableWrap}
        tableSx={sx.table}
      />
    </Box>
  )
}
