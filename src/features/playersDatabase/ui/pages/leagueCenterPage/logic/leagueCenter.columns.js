// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.columns.js

import {
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  Stack,
  Typography,
  Tooltip,
} from '@mui/joy'

import LeagueName from '../../../components/entities/LeagueName.js'
import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { LEAGUE_CENTER_TABLE_WIDTHS } from './leagueCenterTableWidths.js'
import { dataTableColumnsSx as columnSx } from '../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { dataTableActionsSx as actionSx } from '../../../components/tables/dataTable/sx/dataTableActions.sx.js'
import { leagueCenterColumnsSx as sx } from '../sx/leagueCenter.columns.sx.js'
import { getFullDateIl } from '../../../../../../shared/format/dateUtils.js'
import { LEAGUE_RESEARCH_FILTER_LABELS } from '../../../logic/leagueWorkNavigation.js'

const columnWidth = key => buildTableColumnWidth(LEAGUE_CENTER_TABLE_WIDTHS[key])

const seasonStatusPresentation = value => ({
  active: { label: 'פעילה', color: 'success', iconId: 'active' },
  not_started: { label: 'לא החלה', color: 'neutral', iconId: 'planned' },
  completed: { label: 'הסתיימה', color: 'primary', iconId: 'completed' },
  no_teams: { label: 'אין קבוצות', color: 'warning', iconId: 'noData' },
}[value] || { label: 'לא הוגדר', color: 'neutral', iconId: 'noData' })

const missingFact = label => (
  <Tooltip title={label}>
    <Box component='span' tabIndex={0} aria-label={label} sx={sx.missingFact}>
      {iconUi({ id: 'infoOutline', size: 'small', sx: { fontSize: 14, color: 'inherit' } })}
    </Box>
  </Tooltip>
)

const buildResearchColumns = (onOpenLeague, strongSignalMinimum) => [
  { key: 'matchingTeams', label: 'קבוצות עם איתותים חזקים', pending: false },
  { key: 'pendingTeams', label: 'ממתינות לחקירה', pending: true },
].map(({ key, label, pending }) => {
  const matchingKey = `strongMin${strongSignalMinimum}`
  const filter = pending ? matchingKey + 'Pending' : matchingKey
  return {
    key,
    label,
    workArea: true,
    defaultSortDirection: 'desc',
    getSortValue: row => row.strongSignalWorkCounts?.[filter],
    render: row => {
      if (!row.teamsCount) return '−'
      const count = row.strongSignalWorkCounts?.[filter]
      const total = pending ? row.strongSignalWorkCounts?.[matchingKey] : row.teamsCount
      if (typeof count !== 'number' || typeof total !== 'number') {
        return missingFact('סיכום עוצמות האיתותים אינו זמין')
      }
      return (
        <Chip
          component='span'
          size='sm'
          variant='outlined'
          startDecorator={pending
            ? iconUi({ id: 'notes', size: 'small', sx: { fontSize: 15, color: 'inherit' } })
            : null}
          slotProps={{ action: {
            type: 'button',
            'aria-label': label + ': ' + count + ' מתוך ' + total + ' קבוצות, ' + LEAGUE_RESEARCH_FILTER_LABELS[matchingKey],
            'aria-labelledby': undefined,
          } }}
          disabled={!onOpenLeague || total === 0}
          onClick={() => onOpenLeague?.(row, filter)}
          sx={sx.signalStrengthBadge(pending)}
        >
          <Box component='bdi'>{total > 0 ? count + '/' + total : '−'}</Box>
        </Chip>
      )
    },
  }
})

const buildLoadingColumns = onOpenLeague => [
  {
    key: 'statsLoaded', label: 'טעינת סטטיסטיקות',
    getSortValue: row => row.teamsCount ? row.playersStatsCompleteCount / row.teamsCount : null,
    render: row => row.teamsCount ? (
      <Chip
        component='span'
        size='sm'
        variant='outlined'
        color={row.playersStatsCompleteCount === row.teamsCount ? 'success' : 'neutral'}
        slotProps={{ action: {
          type: 'button',
          'aria-label': 'פתיחת קבוצות ללא טעינת סטטיסטיקות מלאה; נטענו ' + row.playersStatsCompleteCount + ' מתוך ' + row.teamsCount,
          'aria-labelledby': undefined,
        } }}
        disabled={!onOpenLeague}
        onClick={() => onOpenLeague?.(row, 'incompleteStats')}
        sx={sx.coverageChip}
      >
        <Box component='bdi'>{row.playersStatsCompleteCount}/{row.teamsCount}</Box>
      </Chip>
    ) : '−',
  },
].map(column => ({ ...column, workArea: true, sortable: Boolean(column.getSortValue) }))

const dateSortValue = value => {
  if (!value) return null
  const timestamp = typeof value.toMillis === 'function'
    ? value.toMillis()
    : Number.isFinite(Number(value.seconds))
      ? Number(value.seconds) * 1000
      : new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

const BASE_COLUMNS = [
  {
    key: 'leagueName',
    label: 'ליגה',
    defaultSortDirection: 'asc',
    getSortValue: row => Number(row.level) > 0 ? Number(row.level) : null,
    render: row => row.seasonUrl ? (
      <Link
        href={row.seasonUrl}
        target='_blank'
        rel='noreferrer'
        aria-label={`פתיחת מקור הליגה ${row.leagueName}`}
        sx={sx.leagueLink}
      >
        <LeagueName value={row.leagueName} level={row.level} showLevel fontSize={12} />
      </Link>
    ) : <LeagueName value={row.leagueName} level={row.level} showLevel fontSize={12} />,
  },
  { key: 'ageGroupLabel', label: 'קבוצת גיל', sortable: false, render: row => row.ageGroupLabel || row.ageGroup || '-' },
  { key: 'birthYear', label: 'שנתון', sortable: false },
  { key: 'seasonKey', label: 'עונה', sortable: false },
  {
    key: 'seasonWorkStatus',
    label: 'מצב עונה',
    sortable: false,
    getSortValue: row => row.seasonWorkStatus,
    render: row => {
      const presentation = seasonStatusPresentation(row.seasonWorkStatus)
      return (
        <Chip
          size='sm'
          variant='outlined'
          color={presentation.color}
          startDecorator={iconUi({ id: presentation.iconId, size: 'sm' })}
          sx={sx.statusChip}
        >
          {presentation.label}
        </Chip>
      )
    },
  },
  {
    key: 'tableImportedAt',
    label: 'טעינה אחרונה',
    getSortValue: row => dateSortValue(row.tableImportedAt),
    render: row => (
      <Typography level='body-xs' sx={sx.dateFact}>
        {row.tableImportedAt
          ? getFullDateIl(row.tableImportedAt)
          : '-'}
      </Typography>
    ),
  },
  { key: 'actions', label: '' },
]

export const buildLeagueCenterColumns = ({
  onOpenLeague,
  onDeleteLeagueSeason,
  getDeleteAvailability,
  strongSignalMinimum = 1,
}) => (
  [
    ...BASE_COLUMNS.slice(0, 5),
    ...buildLoadingColumns(onOpenLeague),
    ...buildResearchColumns(onOpenLeague, strongSignalMinimum),
    ...BASE_COLUMNS.slice(5),
  ].map(column => {
    const widthSx = columnWidth(column.workArea ? 'work' : column.key)

    if (column.key === 'actions') {
      return {
        ...column,
        sortable: false,
        sx: { ...columnSx.actionsColumn, ...widthSx },
        headerSx: columnSx.centerColumn,
        cellSx: columnSx.centerColumn,
        render: row => (
          <Stack direction='row' spacing={0.5} sx={actionSx.rowActions}>
            {row.hasSelectedSeason ? (
              <>
                <IconButton
                  size='sm'
                  variant='soft'
                  sx={sx.openLeagueButton}
                  aria-label='צפייה בליגה'
                  onClick={() => onOpenLeague(row)}
                >
                  {iconUi({id: 'viewLeague', size: 'sm'})}
                </IconButton>
                <IconButton
                  size='sm'
                  variant='plain'
                  color='danger'
                  aria-label='מחיקת עונת ליגה'
                  title={getDeleteAvailability ? getDeleteAvailability(row).reason : ''}
                  disabled={getDeleteAvailability ? !getDeleteAvailability(row).allowed : false}
                  onClick={() => onDeleteLeagueSeason && onDeleteLeagueSeason(row)}
                >
                  {iconUi({id: 'delete', size: 'sm'})}
                </IconButton>
              </>
            ) : (
              <Button
                size='sm'
                variant='outlined'
                sx={sx.createSeasonButton}
                startDecorator={iconUi({id: 'addSeason', size: 'sm'})}
                onClick={() => onOpenLeague(row)}
              >
                פתיחת ליגה
              </Button>
            )}
          </Stack>
        ),
      }
    }

    if (column.key === 'leagueName') {
      return {
        ...column,
        sx: { ...columnSx.nameColumn, ...widthSx },
        headerSx: { ...columnSx.nameHeader, ...sx.leagueNameHeader },
        cellSx: { ...columnSx.nameCell, ...sx.leagueNameCell },
      }
    }

    if (column.key === 'birthYear') {
      return {
        ...column,
        sx: { ...columnSx.centerColumn, ...widthSx },
        headerSx: { ...columnSx.centerColumn, ...sx.birthYearHeader },
        cellSx: columnSx.centerColumn,
      }
    }

    const areaHeaderSx = column.key === 'statsLoaded' ? sx.loadingAreaHeader : sx.workAreaHeader
    const areaCellSx = column.key === 'statsLoaded' ? sx.loadingAreaCell : sx.workAreaCell
    return {
      ...column,
      sx: { ...columnSx.centerColumn, ...widthSx },
      headerSx: { ...columnSx.centerColumn, ...(column.workArea ? areaHeaderSx : {}) },
      cellSx: { ...columnSx.centerColumn, ...(column.workArea ? areaCellSx : {}) },
    }
  })
)
