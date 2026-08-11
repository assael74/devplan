// src/features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.columns.js

import {
  Button,
  Stack,
  Tooltip,
} from '@mui/joy'

import LeagueName from '../../../components/entities/LeagueName.js'
import StatusPill from '../../../components/page/StatusPill.js'
import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { LEAGUE_CENTER_TABLE_WIDTHS } from './leagueCenterTableWidths.js'
import { dataTableColumnsSx as columnSx } from '../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { dataTableActionsSx as actionSx } from '../../../components/tables/dataTable/sx/dataTableActions.sx.js'
import { leagueCenterColumnsSx as sx } from '../sx/leagueCenter.columns.sx.js'

const columnWidth = key => buildTableColumnWidth(
  LEAGUE_CENTER_TABLE_WIDTHS[key]
)

const coverageLabel = ({ completeCount, targetCount }) => (
  `${Number(completeCount || 0)} / ${Number(targetCount || 0)}`
)

const coveragePill = ({ value, completeCount, targetCount }) => (
  <StatusPill
    value={value}
    label={(
      <span dir='ltr'>
        {coverageLabel({completeCount, targetCount})}
      </span>
    )}
  />
)

const BASE_COLUMNS = [
  {
    key: 'leagueName',
    label: 'ליגה',
    render: row => (
      <LeagueName
        value={row.leagueName}
        level={row.level}
        showLevel
        fontSize={12}
      />
    ),
  },
  {
    key: 'ageGroupLabel',
    label: 'קבוצת גיל',
    render: row => row.ageGroupLabel || row.ageGroup || '-',
  },
  {
    key: 'birthYear',
    label: 'שנתון',
  },
  {
    key: 'seasonKey',
    label: 'עונה',
  },
  {
    key: 'teamsCount',
    label: 'קבוצות',
  },
  {
    key: 'tableStatus',
    label: 'טבלה',
    render: row => (
      <StatusPill
        value={row.tableStatus}
        label={row.tableStatus === 'full' ? 'מלא' : 'ריק'}
      />
    ),
  },
  {
    key: 'playersStatsStatus',
    label: 'שחקנים + סטטס',
    render: row => coveragePill({
      value: row.playersStatsStatus,
      completeCount: row.playersStatsCompleteCount,
      targetCount: row.playersStatsTargetCount,
    }),
  },
  {
    key: 'offensePriorityStatus',
    label: 'עדיפות התקפית',
    render: row => coveragePill({
      value: row.offensePriorityStatus,
      completeCount: row.offensePriorityCompleteCount,
      targetCount: row.offensePriorityTargetCount,
    }),
  },
  {
    key: 'defensePriorityStatus',
    label: 'עדיפות הגנתית',
    render: row => coveragePill({
      value: row.defensePriorityStatus,
      completeCount: row.defensePriorityCompleteCount,
      targetCount: row.defensePriorityTargetCount,
    }),
  },
  {
    key: 'actions',
    label: '',
  },
]

export const buildLeagueCenterColumns = ({ onCreateSeason, onOpenLeague }) => (
  BASE_COLUMNS.map(column => {
    const widthSx = columnWidth(column.key)

    if (column.key === 'actions') {
      return {
        ...column,
        sortable: false,
        sx: {
          ...columnSx.actionsColumn,
          ...widthSx,
        },
        headerSx: columnSx.centerColumn,
        cellSx: columnSx.centerColumn,
        render: row => (
          <Stack direction='row' spacing={0.5} sx={actionSx.rowActions}>
            {!row.hasSelectedSeason ? (
              <Tooltip title='יצירת עונה'>
                <Button
                  size='sm'
                  variant='outlined'
                  sx={sx.createSeasonButton}
                  startDecorator={iconUi({id: 'addSeason', size: 'sm'})}
                  onClick={() => onCreateSeason(row)}
                >
                  יצירת עונה
                </Button>
              </Tooltip>
            ) : (
              <Button
                size='sm'
                variant='soft'
                disabled={!row.hasLeagueDoc}
                sx={sx.openLeagueButton}
                endDecorator={iconUi({id: 'viewLeague', size: 'sm'})}
                onClick={() => onOpenLeague(row)}
              >
                צפה בליגה
              </Button>
            )}
          </Stack>
        ),
      }
    }

    if (column.key === 'leagueName') {
      return {
        ...column,
        sx: {
          ...columnSx.nameColumn,
          ...widthSx,
        },
        headerSx: {
          ...columnSx.nameHeader,
          ...sx.leagueNameHeader,
        },
        cellSx: {
          ...columnSx.nameCell,
          ...sx.leagueNameCell,
        },
      }
    }

    return {
      ...column,
      sx: {
        ...columnSx.centerColumn,
        ...widthSx,
      },
      headerSx: columnSx.centerColumn,
      cellSx: columnSx.centerColumn,
    }
  })
)
