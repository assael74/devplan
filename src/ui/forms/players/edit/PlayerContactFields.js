// ui/forms/players/edit/PlayerContactFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  PhoneField,
  PlayerActiveSelector,
  PlayerIfaLinkField,
  SquadRoleSelectField,
} from '../../../fields'

export default function PlayerContactFields({
  draft,
  onField,
  disabled = false,
  topLayout,
  bottomLayout,
  size = 'sm',
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1, minWidth: 0 }}>
      <Box sx={topLayout}>
        <Box sx={{ minWidth: 0, width: '100%', pt: 2 }}>
          <PlayerActiveSelector
            value={draft?.active === true}
            disabled={disabled}
            onChange={(value) => onField('active', value)}
          />
        </Box>

        <PlayerIfaLinkField
          value={draft?.ifaLink || ''}
          disabled={disabled}
          onChange={(value) => onField('ifaLink', value)}
          size={size}
        />
      </Box>

      <Box sx={bottomLayout}>
        <PhoneField
          size={size}
          value={draft?.phone || ''}
          disabled={disabled}
          onChange={(value) => onField('phone', value)}
        />

        <SquadRoleSelectField
          size={size}
          value={draft?.squadRole || ''}
          disabled={disabled}
          onChange={(value) => onField('squadRole', value || '')}
        />
      </Box>
    </Box>
  )
}
