// clubProfile/mobile/modules/teams/components/playerCard/ClubTeamCardMobile.js

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

import ClubTeamCardHeader from './ClubTeamCardHeader.js'
import ClubTeamCardSummary from './ClubTeamCardSummary.js'
import ClubTeamCardDetails from './ClubTeamCardDetails.js'

import { cardSx as sx } from '../../sx/card.mobile.sx.js'

export default function ClubTeamCardMobile({
  row,
  onOpenTeam,
  onEditTeam,
  onAvatarClick,
  defaultExpanded = false,
}) {
  if (!row) return null

  const handleOpenTeam = () => {
    onOpenTeam?.(row?.team || row)
  }

  return (
    <Card size="sm" variant="outlined" sx={sx.card}>
      <CardContent
        sx={{
          cursor: typeof onOpenTeam === 'function' ? 'pointer' : 'default',
          transition: 'background-color .15s ease',
          '&:active': {
            bgcolor: 'background.level1',
          },
        }}
        onClick={handleOpenTeam}
      >
        <ClubTeamCardHeader
          row={row}
          onAvatarClick={onAvatarClick}
          onOpenPlayer={onOpenTeam}
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
              <ClubTeamCardSummary row={row} />
            </AccordionSummary>

            <AccordionDetails>
              <ClubTeamCardDetails
                row={row}
                onEditTeam={onEditTeam}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </CardOverflow>
    </Card>
  )
}
