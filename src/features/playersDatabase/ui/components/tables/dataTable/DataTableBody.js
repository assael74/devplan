// features/playersDatabase/ui/components/tables/dataTable/DataTableBody.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { pdbTableSx as sx } from '../tables.sx.js'
import DataTableCell from './DataTableCell.js'
import { resolveDataTableRowKey } from './dataTable.model.js'

export default function DataTableBody({
  columns,
  rows,
  getRowKey,
  emptyText,
  expandedRowKey,
  onToggleExpandedRow,
  renderExpandedRow,
  getRowSx,
}) {
  return (
    <tbody>
      {rows.length ? (
        rows.map((row, index) => {
          const rowKey = resolveDataTableRowKey({
            row,
            index,
            getRowKey,
          })
          const isExpanded = Boolean(renderExpandedRow) && (
            expandedRowKey === rowKey
          )
          const rowContext = {
            isExpanded,
            rowKey,
            toggleExpanded: () => onToggleExpandedRow(rowKey),
          }

          return (
            <React.Fragment key={rowKey}>
              <Box
                component='tr'
                sx={typeof getRowSx === 'function'
                  ? getRowSx(row, index)
                  : getRowSx}
              >
                {columns.map(column => (
                  <DataTableCell
                    key={column.key}
                    column={column}
                    row={row}
                    index={index}
                    rowContext={rowContext}
                  />
                ))}
              </Box>

              {renderExpandedRow ? (
                <Box
                  component='tr'
                  aria-hidden={!isExpanded}
                  sx={sx.expandedRow(isExpanded)}
                >
                  <Box
                    component='td'
                    colSpan={columns.length || 1}
                    sx={sx.expandedCell(isExpanded)}
                  >
                    <Box sx={sx.expandedCollapse(isExpanded)}>
                      <Box sx={sx.expandedContent(isExpanded)}>
                        {renderExpandedRow(row, index, rowContext)}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : null}
            </React.Fragment>
          )
        })
      ) : (
        <tr>
          <td colSpan={columns.length || 1}>
            <Typography level='body-sm' sx={sx.emptyText}>
              {emptyText}
            </Typography>
          </td>
        </tr>
      )}
    </tbody>
  )
}
