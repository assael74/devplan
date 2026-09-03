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
}) => {
  const indexedRows = rows.map((row, index) => ({
    row,
    rowIndex: index,
  }))

  if (!sort?.key) return indexedRows

  const column = columns.find(item => item.key === sort.key)
  if (!column?.sortable) return indexedRows

  const direction = sort.direction === 'desc' ? -1 : 1
  const getValue = item => {
    if (typeof column.sortValue === 'function') {
      return column.sortValue(item.row)
    }

    return item.row?.[column.key]
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

export default function PreviewTable({
  columns,
  rows,
  onCellChange,
  getRowStatus,
  getCellStatus,
  summary = [],
  showSummaryCounts = true,
}) {
  const [sort, setSort] = React.useState(null)
  const visibleRows = React.useMemo(() => sortRows({
    rows,
    columns,
    sort,
  }), [
    columns,
    rows,
    sort,
  ])

  const toggleSort = column => {
    if (!column.sortable) return

    setSort(current => {
      if (current?.key !== column.key) {
        return {
          key: column.key,
          direction: 'asc',
        }
      }

      return {
        key: column.key,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
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
            תצוגה ועריכת נתונים
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
          hoverRow
          size='sm'
          sx={sx.table}
        >
          <thead>
            <tr>
              <Box
                component='th'
                sx={sx.statusColumn}
              >
                תקין
              </Box>

              {columns.map(column => (
                <Box
                  component='th'
                  key={column.key}
                  sx={column.sx}
                  onClick={() => toggleSort(column)}
                >
                  <Box sx={[sx.columnHeaderContent, column.sortable ? sx.sortableHeader : null]}>
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
                    sx={sx.statusColumn}
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
                      <Box sx={sx.cellContent}>
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
