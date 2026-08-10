// features/playersDatabase/ui/components/tables/dataTable/DataTableHeader.js

import * as React from 'react'
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { dataTableHeaderSx as sx } from './sx/dataTableHeader.sx.js'
import { DATA_TABLE_SORT_DIRECTIONS } from './dataTable.sort.js'

export default function DataTableHeader({
  columns,
  sortState,
  onSort,
  exportConfig = null,
  onExport = null,
}) {
  const exportColumnKey = exportConfig?.placementColumnKey || 'actions'
  const hasExport = Boolean(exportConfig && typeof onExport === 'function')
  const canExport = Boolean(exportConfig?.enabled && typeof onExport === 'function')
  const exportAlign = exportConfig?.align || 'center'
  const exportAlignSx = (
    sx.headerActionAlign[exportAlign] ||
    sx.headerActionAlign.center
  )

  return (
    <thead>
      <tr>
        {columns.map(column => {
          const sortable = column.sortable !== false
          const active = sortState.key === column.key
          const direction = active ? sortState.direction : ''
          const showExportButton = hasExport && column.key === exportColumnKey

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
              sx={[
                column.sx,
                column.headerSx,
              ]}
            >
              {showExportButton ? (
                <Box
                  sx={[
                    sx.headerActionWrap,
                    exportAlignSx,
                  ]}
                >
                  <Tooltip title={exportConfig.tooltip || exportConfig.buttonLabel || 'Excel'}>
                    <IconButton
                      size='sm'
                      variant='outlined'
                      color='neutral'
                      aria-label={exportConfig.ariaLabel || exportConfig.buttonLabel || 'Excel'}
                      sx={sx.headerActionButton}
                      disabled={!canExport}
                      onClick={event => {
                        event.stopPropagation()
                        onExport()
                      }}
                    >
                      {iconUi({
                        id: exportConfig.iconId || 'download',
                        size: 'sm',
                      })}
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : sortable ? (
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
