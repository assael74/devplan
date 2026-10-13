// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.columns.js

import {
  Button,
  Chip,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/joy'

import LeagueName from '../../../components/entities/LeagueName.js'
import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { LEAGUE_CENTER_TABLE_WIDTHS } from './leagueCenterTableWidths.js'
import { dataTableColumnsSx as columnSx } from '../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { dataTableActionsSx as actionSx } from '../../../components/tables/dataTable/sx/dataTableActions.sx.js'
import { leagueCenterColumnsSx as sx } from '../sx/leagueCenter.columns.sx.js'
import { getFullDateIl } from '../../../../../../shared/format/dateUtils.js'

const columnWidth = key => buildTableColumnWidth(LEAGUE_CENTER_TABLE_WIDTHS[key])

const seasonStatusPresentation = value => ({
  active: { label: 'פעילה', color: 'success', iconId: 'active' },
  not_started: { label: 'לא החלה', color: 'neutral', iconId: 'planned' },
  completed: { label: 'הסתיימה', color: 'primary', iconId: 'completed' },
  no_teams: { label: 'אין קבוצות', color: 'warning', iconId: 'noData' },
}[value] || { label: 'לא הוגדר', color: 'neutral', iconId: 'noData' })

const documentationFacts = row => {
  const counts = row.documentationCounts || {}
  const rosterCount = Number(row.teamsCount || 0) - Number(counts.NO_ROSTER || 0)
  const statsCount = Number(counts.STATS_LOADED || 0) + Number(counts.STATS_FINAL || 0)

  return (
    <Stack direction='row' spacing={0.35} sx={sx.factsChips}>
      <Chip
        size='sm'
        variant='outlined'
        color='neutral'
        title='קבוצות עם סגל'
        startDecorator={iconUi({ id: 'addPlayers', size: 'sm' })}
      >
        {rosterCount}
      </Chip>
      <Chip
        size='sm'
        variant='outlined'
        color='success'
        title='קבוצות עם סטטיסטיקה'
        startDecorator={iconUi({ id: 'stats', size: 'sm' })}
      >
        {statsCount}
      </Chip>
    </Stack>
  )
}

const professionalPriorityFacts = row => (
  <Stack direction='row' spacing={0.35} sx={sx.priorityFacts}>
    <Chip
      size='sm'
      variant='outlined'
      color='warning'
      title='משימות התקפה'
      startDecorator={iconUi({ id: 'attack', size: 'sm' })}
    >
      {row.offenseOnlyPriorityCount || 0}
    </Chip>
    <Chip
      size='sm'
      variant='outlined'
      color='success'
      title='משימות הגנה'
      startDecorator={iconUi({ id: 'defense', size: 'sm' })}
    >
      {row.defenseOnlyPriorityCount || 0}
    </Chip>
    <Chip
      size='sm'
      variant='outlined'
      color='primary'
      title='משימות משולבות'
      startDecorator={iconUi({ id: 'transitions', size: 'sm' })}
    >
      {row.combinedPriorityCount || 0}
    </Chip>
  </Stack>
)

const statusSortValue = value => {
  const sortValue = { full: 2, partial: 1, missing: 0 }[value]
  return sortValue === undefined || sortValue === null ? -1 : sortValue
}

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
    key: 'playersStatsStatus',
    label: 'סגל וסטטס',
    getSortValue: row => statusSortValue(row.playersStatsStatus),
    render: documentationFacts,
  },
  {
    key: 'professionalPriority',
    label: 'עדיפות מקצועית',
    getSortValue: row => Number(row.offensePriorityCount || 0) + Number(row.defensePriorityCount || 0),
    render: professionalPriorityFacts,
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

export const buildLeagueCenterColumns = ({ onOpenLeague, onDeleteLeagueSeason, getDeleteAvailability }) => (
  BASE_COLUMNS.map(column => {
    const widthSx = columnWidth(column.key)

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

    return {
      ...column,
      sx: { ...columnSx.centerColumn, ...widthSx },
      headerSx: columnSx.centerColumn,
      cellSx: columnSx.centerColumn,
    }
  })
)
