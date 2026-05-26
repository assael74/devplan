// features/insightsHub/performance/components/blocks/PerformanceNumbersBlock.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  blocksSx,
} from './sx/blocks.sx.js'

const isStrongColumn = id => {
  return id === 'role' || id === 'label'
}

const getColumnWidth = column => {
  if (column.id === 'label') return 'minmax(150px, 1.4fr)'
  if (column.id === 'role') return 'minmax(130px, 1.2fr)'
  if (column.id === 'position') return 'minmax(120px, 1.1fr)'

  return 'minmax(86px, 1fr)'
}

const getTemplateColumns = columns => {
  return columns.map(getColumnWidth).join(' ')
}

export default function PerformanceNumbersBlock({ block }) {
  if (!block?.rows?.length || !block?.columns?.length) return null

  const templateColumns = getTemplateColumns(block.columns)

  return (
    <Box sx={blocksSx.body}>
      {block.subtitle ? (
        <Typography level="body-sm" sx={blocksSx.intro}>
          {block.subtitle}
        </Typography>
      ) : null}

      <Box sx={blocksSx.tableWrap}>
        <Box sx={blocksSx.tableHead(templateColumns)}>
          {block.columns.map(column => (
            <Typography key={column.id} level="body-xs">
              {column.label}
            </Typography>
          ))}
        </Box>

        {block.rows.map(row => (
          <Box key={row.id} sx={blocksSx.tableRow(templateColumns)}>
            {block.columns.map(column => (
              <Typography
                key={column.id}
                level="body-sm"
                sx={isStrongColumn(column.id) ? { fontWeight: 700 } : null}
              >
                {row[column.id] ?? '—'}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
