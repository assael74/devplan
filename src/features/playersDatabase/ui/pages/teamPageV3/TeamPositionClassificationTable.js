import * as React from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/joy'

import PlayerLineClassificationChip from '../../components/playerMeta/PlayerLineClassificationChip.js'
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

const minutesTooltip = row => {
  if (row.minutes === null || row.minutes === undefined) return 'אין נתון דקות לשחקן.'
  if (row.possiblePlayerMinutes === null || row.possiblePlayerMinutes === undefined) {
    return `דקות שחקן: ${row.minutes}. אין מספיק נתונים לחישוב אחוז דקות אישי.`
  }

  return `דקות שחקן: ${row.minutes} מתוך ${Math.round(row.possiblePlayerMinutes)} דקות אפשריות אישיות (${row.games} משחקים × ${Math.round(row.gameMinutes || 0)} דקות; ${row.minutesRate ?? '—'}%).`
}

const substitutionTooltip = row => {
  if (row.starts === null || row.starts === undefined) return 'אין נתון פתיחות לשחקן.'

  const substitutedOut = row.substitutedOut ?? 0
  return `חילופים החוצה: ${substitutedOut} מתוך ${row.starts} הופעות בהרכב פותח (${row.substitutionRate ?? '—'}%).`
}

export default function TeamPositionClassificationTable({
  rows = [],
  teamName = '',
  seasonKey = '',
  onPlayerRoleEdit,
  onPlayerOpen,
  structureFilter = TEAM_STRUCTURE_FILTER.CLASSIFIED,
  embedded = false,
}) {
  const visibleRows = rows.filter(row => (
    Array.isArray(row.structureFilterKeys) && row.structureFilterKeys.includes(structureFilter)
  ))

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
      render: row => displayValue(row.minutes),
    },
    {
      key: 'minutesBand',
      label: 'אחוז דקות אישי',
      sx: sx.minutesBandColumn,
      getSortValue: row => row.minutesRate,
      render: row => (
        <Tooltip title={minutesTooltip(row)} placement='bottom' variant='soft'>
          <Typography sx={sx.minutesBand}>{row.minutesBand}</Typography>
        </Tooltip>
      ),
    },
    {
      key: 'substitutedOut',
      label: 'כמות חילופים',
      sx: sx.substitutionsColumn,
      getSortValue: row => row.substitutedOut,
      render: row => displayValue(row.substitutedOut),
    },
    {
      key: 'substitutionBand',
      label: 'שיעור חילופים',
      sx: sx.substitutionBandColumn,
      getSortValue: row => row.substitutionRate,
      render: row => (
        <Tooltip title={substitutionTooltip(row)} placement='bottom' variant='soft'>
          <Typography sx={sx.substitutionBand}>{row.substitutionBand}</Typography>
        </Tooltip>
      ),
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
              tooltipDetail={`כלל הסיווג: ${row.rule}`}
            />
          </Box>
        </Tooltip>
      ),
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

      <DataTable
        className='dpScrollThin'
        columns={columns}
        rows={visibleRows}
        getRowKey={row => row.id}
        defaultSort={{ key: 'lineClassification', direction: 'asc' }}
        emptyText='אין שחקנים להצגה'
        wrapSx={sx.tableWrap}
        tableSx={sx.table}
      />
    </Box>
  )
}
