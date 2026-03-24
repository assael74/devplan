/// ui/forms/TeamCreateForm.js
import React, { useEffect, useMemo } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import TeamNameField from '../fields/inputUi/teams/TeamNameField'
import ClubSelectField from '../fields/selectUi/clubs/ClubSelectField'
import YearPicker from '../fields/dateUi/YearPicker'
import TeamProjectSelector from '../fields/checkUi/teams/TeamProjectSelector'
import TeamIfaLinkField from '../fields/inputUi/teams/TeamIfaLinkField'

const clean = (v) => String(v ?? '').trim()

export default function TeamCreateForm({
  draft,
  onDraft,
  context,
  onValidChange,
}) {
  const teamName = draft?.teamName || ''
  const clubId = draft?.clubId || ''
  const teamYear = draft?.teamYear || ''
  const isProject = draft?.isProject === true
  const teamIfaLink = draft?.teamIfaLink || ''
  const clubs = context?.clubs || []

  const validity = useMemo(() => {
    const okName = clean(teamName).length >= 2
    const okClub = !!clean(clubId)
    const okYear = !!clean(teamYear)
    return { okName, okClub, okYear, isValid: okName && okClub && okYear }
  }, [teamName, clubId, teamYear])

  useEffect(() => {
    if (typeof onValidChange === 'function') onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const nameErr = !validity.okName && clean(teamName).length > 0
  const clubErr = !validity.okClub && clean(clubId).length > 0
  const yearErr = !validity.okYear && clean(teamYear).length > 0

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>

      <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
        <TeamNameField
          required
          value={teamName}
          onChange={(v) => onDraft({ ...draft, teamName: v })}
          error={nameErr}
          size="sm"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        <ClubSelectField
          required
          value={clubId}
          options={clubs}
          onChange={(v) => onDraft({ ...draft, clubId: v })}
          error={clubErr}
          size="sm"
        />
        <YearPicker
          label="שנתון"
          value={teamYear}
          onChange={(v) => onDraft({ ...draft, teamYear: v })}
          required
          clearable={false}
          range={{ past: 20, future: 0 }}
          size="sm"
          sx={{ width: '100%' }}
        />
      </Box>

      <Box sx={{ display: 'grid', alignItems: 'center', gridTemplateColumns: '0.60fr 1.40fr', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <TeamProjectSelector
            value={isProject}
            onChange={(v) => onDraft({ ...draft, isProject: v })}
            size="sm"
          />
        </Box>
        <TeamIfaLinkField
          value={teamIfaLink}
          onChange={(v) => onDraft({ ...draft, teamIfaLink: v })}
          required={false}
          size="sm"
        />
      </Box>

    </Box>
  )
}
