// src/features/playersDatabase/ui/components/modals/paste/PreviewTable.js

import * as React from 'react'
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import { previewTableSx as sx } from './sx/previewTable.sx.js'
import PreviewCell from './PreviewCell.js'
import StatusCell from './StatusCell.js'
import { resolvePasteRowStatus } from './paste.model.js'

const sortRows = ({
  rows,
  columns,
  sort,
  getRowStatus,
}) => {
  const indexedRows = rows.map((row, index) => ({
    row,
    rowIndex: index,
  }))

  if (!sort?.key) return indexedRows

  const itemKey = item => item.row?.id
    ? `id:${item.row.id}`
    : `index:${item.rowIndex}`

  if (Array.isArray(sort.frozenOrder) && sort.frozenOrder.length === indexedRows.length) {
    const rankByKey = new Map(sort.frozenOrder.map((key, index) => [key, index]))
    const canReuseFrozenOrder = indexedRows.every(item => rankByKey.has(itemKey(item)))

    if (canReuseFrozenOrder) {
      return [...indexedRows].sort((left, right) => (
        rankByKey.get(itemKey(left)) - rankByKey.get(itemKey(right))
      ))
    }
  }

  const isValiditySort = sort.key === '__rowValidity'
  const column = columns.find(item => item.key === sort.key)
  if (!isValiditySort && !column?.sortable) return indexedRows

  const direction = sort.direction === 'desc' ? -1 : 1
  const getValue = item => {
    const rowValidity = getRowStatus?.(item.row, item.rowIndex)?.valid !== false
    if (isValiditySort) return rowValidity ? '1' : '0'

    const invalidFirstPrefix = column.invalidFirst ? (rowValidity ? '1-' : '0-') : ''
    if (typeof column.sortValue === 'function') {
      return `${invalidFirstPrefix}${column.sortValue(item.row) || ''}`
    }

    return `${invalidFirstPrefix}${item.row?.[column.key] || ''}`
  }

  return [...indexedRows].sort((left, right) => (
    String(getValue(left) || '').localeCompare(
      String(getValue(right) || ''),
      'he',
      {
        numeric: true,
        sensitivity: 'base',
      }
    ) * direction
  ))
}

const freezeSortOrder = ({ rows, columns, sort, getRowStatus }) => (
  sortRows({ rows, columns, sort, getRowStatus })
    .map(item => item.row?.id ? `id:${item.row.id}` : `index:${item.rowIndex}`)
)

export default function PreviewTable({
  columns,
  rows,
  onCellChange,
  getRowStatus,
  getCellStatus,
  summary = [],
  showSummaryCounts = true,
  hoverRow = true,
  statusColumnSx = null,
  tableSx = null,
  title = 'תצוגה ועריכת נתונים',
  statusLabel = 'תקין',
}) {
  const [sort, setSort] = React.useState(null)
  const resolvedStatusColumnSx = statusColumnSx
    ? [sx.statusColumn, statusColumnSx]
    : sx.statusColumn
  const visibleRows = React.useMemo(() => sortRows({
    rows,
    columns,
    sort,
    getRowStatus,
  }), [
    columns,
    getRowStatus,
    rows,
    sort,
  ])

  const toggleSort = column => {
    if (!column.sortable) return

    setSort(current => {
      if (current?.key !== column.key) {
        const next = {
          key: column.key,
          direction: 'asc',
        }

        return {
          ...next,
          frozenOrder: freezeSortOrder({ rows, columns, sort: next, getRowStatus }),
        }
      }

      const next = {
        key: column.key,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      }

      return {
        ...next,
        frozenOrder: freezeSortOrder({ rows, columns, sort: next, getRowStatus }),
      }
    })
  }

  return (
    <Card sx={sx.previewPanel}>
      <Box sx={sx.previewHeader}>
        <Box>
          <Typography
            level='title-md'
            sx={sx.sectionTitle}
          >
            {title}
          </Typography>
        </Box>

        <Stack
          direction='row'
          spacing={0.75}
          sx={sx.summaryChips}
        >
          {summary.map(item => (
            item.render ? (
              <React.Fragment key={item.key || item.label}>
                {item.render()}
              </React.Fragment>
            ) : null
          ))}

          {showSummaryCounts ? (
            <>
              <Chip
                size='sm'
                variant='soft'
                color='success'
              >
                {rows.length} שורות
              </Chip>

              <Chip
                size='sm'
                variant='soft'
                color='neutral'
              >
                {columns.length} עמודות
              </Chip>
            </>
          ) : null}

          {summary.map(item => (
            !item.render ? (
              <Chip
                key={item.key || item.label}
                size='sm'
                variant='soft'
                color={item.color || 'neutral'}
                onClick={item.onClick}
                sx={item.onClick ? sx.summaryActionChip : null}
              >
                {item.label}
              </Chip>
            ) : null
          ))}
        </Stack>
      </Box>

      <Box
        className='dpScrollThin'
        sx={sx.tableWrap}
      >
        <Table
          stickyHeader
          hoverRow={hoverRow}
          size='sm'
          sx={[sx.table, tableSx]}
        >
          <thead>
            <tr>
              <Box
                component='th'
                sx={resolvedStatusColumnSx}
                onClick={() => toggleSort({ key: '__rowValidity', sortable: true })}
              >
                <Box sx={[sx.columnHeaderContent, sx.sortableHeader]}>
                  {statusLabel}
                  {sort?.key === '__rowValidity' ? (
                    <Typography component='span' level='body-xs' sx={sx.sortIndicator}>
                      {sort.direction === 'asc' ? '↑' : '↓'}
                    </Typography>
                  ) : null}
                </Box>
              </Box>

              {columns.map(column => (
                <Box
                  component='th'
                  key={column.key}
                  sx={column.sx}
                  onClick={() => toggleSort(column)}
                >
                  <Box sx={[sx.columnHeaderContent, column.headerSx, column.sortable ? sx.sortableHeader : null]}>
                    {column.headerContent || column.label}
                    {sort?.key === column.key ? (
                      <Typography
                        component='span'
                        level='body-xs'
                        sx={sx.sortIndicator}
                      >
                        {sort.direction === 'asc' ? '↑' : '↓'}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map(({ row, rowIndex }) => {
              const rowStatus = resolvePasteRowStatus({
                columns,
                row,
                rowIndex,
                getRowStatus,
              })

              return (
                <tr key={row.id || rowIndex}>
                  <Box
                    component='td'
                    sx={resolvedStatusColumnSx}
                  >
                    <StatusCell
                      valid={rowStatus.valid}
                      message={rowStatus.message}
                    />
                  </Box>

                  {columns.map(column => (
                    <Box
                      component='td'
                      key={column.key}
                      sx={[
                        column.sx,
                      ]}
                    >
                      <Box sx={[sx.cellContent, column.cellContentSx]}>
                        <PreviewCell
                          column={column}
                          row={row}
                          rowIndex={rowIndex}
                          onCellChange={onCellChange}
                          cellStatus={getCellStatus?.(row, rowIndex, column)}
                        />
                      </Box>
                    </Box>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Box>
    </Card>
  )
}
