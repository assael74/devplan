// features/playersDatabase/ui/pages/playerPage/PlayerHistoryTable.js

import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/joy'

import DataTable from '../../components/tables/dataTable/index.js'
import { dataTableActionsSx } from '../../components/tables/dataTable/sx/dataTableActions.sx.js'
import { dataTableColumnsSx } from '../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ScoutCompactTooltip from '../../components/scout/ScoutCompactTooltip.js'
import ScoutProfileChip from '../../components/scout/ScoutProfileChip.js'
import { buildScoutCompactView } from '../../components/scout/scoutDisplay.model.js'
import {
  resolveProfilesLabel,
  toNumber,
} from './logic/playerPage.utils.js'
import { PLAYER_HISTORY_TABLE_WIDTHS } from './logic/playerTableWidths.js'
import { playerHistoryTableSx as sx } from './sx/playerHistoryTable.sx.js'

const columnSx = (key, sharedSx = {}) => ({
  ...sharedSx,
  width: PLAYER_HISTORY_TABLE_WIDTHS[key],
})

const buildColumns = ({ onRowOpen }) => [
  {
    key: 'seasonKey',
    label: 'עונה',
    sx: columnSx(
      'seasonKey',
      dataTableColumnsSx.centerColumn
    ),
    defaultSortDirection: 'desc',
    getSortValue: row => row.seasonKey || '',
    render: row => (
      <Box sx={sx.seasonCell}>
        <Box component='span'>
          {row.seasonKey}
        </Box>

        {row.isCurrentSeason ? (
          <Chip
            size='sm'
            variant='soft'
            sx={sx.currentSeasonChip}
          >
            נוכחית
          </Chip>
        ) : null}
      </Box>
    ),
  },
  {
    key: 'clubName',
    label: 'מועדון',
    sx: columnSx(
      'clubName',
      dataTableColumnsSx.centerColumn
    ),
  },
  {
    key: 'teamName',
    label: 'קבוצת גיל',
    sx: columnSx(
      'teamName',
      dataTableColumnsSx.centerColumn
    ),
  },
  {
    key: 'leagueName',
    label: 'ליגה',
    sx: columnSx(
      'leagueName',
      dataTableColumnsSx.centerColumn
    ),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: columnSx(
      'games',
      dataTableColumnsSx.numericColumn
    ),
    getSortValue: row => toNumber(row.games),
  },
  {
    key: 'starts',
    label: 'הרכב',
    sx: columnSx(
      'starts',
      dataTableColumnsSx.numericColumn
    ),
    getSortValue: row => toNumber(row.starts),
  },
  {
    key: 'minutes',
    label: 'דקות',
    sx: columnSx(
      'minutes',
      dataTableColumnsSx.numericColumn
    ),
    getSortValue: row => toNumber(row.minutes),
  },
  {
    key: 'goals',
    label: 'שערים',
    sx: columnSx(
      'goals',
      dataTableColumnsSx.numericColumn
    ),
    getSortValue: row => toNumber(row.goals),
  },
  {
    key: 'yellowCards',
    label: 'צהובים',
    sx: columnSx(
      'yellowCards',
      dataTableColumnsSx.numericColumn
    ),
    getSortValue: row => toNumber(row.yellowCards),
  },
  {
    key: 'scoutProfiles',
    label: 'פרופילי סקאוט',
    sx: columnSx(
      'scoutProfiles',
      dataTableColumnsSx.profileColumn
    ),
    getSortValue: row => row.scoutProfiles?.length || 0,
    render: row => {
      const profileView = buildScoutCompactView({
        profiles: row.scoutProfiles,
        combinations: row.scoutCombinations,
        display: row.scoutProfileDisplay,
        fallbackLabel: row.profile || resolveProfilesLabel(row.scoutProfiles),
      })

      if (!profileView.label || profileView.label === '-') return '-'

      return (
        <Box sx={sx.profileCell}>
          <ScoutProfileChip
            profileId={profileView.primaryItem?.id || ''}
            label={profileView.label}
            tooltip={(
              <ScoutCompactTooltip
                title={profileView.tooltipTitle}
                items={profileView.tooltipItems}
                isCombination={profileView.isCombination}
              />
            )}
            variant={profileView.variant}
            fontSize={11}
          />
        </Box>
      )
    },
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    sx: columnSx(
      'actions',
      dataTableColumnsSx.actionsColumn
    ),
    render: row => (
      <Tooltip title='פתיחת פרטי העונה'>
        <IconButton
          size='sm'
          variant='outlined'
          aria-label='פתיחת פרטי העונה'
          sx={dataTableActionsSx.actionButton}
          onClick={() => onRowOpen(row)}
        >
          {iconUi({ id: 'view', size: 'sm' })}
        </IconButton>
      </Tooltip>
    ),
  },
]

export default function PlayerHistoryTable({ rows = [], onRowOpen = () => {} }) {
  return (
    <DataTable
      className='dpScrollThin'
      columns={buildColumns({ onRowOpen })}
      rows={rows}
      getRowKey={row => row.id}
      defaultSort={{
        key: 'seasonKey',
        direction: 'desc',
      }}
      wrapSx={sx.tableWrap}
      tableSx={sx.historyTable}
      emptyText='אין היסטוריית עונות להצגה'
    />
  )
}
