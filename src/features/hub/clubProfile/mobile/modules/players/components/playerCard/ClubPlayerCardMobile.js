// ClubProfile/mobile/modules/players/components/playerCard/ClubPlayerCardMobile.js

import React from 'react'
import {
  Card,
  CardContent,
  CardOverflow,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/joy'

import ClubPlayerCardHeader from './ClubPlayerCardHeader.js'
import ClubPlayerCardSummary from './ClubPlayerCardSummary.js'
import ClubPlayerCardDetails from './ClubPlayerCardDetails.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function ClubPlayerCardMobile({
  row,
  onOpenPlayer,
  onEditPlayer,
  onAvatarClick,
  onEditPosition,
  defaultExpanded = false,
}) {
  if (!row) return null

  const handleOpenPlayer = () => {
    onOpenPlayer?.(row?.player || row)
  }

  return (
    <Card size="sm" variant="outlined" sx={sx.card}>
      <CardContent
        sx={{
          cursor: typeof onOpenPlayer === 'function' ? 'pointer' : 'default',
          transition: 'background-color .15s ease',
          '&:active': {
            bgcolor: 'background.level1',
          },
        }}
        onClick={handleOpenPlayer}
      >
        <ClubPlayerCardHeader
          row={row}
          onAvatarClick={onAvatarClick}
          onOpenPlayer={onOpenPlayer}
        />
      </CardContent>

      <CardOverflow sx={{ mx: -2.5 }}>
        <AccordionGroup
          size="sm"
          variant="plain"
          transition="0.2s"
          sx={(theme) => sx.accordionGroup(theme)}
        >
          <Accordion defaultExpanded={defaultExpanded} sx={sx.accordion}>
            <AccordionSummary>
              <ClubPlayerCardSummary row={row} />
            </AccordionSummary>

            <AccordionDetails>
              <ClubPlayerCardDetails
                row={row}
                onEditPlayer={onEditPlayer}
                onEditPosition={onEditPosition}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </CardOverflow>
    </Card>
  )
}
