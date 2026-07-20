// features/playersDatabase/components/sharedUi/DatabaseHeader.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { databaseHeaderSx as sx } from './sx/databaseHeader.sx.js'

function DatabaseKpis({ items }) {
  if (!items.length) return null

  return (
    <Box sx={sx.kpiGrid}>
      {items.map(item => (
        <Box key={item.id} sx={sx.kpi}>
          <Typography sx={sx.kpiValue}>
            {item.value}
          </Typography>

          <Box sx={sx.kpiText}>
            <Typography sx={sx.kpiLabel}>
              {item.label}
            </Typography>

            {item.note ? (
              <Typography sx={sx.kpiNote}>
                {item.note}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default function DatabaseHeader({ eyebrow, title, actions = null, kpis = [], }) {
  return (
    <Sheet sx={sx.root}>
      <Box sx={sx.topRow}>
        <Box sx={sx.content}>
          {eyebrow ? (
            <Typography level="body-sm" sx={sx.eyebrow}>
              {eyebrow}
            </Typography>
          ) : null}

          <Typography level="h3" sx={sx.title}>
            {title}
          </Typography>
        </Box>

        <DatabaseKpis items={kpis} />

        {actions ? <Box sx={sx.actions}>{actions}</Box> : null}
      </Box>
    </Sheet>
  )
}
