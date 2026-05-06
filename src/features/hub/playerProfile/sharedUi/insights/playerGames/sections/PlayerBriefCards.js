// playerProfile/sharedUi/insights/playerGames/sections/PlayerBriefCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  normalizeJoyColor,
} from '../../../../sharedLogic/games/insightsDrawer/cards/playerCards.shared.js'

function BriefCard({ item }) {
  const color = normalizeJoyColor(item?.color)

  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 'lg',
        display: 'grid',
        gap: 0.75,
        minHeight: 118,
        bgcolor: 'background.surface',
        borderColor: 'divider',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            level="title-sm"
            sx={{
              fontWeight: 700,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </Typography>

          <Typography
            level="body-xs"
            sx={{
              color: 'text.secondary',
              mt: 0.25,
            }}
          >
            {item.targetLabel || item.sourceLabel || ''}
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={color}
          startDecorator={iconUi({id: item.icon})}
        >
          {item.status === 'ready' ? 'פעיל' : 'חסר'}
        </Chip>
      </Box>

      <Typography
        level="body-sm"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.subValue || 'אין תובנה זמינה.'}
      </Typography>
    </Sheet>
  )
}

export function PlayerBriefCards({ items = [] }) {
  if (!items.length) return null

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 1fr',
        },
        gap: 1,
      }}
    >
      {items.map((item) => (
        <BriefCard key={item.id} item={item} />
      ))}
    </Box>
  )
}
