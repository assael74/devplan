// ui/forms/parents/ParentFields.js

import React from 'react'
import { Box } from '@mui/joy'

import ParentNameField from '../../fields/parents/ParentNameField.js'
import EmailField from '../../fields/parents/EmailField.js'
import PhoneField from '../../fields/parents/PhoneField.js'
import ParentRoleSelectField from '../../fields/parents/ParentRoleSelectField.js'

import { parentFieldsSx as sx } from './sx/parentFields.sx.js'

const updateDraft = (draft, onDraft, key, value) => {
  onDraft({
    ...draft,
    [key]: value || '',
  })
}

export default function ParentFields({
  draft,
  onDraft,
  layout,
  errors = {},
  disabled = false,
  readOnly = false,
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.row(layout.identityCols, layout.gap)}>
        <Box sx={sx.field}>
          <ParentRoleSelectField
            value={draft?.parentRole || ''}
            error={errors.parentRole}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(value) => {
              updateDraft(draft, onDraft, 'parentRole', value)
            }}
          />
        </Box>

        <Box sx={sx.field}>
          <ParentNameField
            value={draft?.parentName || ''}
            error={errors.parentName}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(value) => {
              updateDraft(draft, onDraft, 'parentName', value)
            }}
          />
        </Box>
      </Box>

      <Box sx={sx.row(layout.contactCols, layout.gap)}>
        <Box sx={sx.field}>
          <EmailField
            value={draft?.parentEmail || ''}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(value) => {
              updateDraft(draft, onDraft, 'parentEmail', value)
            }}
          />
        </Box>

        <Box sx={sx.field}>
          <PhoneField
            value={draft?.parentPhone || ''}
            error={errors.parentPhone}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(value) => {
              updateDraft(draft, onDraft, 'parentPhone', value)
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
