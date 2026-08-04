// ui/forms/players/edit/PlayerIdentityFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  PlayerIfaLinkField,
  PlayerShortNameField,
} from '../../../fields'

export default function PlayerIdentityFields({
  draft,
  onField,
  disabled = false,
  layout,
  size = 'sm',
}) {
  return (
    <Box sx={layout}>
      <PlayerShortNameField
        size={size}
        value={draft?.playerShortName || ''}
        onChange={(value) => onField('playerShortName', value)}
        disabled={disabled}
      />

      <PlayerIfaLinkField
        size={size}
        value={draft?.ifaLink || ''}
        onChange={(value) => onField('ifaLink', value)}
        disabled={disabled}
      />
    </Box>
  )
}
