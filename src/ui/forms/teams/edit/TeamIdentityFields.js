// ui/forms/teams/edit/TeamIdentityFields.js

import React from 'react'
import { Box } from '@mui/joy'

import ClubNameField from '../../../fields/clubs/ClubNameField.js'
import TeamActiveSelector from '../../../fields/teams/TeamActiveSelector.js'
import TeamNameField from '../../../fields/teams/TeamNameField.js'
import TeamProjectSelector from '../../../fields/teams/TeamProjectSelector.js'
import YearPicker from '../../../fields/core/YearPicker.js'

export default function TeamIdentityFields({
  draft,
  onField,
  layout,
  statusLayout,
  disabled = false,
  fieldDisabled = {},
  clubName = '',
  showClub = false,
  showStatus = true,
  teamNameError = false,
  teamNameHelper = '',
}) {
  return (
    <Box sx={layout}>
      <TeamNameField
        required
        size='sm'
        value={draft?.teamName || ''}
        error={teamNameError}
        helperText={teamNameHelper}
        disabled={disabled || fieldDisabled?.teamName}
        onChange={(value) => onField('teamName', value)}
      />

      {showClub ? (
        <ClubNameField
          required
          readOnly
          size='sm'
          value={clubName}
          onChange={() => {}}
          helperText='שיוך מועדון נקבע מתוך הפרופיל'
        />
      ) : null}

      <YearPicker
        required
        clearable={false}
        label='שנתון'
        size='sm'
        value={draft?.teamYear || ''}
        range={{
          past: 20,
          future: 0,
        }}
        disabled={disabled || fieldDisabled?.teamYear}
        onChange={(value) => onField('teamYear', value)}
      />

      {showStatus ? (
        <Box sx={statusLayout}>
          <TeamProjectSelector
            size='sm'
            value={draft?.project === true}
            disabled={disabled || fieldDisabled?.project}
            onChange={(value) => onField('project', value)}
          />

          <TeamActiveSelector
            size='sm'
            value={draft?.active === true}
            disabled={disabled || fieldDisabled?.active}
            onChange={(value) => onField('active', value)}
          />
        </Box>
      ) : null}
    </Box>
  )
}
