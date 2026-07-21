// features/playersDatabase/ui/components/tables/DataTable.js

import * as React from 'react'
import {
  Box,
  Table,
  Typography,
} from '@mui/joy'

import { pdbTableSx as sx } from './tables.sx.js'

const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
}

const cleanHref = value => String(value || '').trim()

const resolveColumnSx = (value, row, index) => (
  typeof value === 'function' ? value(row, index) : value
)

const isEmptySortValue = value => (
  value === null ||
  value === undefined ||
  String(value).trim() === ''
)

const normalizeSortValue = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const textValue = String(value || '').trim()
  if (!textValue) return null

  const numericValue = Number(textValue.replace(/,/g, ''))
  if (Number.isFinite(numericValue)) return numericValue

  return textValue
}

const compareSortValues = (leftValue, rightValue, direction) => {
  const leftEmpty = isEmptySortValue(leftValue)
  const rightEmpty = isEmptySortValue(rightValue)

  if (leftEmpty && rightEmpty) return 0
  if (leftEmpty) return 1
  if (rightEmpty) return -1

  const left = normalizeSortValue(leftValue)
  const right = normalizeSortValue(rightValue)

  let comparison = 0

  if (typeof left === 'number' && typeof right === 'number') {
    comparison = left - right
  } else {
    comparison = String(left).localeCompare(
      String(right),
      'he',
      {
        numeric: true,
        sensitivity: 'base',
      }
    )
  }

  return direction === SORT_DIRECTIONS.DESC
    ? comparison * -1
    : comparison
}

function DataTableCellLink({
  column,
  row,
  index,
  children,
}) {
  const href = column.getHref
    ? cleanHref(column.getHref(row, index))
    : ''

  if (!href) return children

  const ariaLabel = column.getLinkAriaLabel
    ? column.getLinkAriaLabel(row, index)
    : `פתיחת ${String(children || column.label || 'קישור')}`

  const linkSx = resolveColumnSx(column.linkSx, row, index)

  return (
    <Box
      component='a'
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      referrerPolicy='no-referrer'
      aria-label={ariaLabel}
      sx={{
        ...sx.cellLink,
        ...linkSx,
      }}
      onClick={event => {
        event.stopPropagation()

        if (column.onLinkClick) {
          column.onLinkClick(event, row, index)
        }
      }}
    >
      <Box component='span' sx={sx.cellLinkText}>
        {children}
      </Box>

      <Box
        component='span'
        aria-hidden='true'
        data-link-indicator
        sx={sx.cellLinkIndicator}
      />
    </Box>
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
}) {
  const [sortState, setSortState] = React.useState(() => ({
    key: defaultSort?.key || '',
    direction: defaultSort?.direction === SORT_DIRECTIONS.ASC
      ? SORT_DIRECTIONS.ASC
      : SORT_DIRECTIONS.DESC,
  }))

  React.useEffect(() => {
    setSortState({
      key: defaultSort?.key || '',
      direction: defaultSort?.direction === SORT_DIRECTIONS.ASC
        ? SORT_DIRECTIONS.ASC
        : SORT_DIRECTIONS.DESC,
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

  const sortedRows = React.useMemo(() => {
    const activeColumn = sortableColumns.get(sortState.key)

    if (!activeColumn) return rows

    const getSortValue = activeColumn.getSortValue || (
      row => row[activeColumn.key]
    )

    return rows
      .map((row, index) => ({
        row,
        originalIndex: index,
      }))
      .sort((leftItem, rightItem) => {
        const comparison = compareSortValues(
          getSortValue(leftItem.row, leftItem.originalIndex),
          getSortValue(rightItem.row, rightItem.originalIndex),
          sortState.direction
        )

        return comparison || leftItem.originalIndex - rightItem.originalIndex
      })
      .map(item => item.row)
  }, [rows, sortState, sortableColumns])

  const resolveRowKey = (row, index) => {
    if (getRowKey) {
      return getRowKey(row, index)
    }

    return row.id || index
  }

  const handleSort = column => {
    if (column.sortable === false) return

    setSortState(current => {
      if (current.key !== column.key) {
        return {
          key: column.key,
          direction: column.defaultSortDirection === SORT_DIRECTIONS.ASC
            ? SORT_DIRECTIONS.ASC
            : SORT_DIRECTIONS.DESC,
        }
      }

      return {
        key: column.key,
        direction: current.direction === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC,
      }
    })
  }

  const renderCellValue = (column, row, index) => {
    const content = column.render
      ? column.render(row, index)
      : row[column.key]

    if (!column.getHref) return content

    return (
      <DataTableCellLink
        column={column}
        row={row}
        index={index}
      >
        {content}
      </DataTableCellLink>
    )
  }

  const renderHeader = () => (
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
                  ? direction === SORT_DIRECTIONS.ASC
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
                  onClick={() => handleSort(column)}
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
                      {direction === SORT_DIRECTIONS.ASC ? '▲' : '▼'}
                    </Box>
                  )}
                </Box>
              ) : (
                column.label
              )}
            </Box>
          )
        })}
      </tr>
    </thead>
  )

  const renderBody = () => (
    <tbody>
      {sortedRows.length ? (
        sortedRows.map((row, index) => (
          <tr key={resolveRowKey(row, index)}>
            {columns.map(column => (
              <Box
                component='td'
                key={column.key}
                data-column={column.key}
                sx={{
                  ...column.sx,
                  ...resolveColumnSx(column.cellSx, row, index),
                }}
              >
                {renderCellValue(column, row, index)}
              </Box>
            ))}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={columns.length || 1}>
            <Typography
              level='body-sm'
              sx={sx.emptyText}
            >
              {emptyText}
            </Typography>
          </td>
        </tr>
      )}
    </tbody>
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
            {renderHeader()}
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
            {renderBody()}
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
        {renderHeader()}
        {renderBody()}
      </Table>
    </Box>
  )
}
