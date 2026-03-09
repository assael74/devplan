// ui/forms/ClubCreateForm.js
import React, { useEffect, useMemo } from 'react'
import Box from '@mui/joy/Box'

import ClubNameField from '../fields/inputUi/clubs/ClubNameField'
import ClubIfaLinkField from '../fields/inputUi/clubs/ClubIfaLinkField'

const clean = (v) => String(v ?? '').trim()

export default function ClubCreateForm({ draft, onDraft, onValidChange }) {
  const clubName = draft?.clubName ?? ''
  const clubIfaLink = draft?.clubIfaLink ?? ''

  const isValid = useMemo(() => clean(clubName).length >= 2, [clubName])

  useEffect(() => {
    if (typeof onValidChange === 'function') onValidChange(isValid)
  }, [isValid, onValidChange])

  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <ClubNameField
        required
        value={clubName}
        onChange={(v) => onDraft({ ...draft, clubName: v })}
        error={!isValid && clean(clubName).length > 0}
        helperText={isValid ? 'תקין' : 'נדרש מינימום 2 תווים'}
        size="sm"
      />

      <ClubIfaLinkField
        value={clubIfaLink}
        onChange={(v) => onDraft({ ...draft, clubIfaLink: v })}
        size="sm"
        required={false}
      />
    </Box>
  )
}
