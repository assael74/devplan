// src/features/playersDatabase/components/hero/Hero.js

import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'

import { heroSx as sx } from './HeroSx.js'

function HeroKpis({ items }) {
  if (!items.length) return null

  return (
    <Box sx={sx.kpiGrid}>
      {items.map(item => (
        <Box key={item.id} sx={sx.kpi}>
          <Typography sx={sx.kpiLabel}>
            {item.label}
          </Typography>

          <Typography sx={sx.kpiValue}>
            {item.value}
          </Typography>

          {item.note ? (
            <Typography sx={sx.kpiNote}>
              {item.note}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}

export default function Hero({ kpis = [], actions = {} }) {
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

          <Typography level="body-sm" sx={sx.subtitle}>
            סביבת דאטה נפרדת לשחקנים, קבוצות, ליגות וצילומי ביצועים תקופתיים.
            המודול נטען רק בכניסה למסך הזה, ומיועד לאדמין בלבד.
          </Typography>
        </Box>

        <Box sx={sx.actions}>
          <Button
            variant="soft"
            color="neutral"
            onClick={actions.openSegments}
          >
            חיתוכים
          </Button>

          <Button
            variant="soft"
            color="neutral"
            onClick={actions.openTrackedPlayers}
          >
            מעקב פעיל
          </Button>

          <Button
            variant="plain"
            color="neutral"
            onClick={actions.openLeaguesTeams}
          >
            ליגות וקבוצות
          </Button>
        </Box>
      </Box>

      <HeroKpis items={kpis} />
    </Sheet>
  )
}
