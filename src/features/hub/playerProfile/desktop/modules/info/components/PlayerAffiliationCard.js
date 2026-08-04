// features/hub/playerProfile/desktop/modules/info/components/PlayerAffiliationCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import PlayerAffiliationFields from '../../../../../../../ui/forms/players/edit/PlayerAffiliationFields.js'

import { sharedSx as sx } from './sx/shared.sx.js'

const TEXT = {
  title: 'שיוך',
  club: 'מועדון',
  team: 'קבוצה',
}

export default function PlayerAffiliationCard({
  draft,
  clubsOptions = [],
  teamsOptions = [],
}) {
  const hasClub = Boolean(draft?.clubId)
  const hasTeam = Boolean(draft?.teamId)

  return (
    <Sheet variant="outlined" sx={sx.card}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitle}>
          <Typography level="title-md" noWrap>
            {TEXT.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip
            size="sm"
            variant="soft"
            color={hasClub ? 'primary' : 'neutral'}
          >
            {TEXT.club}
          </Chip>

          <Chip
            size="sm"
            variant="soft"
            color={hasTeam ? 'primary' : 'neutral'}
          >
            {TEXT.team}
          </Chip>
        </Box>
      </Box>

      <PlayerAffiliationFields
        draft={draft}
        clubsOptions={clubsOptions}
        teamsOptions={teamsOptions}
        layout={sx.formGrid2}
      />
    </Sheet>
  )
}
