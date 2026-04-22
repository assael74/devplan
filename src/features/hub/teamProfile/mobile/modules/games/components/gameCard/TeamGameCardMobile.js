// teamProfile/mobile/modules/games/components/gameCard/TeamGameCardMobile.js

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

import TeamGameCardHeader from './TeamGameCardHeader.js'
import TeamGameCardTeamStats from './TeamGameCardTeamStats.js'
import TeamGameCardDetails from './TeamGameCardDetails.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function TeamGameCardMobile({
  game,
  onEdit,
  onEditEntry,
  defaultExpanded = false,
}) {
  if (!game) return null

  const handleOpenEdit = () => {
    onEdit?.(game)
  }

  return (
    <Card size="sm" variant="outlined" sx={sx.card}>
      <CardContent
        sx={{
          cursor: 'pointer',
          transition: 'background-color .15s ease',
          '&:active': {
            bgcolor: 'background.level1',
          },
        }}
        onClick={handleOpenEdit}
      >
        <TeamGameCardHeader game={game} />
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
              <TeamGameCardTeamStats game={game} />
            </AccordionSummary>

            <AccordionDetails>
              <TeamGameCardDetails game={game} onEditEntry={onEditEntry} />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </CardOverflow>
    </Card>
  )
}
