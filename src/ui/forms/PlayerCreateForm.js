/// ui/forms/PlayerCreateForm.js
import React, { useEffect, useMemo } from 'react'
import Box from '@mui/joy/Box'

import PlayerFirstNameField from '../fields/inputUi/players/PlayerFirstNameField'
import PlayerLastNameField from '../fields/inputUi/players/PlayerLastNameField'
import ClubSelectField from '../fields/selectUi/clubs/ClubSelectField'
import TeamSelectField from '../fields/selectUi/teams/TeamSelectField'
import MonthYearPicker from '../fields/dateUi/MonthYearPicker'

const clean = (v) => String(v ?? '').trim()

export default function PlayerCreateForm({
  draft,
  onDraft,
  onValidChange,
  context,
}) {
  const playerFirstName = draft?.playerFirstName ?? ''
  const playerLastName = draft?.playerLastName ?? ''
  const clubId = draft?.clubId ?? ''
  const teamId = draft?.teamId ?? ''
  const birth = draft?.birth ?? ''
  const clubs = context?.clubs || []
  const teams = context?.teams || []

  const validity = useMemo(() => {
    const okFirst = clean(playerFirstName).length >= 2
    const okLast = clean(playerLastName).length >= 2
    const okClub = !!clean(clubId)
    const okTeam = !!clean(teamId)
    const okBirth = !!clean(birth)
    return { okFirst, okLast, okClub, okTeam, okBirth, isValid: okFirst && okLast && okClub && okTeam && okBirth }
  }, [playerFirstName, playerLastName, clubId, teamId, birth])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        <PlayerFirstNameField
          required
          value={playerFirstName}
          onChange={(v) => onDraft({ ...draft, playerFirstName: v })}
          error={!validity.okFirst && clean(playerFirstName).length > 0}
          size="sm"
        />
        <PlayerLastNameField
          required
          value={playerLastName}
          onChange={(v) => onDraft({ ...draft, playerLastName: v })}
          error={!validity.okLast && clean(playerLastName).length > 0}
          size="sm"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        <ClubSelectField
          required
          value={clubId}
          options={clubs}
          onChange={(v) => {
            const nextClubId = v || ''
            onDraft({ ...draft, clubId: nextClubId, teamId: '' })
          }}
          error={!validity.okClub && clean(clubId).length > 0}
          size="sm"
        />
        <TeamSelectField
          required
          value={teamId}
          clubId={clubId}
          options={teams}
          onChange={(v) => onDraft({ ...draft, teamId: v })}
          error={!validity.okTeam && clean(teamId).length > 0}
          size="sm"
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        <MonthYearPicker
          context="birth"
          required
          value={birth}
          onChange={(v) => onDraft({ ...draft, birth: v })}
          size="sm"
          error={!validity.okBirth && clean(birth).length > 0}
        />
      </Box>

    </Box>
  )
}
