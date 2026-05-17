// teamProfile/sharedUi/insights/teamPlayers/components/TooltipContent.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

const sx = {
  root: {
    display: 'grid',
    gap: 0.75,
    maxWidth: 280,
  },

  title: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  rows: {
    display: 'grid',
    gap: 0.55,
  },

  row: {
    display: 'grid',
    gap: 0.2,
  },

  label: {
    fontWeight: 700,
    color: 'text.secondary',
    lineHeight: 1.2,
  },

  value: {
    color: 'text.primary',
    lineHeight: 1.35,
    whiteSpace: 'normal',
  },

  list: {
    display: 'grid',
    gap: 0.2,
    mt: 0.2,
  },

  listItem: {
    lineHeight: 1.25,
    color: 'text.primary',
  },
}

const TooltipRow = ({ row }) => {
  if (!row) return null

  return (
    <Box sx={sx.row}>
      <Typography level="body-xs" sx={sx.label}>
        {row.label}
      </Typography>

      {Array.isArray(row.items) ? (
        <Box sx={sx.list}>
          {row.items.map((item, index) => (
            <Typography
              key={`${item}-${index}`}
              level="body-xs"
              sx={sx.listItem}
            >
              {item}
            </Typography>
          ))}
        </Box>
      ) : (
        <Typography level="body-xs" sx={sx.value}>
          {row.value}
        </Typography>
      )}
    </Box>
  )
}

export default function TooltipContent({
  model,
}) {
  if (!model) return null

  const rows = Array.isArray(model.rows) ? model.rows : []

  return (
    <Box sx={sx.root}>
      <Typography level="body-sm" sx={sx.title}>
        {model.title}
      </Typography>

      <Box sx={sx.rows}>
        {rows.map((row) => (
          <TooltipRow
            key={row.id}
            row={row}
          />
        ))}
      </Box>
    </Box>
  )
}
