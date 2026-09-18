import { Box, IconButton, Tooltip, Typography } from '@mui/joy'

import DataTable from '../../components/tables/dataTable/DataTable.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import useTeamPositionClassificationColumns from './hooks/useTeamPositionClassificationColumns.js'
import exportTeamPositionClassificationToXlsx from './logic/teamPositionClassification.export.js'
import {
  getAllSquadRosterOrder,
  sortByPersonalMinutesRate,
} from './model/teamPositionClassification.presentation.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'
import { teamPositionClassificationTableSx as sx } from './sx/teamPositionClassificationTable.sx.js'

export default function TeamPositionClassificationTable({
  rows = [],
  teamName = '',
  seasonKey = '',
  birthYear = '',
  ageGroupLabel = '',
  onPlayerRoleEdit,
  onPlayerOpen,
  structureFilter = TEAM_STRUCTURE_FILTER.CLASSIFIED,
  embedded = false,
  toolbar = null,
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
  const tableWrapSx = embedded ? [sx.tableWrap, sx.tableWrapEmbedded] : sx.tableWrap
  const columns = useTeamPositionClassificationColumns({ onPlayerOpen, onPlayerRoleEdit })

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
                onClick={() => exportTeamPositionClassificationToXlsx({
                  rows,
                  teamName,
                  seasonKey,
                  birthYear,
                  ageGroupLabel,
                })}
              >
                {iconUi({ id: 'download', size: 'sm' })}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : null}

      <Box sx={sx.tableContainer}>
        {toolbar ? <Box sx={sx.tableToolbar}>{toolbar}</Box> : null}
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
          wrapSx={tableWrapSx}
          tableSx={sx.table}
        />
      </Box>
    </Box>
  )
}
