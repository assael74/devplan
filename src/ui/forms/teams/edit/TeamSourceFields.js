// ui/forms/teams/edit/TeamSourceFields.js

import React from 'react'
import { Box } from '@mui/joy'

import TeamIfaLinkField from '../../../fields/teams/TeamIfaLinkField.js'

export default function TeamSourceFields({
  draft,
  onField,
  layout,
  disabled = false,
  fieldDisabled = {},
}) {
  return (
    <Box sx={layout}>
      <TeamIfaLinkField
        size='sm'
        value={draft?.ifaLink || ''}
        disabled={disabled || fieldDisabled?.ifaLink}
        onChange={(value) => onField('ifaLink', value)}
      />
    </Box>
  )
}
