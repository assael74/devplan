// features/playersDatabase/ui/components/tables/DataTable.js

import * as React from 'react'
import {
  Box,
  Table,
  Typography,
} from '@mui/joy'

import { pdbTableSx as sx } from './tables.sx.js'

export default function DataTable({
  columns = [],
  rows = [],
  getRowKey,
  emptyText = 'אין נתונים להצגה',
  className,
  wrapSx,
  tableSx,
  bodyScrollSx,
}) {
  const resolveRowKey = (row, index) => {
    if (getRowKey) {
      return getRowKey(row, index)
    }

    return row.id || index
  }

  const renderCellValue = (column, row, index) => {
    if (column.render) {
      return column.render(row, index)
    }

    return row[column.key]
  }

  const renderHeader = () => (
    <thead>
      <tr>
        {columns.map(column => (
          <Box
            component='th'
            key={column.key}
            data-column={column.key}
            sx={{
              ...column.sx,
              ...column.headerSx,
            }}
          >
            {column.label}
          </Box>
        ))}
      </tr>
    </thead>
  )

  const renderBody = () => (
    <tbody>
      {rows.length ? (
        rows.map((row, index) => (
          <tr key={resolveRowKey(row, index)}>
            {columns.map(column => (
              <Box
                component='td'
                key={column.key}
                data-column={column.key}
                sx={{
                  ...column.sx,
                  ...column.cellSx,
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

