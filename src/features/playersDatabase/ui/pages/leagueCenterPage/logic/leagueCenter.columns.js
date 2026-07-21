// features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.columns.js

import { Box, IconButton, Stack, Tooltip } from '@mui/joy'

import StatusPill from '../../../components/status/StatusPill.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { leagueCenterContentSx as sx } from '../sx/leagueCenterContent.sx.js'

const BASE_COLUMNS = [
  { key: 'name', label: 'ליגה' },
  { key: 'ageGroup', label: 'גיל' },
  { key: 'seasonKey', label: 'עונה' },
  { key: 'teamsCount', label: 'קבוצות' },
  {
    key: 'tableStatus',
    label: 'טבלה',
    render: row => <StatusPill value={row.tableStatus} />,
  },
  {
    key: 'teamsStatus',
    label: 'שחקנים',
    render: row => <StatusPill value={row.teamsStatus} />,
  },
  {
    key: 'statsStatus',
    label: 'סטטיסטיקות',
    render: row => <StatusPill value={row.statsStatus} />,
  },
  { key: 'playersWithProfiles', label: 'שחקנים בפרופיל' },
  { key: 'actions', label: '' },
]

export const buildLeagueCenterColumns = ({ onCreateSeason, onOpenLeague }) => (
  BASE_COLUMNS.map(column => {
    if (column.key === 'actions') {
      return {
        ...column,
        sx: sx.actionsColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
        render: row => (
          <Stack direction='row' spacing={0.5} sx={sx.rowActions}>
            {!row.hasSelectedSeason ? (
              <Tooltip title='יצירת עונה'>
                <IconButton
                  size='sm'
                  variant='outlined'
                  sx={sx.actionIconButton}
                  onClick={() => onCreateSeason(row)}
                >
                  {iconUi({ id: 'addSeason', size: 'sm' })}
                </IconButton>
              </Tooltip>
            ) : (
              <Box sx={sx.actionIconPlaceholder} />
            )}

            <Tooltip title='כניסה לליגה'>
              <IconButton
                disabled={!row.hasLeagueDoc}
                size='sm'
                variant='outlined'
                sx={sx.actionIconButton}
                onClick={() => onOpenLeague(row)}
              >
                {iconUi({ id: 'viewLeague', size: 'sm' })}
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      }
    }

    if (column.key === 'name') {
      return {
        ...column,
        sx: sx.leagueNameColumn,
        headerSx: sx.leagueNameHeader,
        cellSx: sx.leagueNameCell,
      }
    }

    if (column.key === 'ageGroup') {
      return {
        ...column,
        key: 'birthYear',
        label: 'שנתון',
        sx: sx.compactColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
      }
    }

    if (column.key === 'seasonKey') {
      return {
        ...column,
        sx: sx.seasonColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
      }
    }

    if (column.key === 'teamsCount' || column.key === 'playersWithProfiles') {
      return {
        ...column,
        sx: sx.countColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
      }
    }

    return {
      ...column,
      headerSx: sx.centerColumn,
      cellSx: sx.centerColumn,
    }
  })
)
