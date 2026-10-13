// src/features/playersDatabase/ui/components/tables/dataTable/DataTable.js

import * as React from 'react'
import {
  Box,
  Table,
} from '@mui/joy'

import { dataTableSx as sx } from './sx/dataTable.sx.js'
import DataTableBody from './DataTableBody.js'
import DataTableHeader from './DataTableHeader.js'
import {
  DATA_TABLE_SORT_DIRECTIONS,
  sortDataTableRows,
} from './dataTable.sort.js'
import exportDataTableRowsToXlsx from './dataTable.export.js'

function DataTableColumnGroup({ columns, widths = [] }) {
  return (
    <colgroup>
      {columns.map((column, index) => (
        <Box
          component='col'
          key={column.key}
          sx={{ width: widths[index] ? `${widths[index]}px` : column.sx?.width }}
        />
      ))}
    </colgroup>
  )
}

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
  sortRows = sortDataTableRows,
  renderExpandedRow,
  getRowSx,
  exportConfig = null,
  hoverRow = true,
}) {
  const bodyScrollRef = React.useRef(null)
  const [headerColumnWidths, setHeaderColumnWidths] = React.useState([])
  React.useLayoutEffect(() => {
    const element = bodyScrollRef.current
    if (!element) return undefined
    const measure = () => {
      const widths = Array.from(element.querySelectorAll('col')).map(column => (
        column.getBoundingClientRect().width
      ))
      if (!widths.length || !widths.some(width => width > 0)) return
      // Only the final header cell extends over the body's scrollbar gutter.
      widths[widths.length - 1] += element.offsetWidth - element.clientWidth
      setHeaderColumnWidths(current => (
        current.length === widths.length && current.every((width, index) => width === widths[index])
          ? current
          : widths
      ))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [columns, rows])
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

  const sortedRows = React.useMemo(() => sortRows({
    rows,
    column: sortableColumns.get(sortState.key),
    direction: sortState.direction,
  }), [rows, sortState, sortableColumns, sortRows])

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

  const handleExport = React.useCallback(() => {
    if (!exportConfig?.enabled) return false

    const exportRows = typeof exportConfig.getRows === 'function'
      ? exportConfig.getRows(sortedRows, {
        rawRows: exportConfig.rawRows || [],
      })
      : sortedRows

    return exportDataTableRowsToXlsx({
      rows: exportRows,
      columns: exportConfig.columns || [],
      fileName: exportConfig.fileName,
      sheetName: exportConfig.sheetName,
    })
  }, [exportConfig, sortedRows])

  const header = (
    <DataTableHeader
      columns={columns}
      sortState={sortState}
      onSort={handleSort}
      exportConfig={exportConfig}
      onExport={handleExport}
    />
  )

  const columnGroup = <DataTableColumnGroup columns={columns} />

  const body = (
    <DataTableBody
      columns={columns}
      rows={sortedRows}
      getRowKey={getRowKey}
      emptyText={emptyText}
      expandedRowKey={expandedRowKey}
      onToggleExpandedRow={toggleExpandedRow}
      renderExpandedRow={renderExpandedRow}
      getRowSx={getRowSx}
    />
  )

  const wrapSxItems = Array.isArray(wrapSx)
    ? wrapSx
    : [wrapSx]

  const splitWrapSx = [
    sx.wrap,
    ...wrapSxItems,
    sx.splitWrap,
  ]

  const headerTableSx = [
    sx.table,
    sx.headerTable,
    tableSx,
  ]

  const bodyWrapSx = [
    sx.bodyWrap,
    bodyScrollSx,
  ]

  const bodyTableSx = [
    sx.table,
    hoverRow && sx.rowHover,
    sx.bodyTable,
    tableSx,
  ]

  return (
    <Box
      className={className}
      sx={splitWrapSx}
    >
      <Box sx={sx.headerWrap}>
        <Table
          size='sm'
          sx={headerTableSx}
        >
          <DataTableColumnGroup columns={columns} widths={headerColumnWidths} />
          {header}
        </Table>
      </Box>

      <Box
        ref={bodyScrollRef}
        className='dpScrollThin'
        sx={bodyWrapSx}
      >
        <Table
          hoverRow={hoverRow}
          size='sm'
          sx={bodyTableSx}
        >
          {columnGroup}
          {body}
        </Table>
      </Box>
    </Box>
  )
}
