// playerProfile/sharedUi/insights/playerGames/sections/PlayerBriefDetails.js

import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import {
  normalizeJoyColor,
} from '../../../../sharedLogic/games/insightsDrawer/cards/playerCards.shared.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

function BriefItem({ item }) {
  const color = normalizeJoyColor(item?.tone)
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 'md',
        bgcolor: 'background.level1',
        display: 'grid',
        gap: 0.35,
      }}
    >
      <Chip
        size="sm"
        variant="soft"
        color={color}
        sx={{ justifySelf: 'start' }}
      >
        {item?.label || 'תובנה'}
      </Chip>

      <Typography
        level="body-sm"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.55,
        }}
      >
        {item?.text || ''}
      </Typography>
    </Box>
  )
}

function BriefAccordion({ brief }) {
  const items = Array.isArray(brief?.items) ? brief.items : []

  return (
    <Accordion>
      <AccordionSummary>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            minWidth: 0,
          }}
        >
          {iconUi({id: brief?.icon || 'insights', sx: { color: 'text.secondary' } })}

          <Box sx={{ minWidth: 0 }}>
            <Typography level="title-sm" sx={{ fontWeight: 700 }}>
              {brief?.title}
            </Typography>

            <Typography
              level="body-xs"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.35,
              }}
            >
              {brief?.subValue || brief?.text || ''}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ display: 'grid', gap: 0.75, pt: 0.5 }}>
          {items.length > 0 ? (
            items.map((item) => (
              <BriefItem key={item.id} item={item} />
            ))
          ) : (
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              אין פירוט נוסף לתובנה זו.
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export function PlayerBriefDetails({ items = [] }) {
  if (!items.length) {
    return null
  }

  return (
    <AccordionGroup
      variant="outlined"
      transition="0.2s"
      sx={{
        border: 0,
        display: 'grid',
        gap: 0.75,
        bgcolor: 'transparent',
        [`& .MuiAccordion-root`]: {
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.surface',
        },
      }}
    >
      {items.map((brief) => (
        <BriefAccordion key={brief.id} brief={brief} />
      ))}
    </AccordionGroup>
  )
}
