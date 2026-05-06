// playerProfile/sharedUi/insights/playerGames/sections/PlayerTopStats.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  normalizeJoyColor,
} from '../../../../sharedLogic/games/insightsDrawer/cards/playerCards.shared.js'

function StatCard({ item }) {
  const color = normalizeJoyColor(item?.color)

  return (
    <Sheet
      variant="soft"
      color={color}
      sx={{
        p: 1.25,
        borderRadius: 'lg',
        minHeight: 92,
        display: 'grid',
        alignContent: 'space-between',
        gap: 0.75,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          minWidth: 0,
        }}
      >
        <Typography
          level="body-xs"
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item?.title}
        </Typography>

        {iconUi({id: item?.icon})}
      </Box>

      <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
        <Typography
          level="h4"
          sx={{
            fontWeight: 700,
            lineHeight: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item?.value || '—'}
        </Typography>

        <Typography
          level="body-xs"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.35,
            minWidth: 0,
          }}
        >
          {item?.sub || item?.subValue || ''}
        </Typography>
      </Box>
    </Sheet>
  )
}

export function PlayerTopStats({ items = [] }) {
  if (!items.length) return null

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr 1fr',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1,
      }}
    >
      {items.map((item) => (
        <StatCard key={item.id} item={item} />
      ))}
    </Box>
  )
}
