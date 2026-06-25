// src/features/playersDatabase/components/hero/Hero.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { heroSx as sx } from './HeroSx.js'

function HeroKpis({ items }) {
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

export default function Hero({ kpis = [] }) {
  return (
    <Sheet sx={sx.root}>
      <Box sx={sx.top}>
        <Box>
          <Typography level="body-sm" sx={sx.eyebrow}>
            PLAYERS DATABASE
          </Typography>

          <Typography level="h2" sx={sx.title}>
            מאגר שחקנים חיצוני
          </Typography>
        </Box>

        <HeroKpis items={kpis} />
      </Box>
    </Sheet>
  )
}
