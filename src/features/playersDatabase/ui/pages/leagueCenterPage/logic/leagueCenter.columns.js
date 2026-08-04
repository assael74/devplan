// features/playersDatabase/ui/pages/leagueCenterPage/logic/leagueCenter.columns.js

import { Button, Stack, Tooltip } from '@mui/joy'

import StatusPill from '../../../components/status/StatusPill.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { leagueCenterContentSx as sx } from '../sx/leagueCenterContent.sx.js'

const BASE_COLUMNS = [
  { key: 'name', label: 'ליגה' },
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
                <Button
                  size='sm'
                  variant='outlined'
                  sx={sx.createSeasonButton}
                  startDecorator={iconUi({ id: 'addSeason', size: 'sm' })}
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
                endDecorator={iconUi({ id: 'viewLeague', size: 'sm' })}
                onClick={() => onOpenLeague(row)}
              >
                פתח ליגה
              </Button>
            )}
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
