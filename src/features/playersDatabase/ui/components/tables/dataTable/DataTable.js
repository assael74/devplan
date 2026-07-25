// features/playersDatabase/ui/components/tables/dataTable/DataTable.js

import * as React from 'react'
import {
  Box,
  Table,
} from '@mui/joy'

import { pdbTableSx as sx } from '../tables.sx.js'
import DataTableBody from './DataTableBody.js'
import DataTableHeader from './DataTableHeader.js'
import {
  DATA_TABLE_SORT_DIRECTIONS,
  sortDataTableRows,
} from './dataTable.sort.js'

export default function DataTable({
  columns = [],
  rows = [],
  getRowKey,
  emptyText = 'אין נתונים להצגה',
  className,
  wrapSx,
  tableSx,
  bodyScrollSx,
  defaultSort,
  renderExpandedRow,
}) {
  const [expandedRowKey, setExpandedRowKey] = React.useState('')
  const [sortState, setSortState] = React.useState(() => ({
    key: defaultSort?.key || '',
    direction: defaultSort?.direction === DATA_TABLE_SORT_DIRECTIONS.ASC
      ? DATA_TABLE_SORT_DIRECTIONS.ASC
      : DATA_TABLE_SORT_DIRECTIONS.DESC,
  }))

  React.useEffect(() => {
    setSortState({
      key: defaultSort?.key || '',
      direction: defaultSort?.direction === DATA_TABLE_SORT_DIRECTIONS.ASC
        ? DATA_TABLE_SORT_DIRECTIONS.ASC
        : DATA_TABLE_SORT_DIRECTIONS.DESC,
    })
  }, [defaultSort?.key, defaultSort?.direction])

  const sortableColumns = React.useMemo(
    () => new Map(
      columns
        .filter(column => column.sortable !== false)
        .map(column => [column.key, column])
    ),
    [columns]
  )

  const sortedRows = React.useMemo(() => sortDataTableRows({
    rows,
    column: sortableColumns.get(sortState.key),
    direction: sortState.direction,
  }), [rows, sortState, sortableColumns])

  const handleSort = column => {
    if (column.sortable === false) return

    setSortState(current => {
      if (current.key !== column.key) {
        return {
          key: column.key,
          direction: column.defaultSortDirection === (
            DATA_TABLE_SORT_DIRECTIONS.ASC
          )
            ? DATA_TABLE_SORT_DIRECTIONS.ASC
            : DATA_TABLE_SORT_DIRECTIONS.DESC,
        }
      }

      return {
        key: column.key,
        direction: current.direction === DATA_TABLE_SORT_DIRECTIONS.ASC
          ? DATA_TABLE_SORT_DIRECTIONS.DESC
          : DATA_TABLE_SORT_DIRECTIONS.ASC,
      }
    })
  }

  const toggleExpandedRow = rowKey => {
    setExpandedRowKey(current => (current === rowKey ? '' : rowKey))
  }

  const header = (
    <DataTableHeader
      columns={columns}
      sortState={sortState}
      onSort={handleSort}
    />
  )

  const body = (
    <DataTableBody
      columns={columns}
      rows={sortedRows}
      getRowKey={getRowKey}
      emptyText={emptyText}
      expandedRowKey={expandedRowKey}
      onToggleExpandedRow={toggleExpandedRow}
      renderExpandedRow={renderExpandedRow}
    />
  )

  if (bodyScrollSx) {
    return (
      <Box
        className={className}
        sx={{
          ...sx.wrap,
          ...sx.splitWrap,
          ...wrapSx,
        }}
      >
        <Box sx={sx.headerWrap}>
          <Table
            size='sm'
            sx={{
              ...sx.table,
              ...sx.headerTable,
              ...tableSx,
            }}
          >
            {header}
          </Table>
        </Box>

        <Box
          className='dpScrollThin'
          sx={{
            ...sx.bodyWrap,
            ...bodyScrollSx,
          }}
        >
          <Table
            hoverRow
            size='sm'
            sx={{
              ...sx.table,
              ...sx.bodyTable,
              ...tableSx,
            }}
          >
            {body}
          </Table>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      className={className}
      sx={{
        ...sx.wrap,
        ...wrapSx,
      }}
    >
      <Table
        hoverRow
        stickyHeader
        size='sm'
        sx={{
          ...sx.table,
          ...tableSx,
        }}
      >
        {header}
        {body}
      </Table>
    </Box>
  )
}
