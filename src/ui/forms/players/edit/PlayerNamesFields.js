// ui/forms/players/edit/PlayerNamesFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  PlayerFirstNameField,
  PlayerLastNameField,
  PlayerShortNameField,
} from '../../../fields'

export default function PlayerNamesFields({
  draft,
  onField,
  disabled = false,
  layout,
  showShortName = false,
  size = 'sm',
}) {
  return (
    <Box sx={layout}>
      <PlayerFirstNameField
        size={size}
        value={draft?.playerFirstName || ''}
        onChange={(value) => onField('playerFirstName', value)}
        disabled={disabled}
      />

      <PlayerLastNameField
        size={size}
        value={draft?.playerLastName || ''}
        onChange={(value) => onField('playerLastName', value)}
        disabled={disabled}
      />

      {showShortName ? (
        <PlayerShortNameField
          size={size}
          value={draft?.playerShortName || ''}
          onChange={(value) => onField('playerShortName', value)}
          disabled={disabled}
        />
      ) : null}
    </Box>
  )
}
