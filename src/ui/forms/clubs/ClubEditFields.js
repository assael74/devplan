// ui/forms/clubs/ClubEditFields.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import ClubNameField from '../../fields/clubs/ClubNameField.js'
import ClubIfaLinkField from '../../fields/clubs/ClubIfaLinkField.js'
import ClubActiveSelector from '../../fields/clubs/ClubActiveSelector.js'

import { getClubEditFormLayout } from './edit.layout.js'
import { editSx as sx } from './sx/edit.sx.js'

export default function ClubEditFields({
  draft = {},
  onDraft,
  variant = 'modal',
  isMobile = false,
  disabled = false,
  readOnly = false,
  required = true,
  size = 'sm',
}) {
  const layout = useMemo(() => {
    return getClubEditFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  const updateDraft = (patch) => {
    if (disabled || readOnly || typeof onDraft !== 'function') return

    onDraft({
      ...draft,
      ...patch,
    })
  }

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.field('status')}>
        <Box sx={sx.status}>
          <ClubActiveSelector
            size={size}
            value={draft.active === true}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(value) => {
              updateDraft({ active: Boolean(value) })
            }}
          />
        </Box>
      </Box>

      <Box sx={sx.field('name')}>
        <ClubNameField
          required={required}
          size={size}
          value={draft.clubName || ''}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft({ clubName: value || '' })
          }}
        />
      </Box>

      <Box sx={sx.field('link')}>
        <ClubIfaLinkField
          size={size}
          value={draft.ifaLink || ''}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft({ ifaLink: value || '' })
          }}
        />
      </Box>
    </Box>
  )
}
