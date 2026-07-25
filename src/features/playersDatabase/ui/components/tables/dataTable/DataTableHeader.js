// features/playersDatabase/ui/components/tables/dataTable/DataTableHeader.js

import * as React from 'react'
import { Box } from '@mui/joy'

import { pdbTableSx as sx } from '../tables.sx.js'
import {
  DATA_TABLE_SORT_DIRECTIONS,
} from './dataTable.sort.js'

export default function DataTableHeader({
  columns,
  sortState,
  onSort,
}) {
  return (
    <thead>
      <tr>
        {columns.map(column => {
          const sortable = column.sortable !== false
          const active = sortState.key === column.key
          const direction = active ? sortState.direction : ''

          return (
            <Box
              component='th'
              key={column.key}
              data-column={column.key}
              aria-sort={
                active
                  ? direction === DATA_TABLE_SORT_DIRECTIONS.ASC
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              sx={{
                ...column.sx,
                ...column.headerSx,
              }}
            >
              {sortable ? (
                <Box
                  component='button'
                  type='button'
                  onClick={() => onSort(column)}
                  aria-label={`מיון לפי ${column.label}`}
                  sx={[
                    sx.sortButton,
                    active && sx.sortButtonActive,
                  ]}
                >
                  <Box component='span' sx={sx.sortLabel}>
                    {column.label}
                  </Box>

                  {active && (
                    <Box
                      component='span'
                      aria-hidden='true'
                      sx={sx.sortIndicatorActive}
                    >
                      {direction === DATA_TABLE_SORT_DIRECTIONS.ASC
                        ? '▲'
                        : '▼'}
                    </Box>
                  )}
                </Box>
              ) : column.label}
            </Box>
          )
        })}
      </tr>
    </thead>
  )
}
