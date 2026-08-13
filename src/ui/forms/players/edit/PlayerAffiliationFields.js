// ui/forms/players/edit/PlayerAffiliationFields.js

import React from 'react'
import { Box, FormControl, FormLabel, Input } from '@mui/joy'

import {
  ClubSelectField,
  TeamSelectField,
} from '../../../fields'

export default function PlayerAffiliationFields({
  draft,
  onDraft,
  clubsOptions = [],
  teamsOptions = [],
  layout,
  size = 'sm',
  disabled = true,
  hideTeam = false,
  disableTeam = true,
  freeText = false,
}) {
  const handleClubChange = (clubId) => {
    if (!onDraft) return
    onDraft({
      ...draft,
      clubId,
      teamId: hideTeam ? '' : draft?.teamId || '',
    })
  }

  const handleTeamChange = (teamId) => {
    if (!onDraft) return
    onDraft({
      ...draft,
      teamId,
    })
  }

  const handleTextChange = (key) => (event) => {
    if (!onDraft) return
    onDraft({
      ...draft,
      [key]: event.target.value,
    })
  }

  if (freeText) {
    return (
      <Box sx={layout}>
        <FormControl disabled={disabled}>
          <FormLabel>מועדון</FormLabel>
          <Input
            size={size}
            value={draft?.clubName || ''}
            onChange={handleTextChange('clubName')}
            placeholder="שם מועדון"
          />
        </FormControl>

        <FormControl disabled={disabled}>
          <FormLabel>קבוצה</FormLabel>
          <Input
            size={size}
            value={draft?.teamName || ''}
            onChange={handleTextChange('teamName')}
            placeholder="שם קבוצה"
          />
        </FormControl>
      </Box>
    )
  }

  return (
    <Box sx={layout}>
      <ClubSelectField
        size={size}
        value={draft?.clubId || ''}
        onChange={handleClubChange}
        options={clubsOptions}
        disabled={disabled}
      />

      {hideTeam ? null : (
        <TeamSelectField
          size={size}
          value={draft?.teamId || ''}
          onChange={handleTeamChange}
          options={teamsOptions}
          clubId={draft?.clubId || ''}
          disabled={disabled || disableTeam}
          chip={false}
        />
      )}
    </Box>
  )
}
