// playerProfile/mobile/modules/games/components/gameCard/PlayerGameCardMobile.js

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

import PlayerGameCardHeader from './PlayerGameCardHeader.js'
import PlayerGameCardPlayerStats from './PlayerGameCardPlayerStats.js'
import PlayerGameCardDetails from './PlayerGameCardDetails.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function PlayerGameCardMobile({
  game,
  onEditEntry,
  defaultExpanded = false,
}) {
  if (!game) return null

  return (
    <Card size='sm' variant="outlined" sx={sx.card}>
      <CardContent sx={sx.headerContent}>
        <PlayerGameCardHeader game={game} />
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
              <PlayerGameCardPlayerStats game={game} />
            </AccordionSummary>

            <AccordionDetails>
              <PlayerGameCardDetails game={game} onEditEntry={onEditEntry} />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </CardOverflow>
    </Card>
  )
}
