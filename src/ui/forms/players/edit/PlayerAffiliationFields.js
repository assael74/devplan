// ui/forms/players/edit/PlayerAffiliationFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  ClubSelectField,
  TeamSelectField,
} from '../../../fields'

export default function PlayerAffiliationFields({
  draft,
  clubsOptions = [],
  teamsOptions = [],
  layout,
  size = 'sm',
}) {
  return (
    <Box sx={layout}>
      <ClubSelectField
        size={size}
        value={draft?.clubId || ''}
        options={clubsOptions}
        disabled
      />

      <TeamSelectField
        size={size}
        value={draft?.teamId || ''}
        options={teamsOptions}
        clubId={draft?.clubId || ''}
        disabled
        chip={false}
      />
    </Box>
  )
}
