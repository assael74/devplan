// ui/forms/scouting/ScoutFields.js

import React from 'react'
import { Box } from '@mui/joy'

import PhoneField from '../../fields/core/PhoneField.js'
import GenericInputField from '../../fields/core/GenericInputField.js'
import ScoutFullNameField from '../../fields/scouting/ScoutFullNameField.js'
import ScoutIfaLinkField from '../../fields/scouting/ScoutIfaLinkField.js'

import { scoutFieldsSx as sx } from './sx/scoutFields.sx.js'

const updateDraft = (draft, onDraft, key, value) => {
  onDraft({
    ...draft,
    [key]: value || '',
  })
}

export default function ScoutFields({
  draft,
  onDraft,
  layout,
  disabled = false,
  readOnly = false,
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.row(layout.identityCols, layout.gap)}>
        <ScoutFullNameField
          value={draft?.playerName || ''}
          size="sm"
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft(draft, onDraft, 'playerName', value)
          }}
        />

        <PhoneField
          value={draft?.phone || ''}
          size="sm"
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft(draft, onDraft, 'phone', value)
          }}
        />

        <ScoutIfaLinkField
          value={draft?.ifaLink || ''}
          size="sm"
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft(draft, onDraft, 'ifaLink', value)
          }}
        />
      </Box>

      <Box sx={sx.row(layout.affiliationCols, layout.gap)}>
        <GenericInputField
          value={draft?.clubName || ''}
          label="שם מועדון"
          size="sm"
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft(draft, onDraft, 'clubName', value)
          }}
        />

        <GenericInputField
          value={draft?.teamName || ''}
          label="שם קבוצה"
          size="sm"
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft(draft, onDraft, 'teamName', value)
          }}
        />

        <GenericInputField
          value={draft?.league || ''}
          label="ליגה"
          size="sm"
          disabled={disabled}
          readOnly={readOnly}
          onChange={(value) => {
            updateDraft(draft, onDraft, 'league', value)
          }}
        />
      </Box>

      <GenericInputField
        value={draft?.notes || ''}
        label="הערות"
        size="sm"
        disabled={disabled}
        readOnly={readOnly}
        onChange={(value) => {
          updateDraft(draft, onDraft, 'notes', value)
        }}
      />
    </Box>
  )
}
