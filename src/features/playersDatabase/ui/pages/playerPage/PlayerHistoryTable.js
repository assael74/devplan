// features/playersDatabase/ui/pages/playerPage/PlayerHistoryTable.js

import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/joy'

import DataTable from '../../components/tables/DataTable.js'
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

const columnWidth = key => ({
  width: PLAYER_HISTORY_TABLE_WIDTHS[key],
})

const buildColumns = ({ onRowOpen }) => [
  {
    key: 'seasonKey',
    label: 'עונה',
    sx: columnWidth('seasonKey'),
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
    sx: columnWidth('clubName'),
  },
  {
    key: 'teamName',
    label: 'קבוצת גיל',
    sx: columnWidth('teamName'),
  },
  {
    key: 'leagueName',
    label: 'ליגה',
    sx: columnWidth('leagueName'),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: columnWidth('games'),
    getSortValue: row => toNumber(row.games),
  },
  {
    key: 'starts',
    label: 'הרכב',
    sx: columnWidth('starts'),
    getSortValue: row => toNumber(row.starts),
  },
  {
    key: 'minutes',
    label: 'דקות',
    sx: columnWidth('minutes'),
    getSortValue: row => toNumber(row.minutes),
  },
  {
    key: 'goals',
    label: 'שערים',
    sx: columnWidth('goals'),
    getSortValue: row => toNumber(row.goals),
  },
  {
    key: 'yellowCards',
    label: 'צהובים',
    sx: columnWidth('yellowCards'),
    getSortValue: row => toNumber(row.yellowCards),
  },
  {
    key: 'scoutProfiles',
    label: 'פרופילי סקאוט',
    sx: columnWidth('scoutProfiles'),
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
    sx: columnWidth('actions'),
    render: row => (
      <Tooltip title='פתיחת פרטי העונה'>
        <IconButton
          size='sm'
          variant='outlined'
          aria-label='פתיחת פרטי העונה'
          sx={sx.tableIconButton}
          onClick={() => onRowOpen(row)}
        >
          {iconUi({
            id: 'view',
            size: 'sm',
          })}
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
