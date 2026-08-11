// features/playersDatabase/ui/components/tables/dataTable/DataTableCell.js

import * as React from 'react'
import { Box } from '@mui/joy'

import { dataTableCellSx as sx } from './sx/dataTableCell.sx.js'
import {
  cleanDataTableHref,
  resolveDataTableColumnSx,
} from './dataTable.model.js'

function DataTableCellLink({ column, row, index, children }) {
  const href = column.getHref
    ? cleanDataTableHref(column.getHref(row, index))
    : ''

  if (!href) return children

  const ariaLabel = column.getLinkAriaLabel
    ? column.getLinkAriaLabel(row, index)
    : `פתיחת ${String(children || column.label || 'קישור')}`

  const linkSx = resolveDataTableColumnSx(
    column.linkSx,
    row,
    index
  )

  return (
    <Box
      component='a'
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      referrerPolicy='no-referrer'
      aria-label={ariaLabel}
      sx={[
        sx.cellLink,
        linkSx,
      ]}
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

export default function DataTableCell({ column, row, index, rowContext }) {
  const content = column.render
    ? column.render(row, index, rowContext)
    : row[column.key]

  return (
    <Box
      component='td'
      data-column={column.key}
      sx={[
        column.sx,
        resolveDataTableColumnSx(
          column.cellSx,
          row,
          index
        ),
      ]}
    >
      {column.getHref ? (
        <DataTableCellLink
          column={column}
          row={row}
          index={index}
        >
          {content}
        </DataTableCellLink>
      ) : content}
    </Box>
  )
}
